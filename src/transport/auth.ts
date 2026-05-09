export function bearer(token: string | undefined): string | null {
  return token ? `Bearer ${token}` : null;
}
