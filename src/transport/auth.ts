export function bearer(token: string | undefined): string | undefined {
  return token ? `Bearer ${token}` : undefined;
}
