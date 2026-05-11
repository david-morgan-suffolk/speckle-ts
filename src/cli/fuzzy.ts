import Fuse, { type IFuseOptions } from "fuse.js";

export interface FuzzyResult<T> {
  item: T;
  score: number;
}

export interface FuzzyOptions {
  keys: ReadonlyArray<string>;
  threshold?: number;
  limit?: number;
}

export function fuzzyFind<T>(
  items: ReadonlyArray<T>,
  query: string,
  opts: FuzzyOptions,
): FuzzyResult<T>[] {
  if (!query) return [];
  const fuseOpts: IFuseOptions<T> = {
    keys: [...opts.keys],
    threshold: opts.threshold ?? 0.4,
    includeScore: true,
    ignoreLocation: true,
  };
  const fuse = new Fuse(items as T[], fuseOpts);
  const matches = fuse.search(query);
  const limited = opts.limit !== undefined ? matches.slice(0, opts.limit) : matches;
  return limited.map((m) => ({ item: m.item, score: m.score ?? 1 }));
}
