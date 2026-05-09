import { test, expect } from "bun:test";
import { table, renderAccount } from "../../src/cli/format.js";
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
