import { test, expect } from "bun:test";
import { z } from "zod";
import { table, renderAccount, formatError } from "../../src/cli/format.js";
import {
  SpeckleGraphQLError,
  SpeckleTransportError,
  SpeckleValidationError,
} from "../../src/transport/errors.js";
import { ProjectTemplateError } from "../../src/workflows/projectTemplate.js";
import type { AccountInfo } from "../../src/types.js";

test("table renders aligned columns and a header separator", () => {
  const out = table(
    [
      { id: "a", name: "Alice" },
      { id: "bb", name: "Bob" },
    ],
    [
      { header: "ID", get: (r) => r.id },
      { header: "NAME", get: (r) => r.name },
    ],
  );
  const lines = out.split("\n");
  expect(lines[0]).toBe("ID  NAME ");
  expect(lines[1]).toBe("--  -----");
  expect(lines[2]).toBe("a   Alice");
  expect(lines[3]).toBe("bb  Bob  ");
});

test("table handles empty rows", () => {
  expect(table([], [{ header: "X", get: () => "" }])).toBe("(none)");
});

test("renderAccount includes server, account fields, and permission marks", () => {
  const account: AccountInfo = {
    id: "u1",
    name: "Test User",
    email: "test@example.com",
    role: "server:admin",
    verified: true,
    hasPendingVerification: false,
    isOnboardingFinished: true,
    permissions: {
      canAccessServerAdminPanel: { authorized: true, code: "OK", message: "ok" },
      canCreatePersonalProject: { authorized: false, code: "FORBIDDEN", message: "nope" },
      canCreateWorkspace: { authorized: true, code: "OK", message: "ok" },
      canManageServerRegions: { authorized: true, code: "OK", message: "ok" },
      canManageServerUsers: { authorized: true, code: "OK", message: "ok" },
      canManageServerWorkspaces: { authorized: true, code: "OK", message: "ok" },
      canSupportServerUsers: { authorized: true, code: "OK", message: "ok" },
      canUpdateServerSettings: { authorized: true, code: "OK", message: "ok" },
      canUsePowerTools: { authorized: true, code: "OK", message: "ok" },
    },
  };
  const out = renderAccount(account, "https://example.com");
  expect(out).toContain("server: https://example.com");
  expect(out).toContain("Test User");
  expect(out).toContain("✓ canAccessServerAdminPanel");
  expect(out).toContain("✗ canCreatePersonalProject");
  expect(out).toContain("(FORBIDDEN: nope)");
});

test("formatError unwraps ProjectTemplateError with stage and partial", () => {
  const cause = new Error("downstream boom");
  const err = new ProjectTemplateError("createModel", `Model "site" creation failed`, { projectId: "p1" }, cause);
  const out = formatError(err);
  expect(out.name).toBe("ProjectTemplateError");
  expect(out.stage).toBe("createModel");
  expect(out.partial).toEqual({ projectId: "p1" });
  expect(out.cause).toEqual({ name: "Error", message: "downstream boom" });
});

test("formatError narrows SpeckleGraphQLError to graphqlErrors list", () => {
  const err = new SpeckleGraphQLError([{ message: "nope", path: ["a", 0] }]);
  const out = formatError(err);
  expect(out.name).toBe("SpeckleGraphQLError");
  expect(out.graphqlErrors).toEqual([{ message: "nope", path: ["a", 0] }]);
});

test("formatError narrows SpeckleTransportError with status and cause", () => {
  const cause = new Error("connect refused");
  const err = new SpeckleTransportError("HTTP failed", { status: 502, cause });
  const out = formatError(err);
  expect(out.name).toBe("SpeckleTransportError");
  expect(out.status).toBe(502);
  expect(out.cause).toEqual({ name: "Error", message: "connect refused" });
});

test("formatError narrows SpeckleValidationError to issues list", () => {
  const zerr = z.string().safeParse(123);
  if (zerr.success) throw new Error("expected zod error");
  const err = new SpeckleValidationError("X", zerr.error);
  const out = formatError(err);
  expect(out.name).toBe("SpeckleValidationError");
  expect(out.issues?.length).toBeGreaterThan(0);
});

test("formatError handles plain Error and unknown", () => {
  expect(formatError(new Error("plain"))).toMatchObject({ name: "Error", message: "plain" });
  expect(formatError("string thrown")).toMatchObject({
    name: "UnknownError",
    message: "string thrown",
  });
});
