import { test, expect } from "bun:test";
import {
  mockSpeckle,
  modelVersionsHandler,
  versionFixture,
  sequence,
} from "../_helpers/index.js";

const v = (id: string, msg: string | null = null) =>
  versionFixture(id, { message: msg, sourceApplication: "rhino" });

test("Model.listVersions parses page", async () => {
  const { sk, callsFor } = mockSpeckle({
    GetModelVersions: modelVersionsHandler({
      totalCount: 2,
      cursor: null,
      items: [v("v1"), v("v2", "tweak")],
    }),
  });
  const page = await sk.project("p1").model("m1").listVersions({ limit: 50 });
  expect(page.totalCount).toBe(2);
  expect(page.cursor).toBeNull();
  expect(page.items[1]?.message).toBe("tweak");
  expect(callsFor("GetModelVersions")[0]?.variables).toMatchObject({
    projectId: "p1",
    modelId: "m1",
    limit: 50,
  });
  await sk.dispose();
});

test("Model.listAllVersions pages until cursor null", async () => {
  const { sk, callsFor } = mockSpeckle({
    GetModelVersions: sequence([
      modelVersionsHandler({ totalCount: 4, cursor: "c1", items: [v("a"), v("b")] }),
      modelVersionsHandler({ totalCount: 4, cursor: "c2", items: [v("c")] }),
      modelVersionsHandler({ totalCount: 4, cursor: null, items: [v("d")] }),
    ]),
  });
  const items = await sk.project("p1").model("m1").listAllVersions();
  expect(items.map((x) => x.id)).toEqual(["a", "b", "c", "d"]);
  expect(callsFor("GetModelVersions")).toHaveLength(3);
  await sk.dispose();
});

test("Model.versions() iterator yields across pages and stops early", async () => {
  const { sk, callsFor } = mockSpeckle({
    GetModelVersions: sequence([
      modelVersionsHandler({ totalCount: 4, cursor: "c1", items: [v("a"), v("b")] }),
      modelVersionsHandler({ totalCount: 4, cursor: "c2", items: [v("c")] }),
      modelVersionsHandler({ totalCount: 4, cursor: null, items: [v("d")] }),
    ]),
  });

  const seen: string[] = [];
  for await (const ver of sk.project("p1").model("m1").versions()) {
    seen.push(ver.id);
    if (seen.length === 3) break;
  }
  expect(seen).toEqual(["a", "b", "c"]);
  expect(callsFor("GetModelVersions")).toHaveLength(2);
  await sk.dispose();
});
