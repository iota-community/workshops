//imports

export class CryptoUtils {
  /**
   * Compute SHA-256 hash of a file buffer or string
   */
  static computeSHA256(data: Buffer | string): string {
    // TODO: implement SHA-256 hashing
    return "";
  }

  /**
   * Compute file hash from Buffer (for uploaded files)
   */
  static computeFileHash(fileBuffer: Buffer): string {
    // TODO: reuse computeSHA256
    return "";
  }

  /**
   * Validate if a string is a valid SHA-256 hash
   */
  
// Coding Challenge for completing isValidSHA256Hash
// Problem:-
// Write a function that validates whether a string is a valid SHA-256 hash.
// Rules:
// Exactly 64 characters
// Only hexadecimal characters (0–9, a–f)
// Case-insensitive
// “Don’t Google. Think regex.”

  static isValidSHA256Hash(hash: string): boolean {
    // TODO: validate 64-char hex string
    return false;
  }
}


