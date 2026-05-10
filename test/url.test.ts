import { test, expect } from "bun:test";
import {
  parseSpeckleUrl,
  buildSpeckleUrl,
  parseResourceIdString,
  buildResourceIdString,
  SpeckleUrlError,
} from "../src/url.js";

test("parseResourceIdString: empty input returns empty array", () => {
  expect(parseResourceIdString("")).toEqual([]);
  expect(parseResourceIdString("   ")).toEqual([]);
});

test("parseResourceIdString: single modelId without version", () => {
  expect(parseResourceIdString("m1")).toEqual([{ modelId: "m1" }]);
});

test("parseResourceIdString: single modelId@versionId", () => {
  expect(parseResourceIdString("m1@v1")).toEqual([
    { modelId: "m1", versionId: "v1" },
  ]);
});

test("parseResourceIdString: comma-separated mixed refs", () => {
  expect(parseResourceIdString("m1@v1,m2,m3@v3")).toEqual([
    { modelId: "m1", versionId: "v1" },
    { modelId: "m2" },
    { modelId: "m3", versionId: "v3" },
  ]);
});

test("parseResourceIdString: rejects extra @ delimiters", () => {
  expect(() => parseResourceIdString("m1@v1@x")).toThrow(SpeckleUrlError);
});

test("parseResourceIdString: rejects empty modelId before @", () => {
  expect(() => parseResourceIdString("@v1")).toThrow(/Missing modelId/);
});

test("parseResourceIdString: rejects trailing @ with no versionId", () => {
  expect(() => parseResourceIdString("m1@")).toThrow(/Missing versionId/);
});

test("parseResourceIdString: rejects empty segment in CSV", () => {
  expect(() => parseResourceIdString("m1,,m2")).toThrow(/Empty segment/);
});

test("buildResourceIdString round-trips parseResourceIdString", () => {
  const input = "m1@v1,m2,m3@v3";
  const refs = parseResourceIdString(input);
  expect(buildResourceIdString(refs)).toBe(input);
});

test("parseSpeckleUrl: project only", () => {
  const got = parseSpeckleUrl("https://app.speckle.systems/projects/abc");
  expect(got).toEqual({
    server: "https://app.speckle.systems",
    projectId: "abc",
    modelRefs: [],
  });
});

test("parseSpeckleUrl: trailing slash on project URL", () => {
  const got = parseSpeckleUrl("https://app.speckle.systems/projects/abc/");
  expect(got.projectId).toBe("abc");
  expect(got.modelRefs).toEqual([]);
});

test("parseSpeckleUrl: project + single model no version", () => {
  const got = parseSpeckleUrl("https://app.speckle.systems/projects/abc/models/m1");
  expect(got.modelRefs).toEqual([{ modelId: "m1" }]);
});

test("parseSpeckleUrl: project + model@version", () => {
  const got = parseSpeckleUrl(
    "https://app.speckle.systems/projects/abc/models/m1@v1",
  );
  expect(got.projectId).toBe("abc");
  expect(got.modelRefs).toEqual([{ modelId: "m1", versionId: "v1" }]);
});

test("parseSpeckleUrl: project + multiple model refs", () => {
  const got = parseSpeckleUrl(
    "https://app.speckle.systems/projects/abc/models/m1@v1,m2",
  );
  expect(got.modelRefs).toEqual([
    { modelId: "m1", versionId: "v1" },
    { modelId: "m2" },
  ]);
});

test("parseSpeckleUrl: handles non-default server", () => {
  const got = parseSpeckleUrl("https://acme.speckle.example/projects/abc");
  expect(got.server).toBe("https://acme.speckle.example");
});

test("parseSpeckleUrl: handles port", () => {
  const got = parseSpeckleUrl("http://localhost:3000/projects/abc/models/m1");
  expect(got.server).toBe("http://localhost:3000");
  expect(got.projectId).toBe("abc");
});

test("parseSpeckleUrl: ignores query and hash", () => {
  const got = parseSpeckleUrl(
    "https://app.speckle.systems/projects/abc/models/m1@v1?focus=overview#section",
  );
  expect(got.projectId).toBe("abc");
  expect(got.modelRefs[0]?.versionId).toBe("v1");
});

test("parseSpeckleUrl: decodes percent-encoded resource segment", () => {
  const got = parseSpeckleUrl(
    "https://app.speckle.systems/projects/abc/models/m1%40v1",
  );
  expect(got.modelRefs).toEqual([{ modelId: "m1", versionId: "v1" }]);
});

test("parseSpeckleUrl: rejects malformed URLs", () => {
  expect(() => parseSpeckleUrl("not a url")).toThrow(SpeckleUrlError);
});

test("parseSpeckleUrl: rejects URLs without /projects/{id}", () => {
  expect(() => parseSpeckleUrl("https://app.speckle.systems/users/me")).toThrow(
    /does not contain \/projects/,
  );
});

test("buildSpeckleUrl: project only", () => {
  expect(
    buildSpeckleUrl({ server: "https://app.speckle.systems", projectId: "abc" }),
  ).toBe("https://app.speckle.systems/projects/abc");
});

test("buildSpeckleUrl: strips trailing slash on server", () => {
  expect(
    buildSpeckleUrl({ server: "https://app.speckle.systems/", projectId: "abc" }),
  ).toBe("https://app.speckle.systems/projects/abc");
});

test("buildSpeckleUrl: appends models segment when refs given", () => {
  expect(
    buildSpeckleUrl({
      server: "https://app.speckle.systems",
      projectId: "abc",
      modelRefs: [
        { modelId: "m1", versionId: "v1" },
        { modelId: "m2" },
      ],
    }),
  ).toBe("https://app.speckle.systems/projects/abc/models/m1@v1,m2");
});

test("parseSpeckleUrl ↔ buildSpeckleUrl round-trip", () => {
  const original =
    "https://app.speckle.systems/projects/abc/models/m1@v1,m2";
  const parsed = parseSpeckleUrl(original);
  expect(buildSpeckleUrl(parsed)).toBe(original);
});
