export async function hashCredentials(value: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(value);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Optional: Add encryption if you need to retrieve the actual password later
export async function encryptCredentials(value: string): Promise<string> {
  // This is a simplified version. In production, you'd want to use a proper key management system
  const encoder = new TextEncoder();
  const data = encoder.encode(value);
  const key = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt']
  );
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );
  return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
}