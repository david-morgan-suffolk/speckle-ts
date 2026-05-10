import { test, expect } from "bun:test";
import {
  mockSpeckle,
  fileImportFixture,
  uploadUrlFixture,
  generateUploadUrlHandler,
  finalizeFileImportHandler,
  pendingFileImportsHandler,
} from "../_helpers/index.js";
import {
  putBlob,
  convertedStatusToString,
} from "../../src/nodes/FileImport.js";
import { SpeckleTransportError } from "../../src/transport/errors.js";

test("convertedStatusToString maps numeric codes to strings", () => {
  expect(convertedStatusToString(0)).toBe("queued");
  expect(convertedStatusToString(1)).toBe("processing");
  expect(convertedStatusToString(2)).toBe("success");
  expect(convertedStatusToString(3)).toBe("error");
});

test("putBlob PUTs body + headers and parses ETag from response", async () => {
  let captured: { method?: string; headers?: Record<string, string>; body?: unknown } = {};
  const fakeFetch = (async (url: string, init?: RequestInit) => {
    captured = {
      method: init?.method,
      headers: init?.headers as Record<string, string>,
      body: init?.body,
    };
    return new Response(null, {
      status: 200,
      headers: { etag: '"abc123"' },
    });
  }) as unknown as typeof fetch;

  const result = await putBlob({
    url: "https://blob.example/x",
    body: new Uint8Array([1, 2, 3]),
    headers: { "x-amz-acl": "private" },
    fetch: fakeFetch,
  });
  expect(result.etag).toBe("abc123");
  expect(captured.method).toBe("PUT");
  expect(captured.headers).toEqual({ "x-amz-acl": "private" });
});

test("putBlob throws SpeckleTransportError on non-2xx", async () => {
  const fakeFetch = (async () =>
    new Response("denied", { status: 403, statusText: "Forbidden" })) as unknown as typeof fetch;
  await expect(
    putBlob({
      url: "https://blob.example/x",
      body: new Uint8Array(),
      headers: {},
      fetch: fakeFetch,
    }),
  ).rejects.toThrow(SpeckleTransportError);
});

test("putBlob throws when ETag header is missing", async () => {
  const fakeFetch = (async () =>
    new Response(null, { status: 200 })) as unknown as typeof fetch;
  await expect(
    putBlob({
      url: "https://blob.example/x",
      body: new Uint8Array(),
      headers: {},
      fetch: fakeFetch,
    }),
  ).rejects.toThrow(/no ETag/);
});

test("Project.pendingFileImports lists pending imports for the project", async () => {
  const { sk, callsFor } = mockSpeckle({
    ListProjectFileImports: pendingFileImportsHandler([
      fileImportFixture({ id: "fi_a", convertedStatus: 1 }),
      fileImportFixture({ id: "fi_b", convertedStatus: 2 }),
    ]),
  });
  const list = await sk.project("p1").pendingFileImports();
  expect(list).toHaveLength(2);
  expect(list.map((j) => convertedStatusToString(j.convertedStatus))).toEqual([
    "processing",
    "success",
  ]);
  expect(callsFor("ListProjectFileImports")[0]?.variables).toEqual({ projectId: "p1" });
  await sk.dispose();
});

test("Model.uploadFile orchestrates generateUrl → PUT → finalize", async () => {
  const upload = uploadUrlFixture({
    url: "https://blob.example/target",
    fileId: "blob_42",
    additionalRequestHeaders: [
      { header: "x-amz-acl", value: "private" },
      { header: "x-content-type", value: "model/ifc" },
    ],
  });
  const job = fileImportFixture({ id: "fi_new", fileName: "tower.ifc" });

  const { sk, callsFor } = mockSpeckle({
    StartFileImport: generateUploadUrlHandler(upload),
    FinalizeFileImport: finalizeFileImportHandler(job),
  });

  let capturedHeaders: Record<string, string> | undefined;
  const uploadFetch = (async (url: string, init?: RequestInit) => {
    expect(url).toBe(upload.url);
    expect(init?.method).toBe("PUT");
    capturedHeaders = init?.headers as Record<string, string>;
    return new Response(null, { status: 200, headers: { etag: '"etag-xyz"' } });
  }) as unknown as typeof fetch;

  const got = await sk.project("p1").model("m1").uploadFile({
    fileName: "tower.ifc",
    data: new Uint8Array([1, 2, 3, 4]),
    uploadFetch,
  });

  expect(got.id).toBe("fi_new");
  expect(capturedHeaders).toEqual({
    "x-amz-acl": "private",
    "x-content-type": "model/ifc",
  });

  const generateInput = callsFor("StartFileImport")[0]?.variables["input"] as Record<
    string,
    unknown
  >;
  expect(generateInput).toEqual({ projectId: "p1", fileName: "tower.ifc" });

  const finalizeInput = callsFor("FinalizeFileImport")[0]?.variables["input"] as Record<
    string,
    unknown
  >;
  expect(finalizeInput).toEqual({
    projectId: "p1",
    modelId: "m1",
    fileId: "blob_42",
    etag: "etag-xyz",
  });

  await sk.dispose();
});
