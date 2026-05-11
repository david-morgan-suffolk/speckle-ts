import { test, expect } from "bun:test";
import { Speckle } from "../src/client.js";
import {
  makeGraphQLFetch,
  mockSpeckleWithWs,
  flushMicrotasks,
  projectHandler,
  projectInfoFixture,
  gqlError,
  httpError,
} from "./_helpers/index.js";
import type {
  SpeckleHooks,
  RequestEvent,
  ResponseEvent,
  ErrorEvent,
  SubscriptionEvent,
} from "../src/transport/hooks.js";

async function settle(): Promise<void> {
  await flushMicrotasks(8);
  await new Promise((r) => setTimeout(r, 10));
}

interface Collected {
  hooks: SpeckleHooks;
  requests: RequestEvent[];
  responses: ResponseEvent[];
  errors: ErrorEvent[];
  subEvents: SubscriptionEvent[];
}

function collectingHooks(): Collected {
  const requests: RequestEvent[] = [];
  const responses: ResponseEvent[] = [];
  const errors: ErrorEvent[] = [];
  const subEvents: SubscriptionEvent[] = [];
  return {
    hooks: {
      onRequest: (e) => requests.push(e),
      onResponse: (e) => responses.push(e),
      onError: (e) => errors.push(e),
      onSubscriptionEvent: (e) => subEvents.push(e),
    },
    requests,
    responses,
    errors,
    subEvents,
  };
}

test("onRequest + onResponse fire around a successful HTTP request", async () => {
  const c = collectingHooks();
  const { fetch } = makeGraphQLFetch({
    Project: projectHandler(projectInfoFixture()),
  });
  const sk = new Speckle({ token: "t", fetch, hooks: c.hooks });

  await sk.project("p1").get;

  expect(c.requests).toHaveLength(1);
  expect(c.requests[0]?.operationName).toBe("Project");
  expect(c.requests[0]?.variables).toEqual({ id: "p1" });
  expect(typeof c.requests[0]?.startedAt).toBe("number");

  expect(c.responses).toHaveLength(1);
  expect(c.responses[0]?.operationName).toBe("Project");
  expect(c.responses[0]?.status).toBe(200);
  expect((c.responses[0]?.durationMs ?? -1) >= 0).toBe(true);

  expect(c.errors).toHaveLength(0);
  await sk.dispose();
});

test("onResponse fires on GraphQL-error responses (status 200 with errors)", async () => {
  const c = collectingHooks();
  const { fetch } = makeGraphQLFetch({
    Project: () => gqlError({ message: "denied" }),
  });
  const sk = new Speckle({ token: "t", fetch, hooks: c.hooks });

  await expect(sk.project("p1").get).rejects.toThrow();

  expect(c.responses).toHaveLength(1);
  expect(c.responses[0]?.status).toBe(200);
  expect(c.errors).toHaveLength(0);
  await sk.dispose();
});

test("onResponse fires (not onError) for HTTP 5xx responses", async () => {
  const c = collectingHooks();
  const { fetch } = makeGraphQLFetch({
    Project: () => httpError(503, { message: "down" }),
  });
  const sk = new Speckle({ token: "t", fetch, hooks: c.hooks });

  await expect(sk.project("p1").get).rejects.toThrow();

  expect(c.responses).toHaveLength(1);
  expect(c.responses[0]?.status).toBe(503);
  expect(c.errors).toHaveLength(0);
  await sk.dispose();
});

test("onError fires when fetch itself throws", async () => {
  const c = collectingHooks();
  const sk = new Speckle({
    token: "t",
    fetch: (async () => {
      throw new Error("network down");
    }) as unknown as typeof fetch,
    hooks: c.hooks,
  });

  await expect(sk.project("p1").get).rejects.toThrow(/network down/);

  expect(c.responses).toHaveLength(0);
  expect(c.errors).toHaveLength(1);
  expect(c.errors[0]?.operationName).toBe("Project");
  expect((c.errors[0]?.error as Error).message).toBe("network down");
  await sk.dispose();
});

test("hook callback exceptions do not break the request path", async () => {
  const { fetch } = makeGraphQLFetch({
    Project: projectHandler(projectInfoFixture()),
  });
  const sk = new Speckle({
    token: "t",
    fetch,
    hooks: {
      onRequest: () => {
        throw new Error("hook boom");
      },
      onResponse: () => {
        throw new Error("hook boom");
      },
    },
  });

  const got = await sk.project("p1").get;
  expect(got.id).toBe("p1");
  await sk.dispose();
});

test("when no hooks are passed, fetch is not wrapped (single call only)", async () => {
  let called = 0;
  const baseFetch = (async () => {
    called += 1;
    return new Response(
      JSON.stringify({ data: { project: projectInfoFixture() } }),
      { status: 200, headers: { "content-type": "application/json" } },
    );
  }) as unknown as typeof fetch;

  const sk = new Speckle({ token: "t", fetch: baseFetch });
  await sk.project("p1").get;
  expect(called).toBe(1);
  await sk.dispose();
});

test("onSubscriptionEvent fires started, data, complete in order", async () => {
  const c = collectingHooks();
  const { sk, ws } = mockSpeckleWithWs({}, { token: "t", hooks: c.hooks });

  sk.project("p1").onVersionsUpdate(() => undefined);
  await settle();

  ws.emit("ProjectVersionsUpdated", {
    projectVersionsUpdated: { id: "1", type: "CREATED", version: { id: "v1" } },
  });
  await settle();

  ws.complete("ProjectVersionsUpdated");
  await settle();

  const kinds = c.subEvents.map((e) => e.kind);
  expect(kinds).toEqual(["started", "data", "complete"]);
  expect(c.subEvents[0]?.operationName).toBe("ProjectVersionsUpdated");
  expect(c.subEvents[0]?.variables).toEqual({ id: "p1" });
  expect(c.subEvents[1]?.payload).toMatchObject({
    projectVersionsUpdated: { type: "CREATED" },
  });

  await sk.dispose();
});

test("onSubscriptionEvent fires error kind on GraphQL errors mid-stream", async () => {
  const c = collectingHooks();
  const { sk, ws } = mockSpeckleWithWs({}, { token: "t", hooks: c.hooks });

  sk.project("p1").onVersionsUpdate(
    () => undefined,
    () => undefined,
  );
  await settle();

  ws.emitGraphQLErrors("ProjectVersionsUpdated", [{ message: "denied" }]);
  await settle();

  const kinds = c.subEvents.map((e) => e.kind);
  expect(kinds).toContain("started");
  expect(kinds).toContain("error");
  await sk.dispose();
});
