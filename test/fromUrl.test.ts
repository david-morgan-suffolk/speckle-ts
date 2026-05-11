import { test, expect, mock } from "bun:test";
import { Speckle } from "../src/client.js";
import { SpeckleUrlError } from "../src/url.js";
import { Model } from "../src/nodes/Model.js";
import { Version } from "../src/nodes/Version.js";

const noopFetch = mock(async () => new Response("{}", { status: 200 }));

test("instance fromUrl: project-only URL yields project + empty entries", () => {
  const sk = new Speckle({ fetch: noopFetch as unknown as typeof fetch });
  const refs = sk.fromUrl("https://app.speckle.systems/projects/abc");
  expect(refs.projectId).toBe("abc");
  expect(refs.project.id).toBe("abc");
  expect(refs.entries).toHaveLength(0);
  expect(refs.model).toBeNull();
  expect(refs.version).toBeNull();
});

test("instance fromUrl: model+version yields Model + Version refs", () => {
  const sk = new Speckle({ fetch: noopFetch as unknown as typeof fetch });
  const refs = sk.fromUrl(
    "https://app.speckle.systems/projects/abc/models/m1@v1",
  );
  expect(refs.entries).toHaveLength(1);
  expect(refs.entries[0]?.modelId).toBe("m1");
  expect(refs.entries[0]?.versionId).toBe("v1");
  expect(refs.entries[0]?.model).toBeInstanceOf(Model);
  expect(refs.entries[0]?.version).toBeInstanceOf(Version);
  expect(refs.model?.id).toBe("m1");
  expect(refs.version?.id).toBe("v1");
});

test("instance fromUrl: model without version yields version=null", () => {
  const sk = new Speckle({ fetch: noopFetch as unknown as typeof fetch });
  const refs = sk.fromUrl("https://app.speckle.systems/projects/abc/models/m1");
  expect(refs.entries[0]?.version).toBeNull();
  expect(refs.version).toBeNull();
  expect(refs.model?.id).toBe("m1");
});

test("instance fromUrl: multi-model URL yields one entry per ref", () => {
  const sk = new Speckle({ fetch: noopFetch as unknown as typeof fetch });
  const refs = sk.fromUrl(
    "https://app.speckle.systems/projects/abc/models/m1@v1,m2",
  );
  expect(refs.entries).toHaveLength(2);
  expect(refs.entries[0]?.versionId).toBe("v1");
  expect(refs.entries[1]?.versionId).toBeUndefined();
  expect(refs.entries[1]?.version).toBeNull();
});

test("instance fromUrl: throws SpeckleUrlError on server mismatch", () => {
  const sk = new Speckle({
    server: "https://app.speckle.systems",
    fetch: noopFetch as unknown as typeof fetch,
  });
  expect(() =>
    sk.fromUrl("https://acme.speckle.example/projects/abc"),
  ).toThrow(SpeckleUrlError);
});

test("instance fromUrl: server comparison ignores trailing slash and case", () => {
  const sk = new Speckle({
    server: "https://APP.speckle.systems/",
    fetch: noopFetch as unknown as typeof fetch,
  });
  const refs = sk.fromUrl("https://app.speckle.systems/projects/abc");
  expect(refs.projectId).toBe("abc");
});

test("instance fromUrl: does not fetch", () => {
  const fakeFetch = mock(async () => new Response("{}", { status: 200 }));
  const sk = new Speckle({ fetch: fakeFetch as unknown as typeof fetch });
  sk.fromUrl("https://app.speckle.systems/projects/abc/models/m1@v1");
  expect(fakeFetch).not.toHaveBeenCalled();
});

test("static fromUrl: parses server from URL and returns wired Speckle", () => {
  const fakeFetch = mock(async () => new Response("{}", { status: 200 }));
  const { speckle, refs } = Speckle.fromUrl(
    "https://acme.speckle.example/projects/abc/models/m1@v1",
    { token: "t", fetch: fakeFetch as unknown as typeof fetch },
  );
  expect(speckle.server).toBe("https://acme.speckle.example");
  expect(speckle.token).toBe("t");
  expect(refs.projectId).toBe("abc");
  expect(refs.version?.id).toBe("v1");
  expect(fakeFetch).not.toHaveBeenCalled();
});
