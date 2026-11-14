type ClassValue = string | number | boolean | null | undefined;

export function cn(...parts: ClassValue[]): string {
  return parts.filter((part) => typeof part === 'string' && part).join(' ');
}
