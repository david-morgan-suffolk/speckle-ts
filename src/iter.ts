export async function toArray<T>(it: AsyncIterable<T>): Promise<T[]> {
  const out: T[] = [];
  for await (const x of it) out.push(x);
  return out;
}

export async function take<T>(it: AsyncIterable<T>, n: number): Promise<T[]> {
  const out: T[] = [];
  if (n <= 0) return out;
  for await (const x of it) {
    out.push(x);
    if (out.length >= n) break;
  }
  return out;
}

export async function* chunked<T>(
  it: AsyncIterable<T>,
  size: number,
): AsyncIterable<T[]> {
  if (size <= 0) throw new Error("chunked: size must be > 0");
  let buf: T[] = [];
  for await (const x of it) {
    buf.push(x);
    if (buf.length >= size) {
      yield buf;
      buf = [];
    }
  }
  if (buf.length) yield buf;
}

export async function find<T>(
  it: AsyncIterable<T>,
  predicate: (x: T) => boolean,
): Promise<T | undefined> {
  for await (const x of it) if (predicate(x)) return x;
  return undefined;
}
