import { test, expect } from "bun:test";
import { toArray, take, chunked, find } from "../src/iter.js";

async function* gen<T>(items: T[]): AsyncIterable<T> {
  for (const x of items) yield x;
}

test("toArray drains iterable", async () => {
  expect(await toArray(gen([1, 2, 3]))).toEqual([1, 2, 3]);
});

test("take stops early without draining", async () => {
  let pulled = 0;
  async function* counted(): AsyncIterable<number> {
    for (let i = 0; i < 100; i++) {
      pulled++;
      yield i;
    }
  }
  const out = await take(counted(), 3);
  expect(out).toEqual([0, 1, 2]);
  expect(pulled).toBe(3);
});

test("take(0) returns empty without pulling", async () => {
  let pulled = 0;
  async function* counted(): AsyncIterable<number> {
    for (let i = 0; i < 10; i++) {
      pulled++;
      yield i;
    }
  }
  expect(await take(counted(), 0)).toEqual([]);
  expect(pulled).toBe(0);
});

test("chunked groups by size and flushes tail", async () => {
  const out: number[][] = [];
  for await (const c of chunked(gen([1, 2, 3, 4, 5]), 2)) out.push(c);
  expect(out).toEqual([[1, 2], [3, 4], [5]]);
});

test("chunked rejects size <= 0", async () => {
  await expect(toArray(chunked(gen([1]), 0))).rejects.toThrow(/size must be > 0/);
});

test("find returns first match and stops", async () => {
  let pulled = 0;
  async function* counted(): AsyncIterable<number> {
    for (let i = 0; i < 100; i++) {
      pulled++;
      yield i;
    }
  }
  expect(await find(counted(), (x) => x === 5)).toBe(5);
  expect(pulled).toBe(6);
});

test("find returns undefined when no match", async () => {
  expect(await find(gen([1, 2, 3]), (x) => x > 10)).toBeUndefined();
});
