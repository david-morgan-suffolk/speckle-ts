import { test, expect } from "bun:test";
import {
  makeGraphQLFetch,
  gqlError,
  httpError,
  paged,
  once,
} from "./graphql.js";
import { mockSpeckle } from "./speckle.js";
import { projectHandler, projectInfoFixture } from "./handlers/project.js";

test("dispatches by operation name parsed from query", async () => {
  const { fetch, calls } = makeGraphQLFetch({
    Foo: () => ({ ok: 1 }),
    Bar: () => ({ ok: 2 }),
  });

  const r1 = await fetch("/graphql", {
    method: "POST",
    body: JSON.stringify({ query: "query Foo { x }", variables: {} }),
  });
  const r2 = await fetch("/graphql", {
    method: "POST",
    body: JSON.stringify({ query: "query Bar { x }", variables: { id: "1" } }),
  });

  expect(await r1.json()).toEqual({ data: { ok: 1 } });
  expect(await r2.json()).toEqual({ data: { ok: 2 } });
  expect(calls.map((c) => c.operationName)).toEqual(["Foo", "Bar"]);
  expect(calls[1]?.variables).toEqual({ id: "1" });
});

test("prefers explicit operationName over query parsing", async () => {
  const { fetch, calls } = makeGraphQLFetch({ Real: () => ({ ok: true }) });
  await fetch("/graphql", {
    method: "POST",
    body: JSON.stringify({
      query: "query InQuery { x } query Real { y }",
      variables: {},
      operationName: "Real",
    }),
  });
  expect(calls[0]?.operationName).toBe("Real");
});

test("unhandled op throws by default; empty mode returns empty data", async () => {
  const strict = makeGraphQLFetch({});
  await expect(
    strict.fetch("/graphql", {
      method: "POST",
      body: JSON.stringify({ query: "query Missing { x }", variables: {} }),
    }),
  ).rejects.toThrow(/no handler for "Missing"/);

  const lax = makeGraphQLFetch({}, { unhandled: "empty" });
  const res = await lax.fetch("/graphql", {
    method: "POST",
    body: JSON.stringify({ query: "query Missing { x }", variables: {} }),
  });
  expect(await res.json()).toEqual({ data: {} });
});

test("gqlError() shapes a GraphQL error response", async () => {
  const { fetch } = makeGraphQLFetch({
    Boom: () => gqlError({ message: "kaboom", path: ["project"] }),
  });
  const res = await fetch("/graphql", {
    method: "POST",
    body: JSON.stringify({ query: "query Boom { x }", variables: {} }),
  });
  const body = await res.json();
  expect(body.data).toBeNull();
  expect(body.errors[0]).toEqual({ message: "kaboom", path: ["project"] });
});

test("httpError() shapes a non-200 response", async () => {
  const { fetch } = makeGraphQLFetch({
    Boom: () => httpError(503, { message: "down" }),
  });
  const res = await fetch("/graphql", {
    method: "POST",
    body: JSON.stringify({ query: "query Boom { x }", variables: {} }),
  });
  expect(res.status).toBe(503);
});

test("paged() walks pages then throws on exhaustion", async () => {
  const handler = paged([{ a: 1 }, { a: 2 }]);
  expect(await handler({ query: "query X { x }", variables: {} })).toEqual({ a: 1 });
  expect(await handler({ query: "query X { x }", variables: {} })).toEqual({ a: 2 });
  expect(() => handler({ query: "query X { x }", variables: {} })).toThrow(/exhausted/);
});

test("once() throws on second invocation", async () => {
  const handler = once({ a: 1 });
  expect(await handler({ query: "query X { x }", variables: {} })).toEqual({ a: 1 });
  expect(() => handler({ query: "query X { x }", variables: {} })).toThrow(/once:/);
});

test("mockSpeckle drives a real Speckle client through handlers", async () => {
  const project = projectInfoFixture({ id: "p_real" });
  const { sk, callsFor } = mockSpeckle({
    Project: projectHandler(project),
  });
  const got = await sk.project("p_real").get;
  expect(got.id).toBe("p_real");
  expect(callsFor("Project")).toHaveLength(1);
  expect(callsFor("Project")[0]?.variables).toEqual({ id: "p_real" });
  await sk.dispose();
});
