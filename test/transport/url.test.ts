import { test, expect } from "bun:test";
import { toHttpEndpoint, toWsEndpoint } from "../../src/transport/url.js";

test("toHttpEndpoint trims trailing slash and appends /graphql", () => {
  expect(toHttpEndpoint("https://app.speckle.systems")).toBe(
    "https://app.speckle.systems/graphql",
  );
  expect(toHttpEndpoint("https://app.speckle.systems/")).toBe(
    "https://app.speckle.systems/graphql",
  );
});

test("toWsEndpoint maps https→wss and http→ws", () => {
  expect(toWsEndpoint("https://app.speckle.systems")).toBe(
    "wss://app.speckle.systems/graphql",
  );
  expect(toWsEndpoint("http://localhost:3000")).toBe(
    "ws://localhost:3000/graphql",
  );
});

test("toWsEndpoint passes through ws:// and wss:// inputs", () => {
  expect(toWsEndpoint("wss://app.speckle.systems")).toBe(
    "wss://app.speckle.systems/graphql",
  );
  expect(toWsEndpoint("ws://localhost:3000")).toBe(
    "ws://localhost:3000/graphql",
  );
  expect(toWsEndpoint("wss://app.speckle.systems/")).toBe(
    "wss://app.speckle.systems/graphql",
  );
});
