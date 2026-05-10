import { test, expect } from "bun:test";
import { wrapFetchWithApq, sha256Hex } from "../src/transport/apq.js";

interface CapturedReq {
  body: string;
  hashOnly: boolean;
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function makeBaseFetch(handler: (parsed: {
  query?: string;
  variables?: Record<string, unknown>;
  operationName?: string;
  extensions?: { persistedQuery?: { sha256Hash: string; version: number } };
}) => unknown | Response): {
  fetch: typeof fetch;
  calls: CapturedReq[];
} {
  const calls: CapturedReq[] = [];
  const fetchFn = (async (_url: unknown, init?: RequestInit) => {
    const body = (init?.body as string) ?? "{}";
    const parsed = JSON.parse(body);
    calls.push({ body, hashOnly: !parsed.query });
    const result = handler(parsed);
    if (result instanceof Response) return result;
    return jsonResponse({ data: result });
  }) as unknown as typeof fetch;
  return { fetch: fetchFn, calls };
}

test("disabled APQ leaves fetch identity-equal to base", () => {
  const base = (async () => new Response("")) as unknown as typeof fetch;
  expect(wrapFetchWithApq(base, undefined)).toBe(base);
  expect(wrapFetchWithApq(base, { enabled: false })).toBe(base);
});

test("first request sends hash only with persistedQuery extension", async () => {
  const { fetch: base, calls } = makeBaseFetch(() => ({ ok: true }));
  const wrapped = wrapFetchWithApq(base, { enabled: true });

  const query = "query Foo { x }";
  const expectedHash = await sha256Hex(query);
  await wrapped("/graphql", {
    method: "POST",
    body: JSON.stringify({ query, variables: { id: "1" } }),
  });

  expect(calls).toHaveLength(1);
  expect(calls[0]?.hashOnly).toBe(true);
  const sent = JSON.parse(calls[0]!.body);
  expect(sent.query).toBeUndefined();
  expect(sent.variables).toEqual({ id: "1" });
  expect(sent.extensions.persistedQuery).toEqual({
    version: 1,
    sha256Hash: expectedHash,
  });
});

test("server PERSISTED_QUERY_NOT_FOUND triggers retry with full query + hash", async () => {
  const expectedHash = await sha256Hex("query Foo { x }");
  let firstCall = true;
  const { fetch: base, calls } = makeBaseFetch(() => {
    if (firstCall) {
      firstCall = false;
      return jsonResponse({
        errors: [
          {
            message: "PersistedQueryNotFound",
            extensions: { code: "PERSISTED_QUERY_NOT_FOUND" },
          },
        ],
      });
    }
    return { ok: 1 };
  });
  const wrapped = wrapFetchWithApq(base, { enabled: true });

  const res = await wrapped("/graphql", {
    method: "POST",
    body: JSON.stringify({ query: "query Foo { x }" }),
  });

  expect(calls).toHaveLength(2);
  expect(calls[0]?.hashOnly).toBe(true);
  expect(calls[1]?.hashOnly).toBe(false);
  const second = JSON.parse(calls[1]!.body);
  expect(second.query).toBe("query Foo { x }");
  expect(second.extensions.persistedQuery.sha256Hash).toBe(expectedHash);
  expect((await res.json()).data.ok).toBe(1);
});

test("server PERSISTED_QUERY_NOT_SUPPORTED disables APQ for the rest of the session", async () => {
  let attempts = 0;
  const { fetch: base, calls } = makeBaseFetch(() => {
    attempts++;
    if (attempts === 1) {
      return jsonResponse({
        errors: [{ extensions: { code: "PERSISTED_QUERY_NOT_SUPPORTED" } }],
      });
    }
    return { ok: 1 };
  });
  const wrapped = wrapFetchWithApq(base, { enabled: true });

  await wrapped("/graphql", {
    method: "POST",
    body: JSON.stringify({ query: "query A { x }" }),
  });
  await wrapped("/graphql", {
    method: "POST",
    body: JSON.stringify({ query: "query B { y }" }),
  });

  // Call 1: hash-only attempt → NOT_SUPPORTED → fallback (full query)
  // Call 2: subsequent request bypasses APQ entirely
  expect(calls).toHaveLength(3);
  expect(calls[0]?.hashOnly).toBe(true);
  expect(calls[1]?.hashOnly).toBe(false);
  expect(calls[2]?.hashOnly).toBe(false);
});

test("non-2xx response from server is returned as-is without retry", async () => {
  let calls = 0;
  const fetchFn = (async () => {
    calls++;
    return new Response("upstream down", { status: 502, statusText: "Bad Gateway" });
  }) as unknown as typeof fetch;
  const wrapped = wrapFetchWithApq(fetchFn, { enabled: true });

  const res = await wrapped("/graphql", {
    method: "POST",
    body: JSON.stringify({ query: "query Foo { x }" }),
  });
  expect(res.status).toBe(502);
  expect(calls).toBe(1);
});

test("hash is cached across calls for the same query string", async () => {
  const { fetch: base, calls } = makeBaseFetch(() => ({ ok: true }));
  const wrapped = wrapFetchWithApq(base, { enabled: true });
  const query = "query Same { x }";

  await wrapped("/graphql", { method: "POST", body: JSON.stringify({ query }) });
  await wrapped("/graphql", { method: "POST", body: JSON.stringify({ query }) });

  const h1 = JSON.parse(calls[0]!.body).extensions.persistedQuery.sha256Hash;
  const h2 = JSON.parse(calls[1]!.body).extensions.persistedQuery.sha256Hash;
  expect(h1).toBe(h2);
});
