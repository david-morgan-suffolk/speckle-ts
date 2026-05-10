export function trimTrailingSlash(url: string): string {
  return url.replace(/\/$/, "");
}

export function toHttpEndpoint(server: string): string {
  return `${trimTrailingSlash(server)}/graphql`;
}

export function toWsEndpoint(server: string): string {
  const trimmed = trimTrailingSlash(server);
  if (trimmed.startsWith("wss://") || trimmed.startsWith("ws://")) return `${trimmed}/graphql`;
  if (trimmed.startsWith("https://")) return `wss://${trimmed.slice("https://".length)}/graphql`;
  if (trimmed.startsWith("http://")) return `ws://${trimmed.slice("http://".length)}/graphql`;
  return `${trimmed}/graphql`;
}
