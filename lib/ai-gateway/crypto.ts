export function currentCredentialKeyVersion() {
  return 1;
}

export function decryptCredential(ciphertext: string, version: number) {
  return ciphertext; // stub
}

export function encryptCredential(plaintext: string) {
  return { ciphertext: plaintext, keyVersion: 1 };
}

export function credentialFingerprint(plaintext: string) {
  return plaintext.substring(0, 4) + '...';
}
