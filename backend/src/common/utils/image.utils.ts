export function isValidImageString(value: any): boolean {
  if (!value) return false;
  if (typeof value !== 'string') return false;
  const s = value.trim();
  // Accept data URIs (base64) or http/https URLs
  return /^data:image\//i.test(s) || /^https?:\/\//i.test(s);
}

export function isEmptyImageValue(value: any): boolean {
  // treat null, undefined, and empty string as empty/no-image
  return value === undefined || value === null || (typeof value === 'string' && value.trim() === '');
}
