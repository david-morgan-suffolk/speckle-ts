import { test, expect } from "bun:test";
import {
  mockSpeckle,
  versionFixture,
  createVersionHandler,
  updateVersionHandler,
  deleteVersionsHandler,
  markVersionReceivedHandler,
} from "../_helpers/index.js";
import { Version } from "../../src/nodes/Version.js";

test("Model.publish posts CreateVersionInput with projectId + modelId injected", async () => {
  const { sk, callsFor } = mockSpeckle({
    CreateVersion: createVersionHandler(versionFixture("v_new", { message: "hi" })),
  });
  const v = await sk.project("p1").model("m1").publish({
    objectId: "obj_1",
    message: "hi",
    sourceApplication: "rhino",
    parents: ["v_parent"],
  });
  expect(v).toBeInstanceOf(Version);
  expect(v.id).toBe("v_new");
  expect(v.model.id).toBe("m1");

  const input = callsFor("CreateVersion")[0]?.variables["input"] as {
    projectId: string;
    modelId: string;
    objectId: string;
    message?: string;
    sourceApplication?: string;
    parents?: string[];
  };
  expect(input).toEqual({
    projectId: "p1",
    modelId: "m1",
    objectId: "obj_1",
    message: "hi",
    sourceApplication: "rhino",
    parents: ["v_parent"],
  });
  await sk.dispose();
});

test("Version.update sends UpdateVersionInput with projectId + versionId", async () => {
  const { sk, callsFor } = mockSpeckle({
    UpdateVersion: updateVersionHandler(versionFixture("v1", { message: "renamed" })),
  });
  const updated = await sk.project("p1").model("m1").version("v1").update({
    message: "renamed",
  });
  expect(updated.message).toBe("renamed");
  const input = callsFor("UpdateVersion")[0]?.variables["input"] as Record<string, unknown>;
  expect(input).toEqual({ projectId: "p1", versionId: "v1", message: "renamed" });
  await sk.dispose();
});

test("Version.delete sends DeleteVersionsInput with single id", async () => {
  const { sk, callsFor } = mockSpeckle({
    DeleteVersions: deleteVersionsHandler(true),
  });
  const ok = await sk.project("p1").model("m1").version("v1").delete();
  expect(ok).toBe(true);
  expect(callsFor("DeleteVersions")[0]?.variables["input"]).toEqual({
    projectId: "p1",
    versionIds: ["v1"],
  });
  await sk.dispose();
});

test("Project.deleteVersions sends bulk DeleteVersionsInput", async () => {
  const { sk, callsFor } = mockSpeckle({
    DeleteVersions: deleteVersionsHandler(true),
  });
  await sk.project("p1").deleteVersions(["v1", "v2", "v3"]);
  expect(callsFor("DeleteVersions")[0]?.variables["input"]).toEqual({
    projectId: "p1",
    versionIds: ["v1", "v2", "v3"],
  });
  await sk.dispose();
});

test("Version.markReceived sends MarkReceivedVersionInput with sourceApplication", async () => {
  const { sk, callsFor } = mockSpeckle({
    MarkVersionReceived: markVersionReceivedHandler(true),
  });
  const ok = await sk.project("p1").model("m1").version("v1").markReceived({
    sourceApplication: "rhino",
    message: "consumed",
    isEmbed: false,
  });
  expect(ok).toBe(true);
  expect(callsFor("MarkVersionReceived")[0]?.variables["input"]).toEqual({
    projectId: "p1",
    versionId: "v1",
    sourceApplication: "rhino",
    message: "consumed",
    isEmbed: false,
  });
  await sk.dispose();
});
