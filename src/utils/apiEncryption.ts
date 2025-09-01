/**
 * Utility for securely handling API keys
 * 
 * This module handles the OpenAI API key encryption/decryption
 * without storing the plaintext key in the source code.
 */

// In-memory storage for the encrypted key and encryption phrase
let encryptedApiKey: string | null = null;
let encryptionPhrase: string | null = null;

// Store the encrypted API key and encryption phrase in memory
export const storeEncryptedApiKey = (encrypted: string, phrase: string) => {
  encryptedApiKey = encrypted;
  encryptionPhrase = phrase;
};

// Clear the sensitive data from memory
const clearApiKey = () => {
  encryptedApiKey = null;
  encryptionPhrase = null;
};

// XOR-based encryption/decryption
const xorCrypt = (text: string, key: string): string => {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const textChar = text.charCodeAt(i);
    const keyChar = key.charCodeAt(i % key.length);
    result += String.fromCharCode(textChar ^ keyChar);
  }
  return result;
};

// Get the decrypted API key for immediate use
export const getDecryptedApiKey = (): string | null => {
  if (!encryptedApiKey || !encryptionPhrase) return null;
  
  try {
    // Decrypt the key
    const decrypted = xorCrypt(encryptedApiKey, encryptionPhrase);
    
    // Schedule cleanup after short delay to minimize exposure
    setTimeout(() => {
      clearApiKey();
    }, 60000); // Clear after 1 minute
    
    return decrypted;
  } catch (error) {
    console.error('Error decrypting API key');
    return null;
  }
};

// Encrypt a plaintext API key
export const encryptApiKey = (plaintext: string, phrase: string): string => {
  return xorCrypt(plaintext, phrase);
};