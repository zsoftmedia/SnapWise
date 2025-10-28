export function isEmail(v: unknown): v is string {
  if (typeof v !== 'string') return false;
  // simple but safe enough for server-side validation
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export function isNonEmptyString(v: unknown, min = 1): v is string {
  return typeof v === 'string' && v.trim().length >= min;
}

export function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const out = {} as Pick<T, K>;
  for (const k of keys) out[k] = obj[k];
  return out;
}
