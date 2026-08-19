// Zero-Knowledge Web Crypto Module for Financial Needs Analysis
// Uses standard Web Crypto API (SubtleCrypto) with PBKDF2 key derivation and AES-GCM 256-bit encryption.

export interface EncryptedSyncPayload {
  version: number;
  updatedAt: string;
  iv: string; // Base64 encoded 12-byte IV
  salt: string; // Base64 encoded 16-byte Salt
  ciphertext: string; // Base64 encoded encrypted data
}

// Convert ArrayBuffer to Base64
function arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Convert Base64 to Uint8Array
function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Helper: Compress UTF-8 string with Deflate if supported
async function compressString(str: string): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);

  if (typeof CompressionStream !== "undefined") {
    try {
      const stream = new Blob([data as unknown as BlobPart]).stream().pipeThrough(new CompressionStream("deflate"));
      const response = new Response(stream);
      const buffer = await response.arrayBuffer();
      return new Uint8Array(buffer);
    } catch {
      // fallback to uncompressed
    }
  }
  return data;
}

// Helper: Decompress Deflate Uint8Array
async function decompressString(data: Uint8Array): Promise<string> {
  if (typeof DecompressionStream !== "undefined") {
    try {
      const stream = new Blob([data as unknown as BlobPart]).stream().pipeThrough(new DecompressionStream("deflate"));
      const response = new Response(stream);
      return await response.text();
    } catch {
      // fallback
    }
  }
  const decoder = new TextDecoder();
  return decoder.decode(data);
}

// Derive a 256-bit AES-GCM key from PIN using PBKDF2 with 100,000 iterations
async function deriveKey(pin: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const pinBuffer = encoder.encode(pin);

  const baseKey = await crypto.subtle.importKey(
    "raw",
    pinBuffer,
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt as unknown as BufferSource,
      iterations: 100000,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypt any JSON-serializable data with a user PIN
 */
export async function encryptPayload<T>(data: T, pin: string, version: number = 1): Promise<EncryptedSyncPayload> {
  if (!crypto?.subtle) {
    throw new Error("Web Crypto API is not available in this browser environment.");
  }

  const jsonStr = JSON.stringify(data);
  const compressed = await compressString(jsonStr);

  // Generate cryptographic salt (16 bytes) and IV (12 bytes)
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const key = await deriveKey(pin, salt);

  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv as unknown as BufferSource,
    },
    key,
    compressed as unknown as BufferSource
  );

  return {
    version,
    updatedAt: new Date().toISOString(),
    iv: arrayBufferToBase64(iv),
    salt: arrayBufferToBase64(salt),
    ciphertext: arrayBufferToBase64(encryptedBuffer),
  };
}

/**
 * Decrypt an EncryptedSyncPayload using the user's PIN
 */
export async function decryptPayload<T>(payload: EncryptedSyncPayload, pin: string): Promise<T> {
  if (!crypto?.subtle) {
    throw new Error("Web Crypto API is not available in this browser environment.");
  }

  if (!payload || !payload.iv || !payload.salt || !payload.ciphertext) {
    throw new Error("Invalid encrypted payload structure.");
  }

  const salt = base64ToUint8Array(payload.salt);
  const iv = base64ToUint8Array(payload.iv);
  const ciphertext = base64ToUint8Array(payload.ciphertext);

  const key = await deriveKey(pin, salt);

  let decryptedBuffer: ArrayBuffer;
  try {
    decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv as unknown as BufferSource,
      },
      key,
      ciphertext as unknown as BufferSource
    );
  } catch {
    throw new Error("Incorrect PIN. Please check your PIN and try again.");
  }

  const decompressedStr = await decompressString(new Uint8Array(decryptedBuffer));
  return JSON.parse(decompressedStr) as T;
}
