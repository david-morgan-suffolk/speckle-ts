import { test, expect } from "bun:test";
import { Speckle } from "../src/client.js";
import { buildSpeckleUrl } from "../src/url.js";
import type { ReceiveSpeckleObjectResult } from "../src/objects.js";
import sourceExamples from "./source-examples.json";

const TOKEN = process.env.SPECKLE_TOKEN ?? "";
const SERVER = process.env.SPECKLE_SERVER ?? "https://app.speckle.systems";
const SOURCE_EXAMPLES = sourceExamples.sources;
const SEND_SOURCE = SOURCE_EXAMPLES[0] ?? sourceExamples.target;
const TARGET_PROJECT_ID = process.env.SPECKLE_OBJECT_TARGET_PROJECT_ID ?? sourceExamples.target.projectId;
const TARGET_MODEL_ID = process.env.SPECKLE_OBJECT_TARGET_MODEL_ID ?? sourceExamples.target.modelId;
const LIVE_SEND = process.env.SPECKLE_OBJECT_SEND_LIVE === "1";

for (const source of SOURCE_EXAMPLES) {
  test.skipIf(!TOKEN)(
    `live objectloader2 receive loads source model ${source.projectId}/${source.modelId}`,
    async () => {
      const speckle = new Speckle({ server: SERVER, token: TOKEN });
      let result: ReceiveSpeckleObjectResult | null = null;

      try {
        result = await speckle.project(source.projectId).model(source.modelId).loadLatestObject();
        expect(result.versionId).toBeTruthy();
        expect(result.objectId).toBeTruthy();
        expect(result.handle.objectIds.length).toBeGreaterThan(0);
        const root = await result.handle.getRoot();
        expect(root.id).toBe(result.objectId);
        expect(root.speckle_type.length).toBeGreaterThan(0);
      } finally {
        await result?.dispose();
        await speckle.dispose();
      }
    },
    180_000,
  );
}

test.skipIf(!TOKEN || !LIVE_SEND)(
  "live object send creates a target version and can load it back",
  async () => {
    const speckle = new Speckle({ server: SERVER, token: TOKEN });
    let source: ReceiveSpeckleObjectResult | null = null;
    let roundTrip: ReceiveSpeckleObjectResult | null = null;

    try {
      source = await speckle
        .project(SEND_SOURCE.projectId)
        .model(SEND_SOURCE.modelId)
        .loadLatestObject();
      const sendResult = await speckle
        .project(TARGET_PROJECT_ID)
        .model(TARGET_MODEL_ID)
        .sendObject(source.handle, {
          message: `@suffolk/speckle live send ${new Date().toISOString()}`,
          sourceApplication: "suffolk-speckle-ts",
        });
      expect(sendResult.objectId).toBeTruthy();
      expect(sendResult.versionId).toBeTruthy();
      expect(sendResult.version.referencedObject).toBe(sendResult.objectId);
      const versionUrl = buildSpeckleUrl({
        server: SERVER,
        projectId: TARGET_PROJECT_ID,
        modelRefs: [{ modelId: TARGET_MODEL_ID, versionId: sendResult.versionId }],
      });
      console.log(`Speckle version URL: ${versionUrl}`);

      roundTrip = await speckle
        .project(TARGET_PROJECT_ID)
        .loadVersionObject(sendResult.versionId);
      expect(roundTrip.objectId).toBe(sendResult.objectId);
      expect(roundTrip.handle.objectIds.length).toBeGreaterThan(0);
      expect(roundTrip.handle.rootClosureSize).toBe(source.handle.rootClosureSize);
    } finally {
      await roundTrip?.dispose();
      await source?.dispose();
      await speckle.dispose();
    }
  },
  900_000,
);
