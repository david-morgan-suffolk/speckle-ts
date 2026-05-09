import type { AccountInfo, PermissionCheck } from "@/types.js";

export type Output = "text" | "json";

export function emit(value: unknown, output: Output): void {
  if (output === "json") {
    process.stdout.write(JSON.stringify(value, null, 2) + "\n");
  } else if (typeof value === "string") {
    process.stdout.write(value + "\n");
  } else {
    process.stdout.write(JSON.stringify(value, null, 2) + "\n");
  }
}

export interface Column<T> {
  header: string;
  get: (row: T) => string;
}

export function table<T>(rows: ReadonlyArray<T>, columns: ReadonlyArray<Column<T>>): string {
  if (rows.length === 0) return "(none)";
  const cells = rows.map((row) => columns.map((c) => c.get(row)));
  const widths = columns.map((c, i) =>
    Math.max(c.header.length, ...cells.map((row) => (row[i] ?? "").length)),
  );
  const header = columns.map((c, i) => c.header.padEnd(widths[i] ?? 0)).join("  ");
  const sep = widths.map((w) => "-".repeat(w)).join("  ");
  const body = cells
    .map((row) => row.map((cell, i) => (cell ?? "").padEnd(widths[i] ?? 0)).join("  "))
    .join("\n");
  return `${header}\n${sep}\n${body}`;
}

export function renderAccount(account: AccountInfo, server: string): string {
  const lines: string[] = [];
  lines.push(`server: ${server}`);
  lines.push("");
  lines.push("account");
  lines.push(`  id:                       ${account.id}`);
  lines.push(`  name:                     ${account.name}`);
  lines.push(`  email:                    ${account.email ?? "(hidden)"}`);
  lines.push(`  role:                     ${account.role ?? "(none)"}`);
  lines.push(`  verified:                 ${account.verified ?? "(unknown)"}`);
  lines.push(`  hasPendingVerification:   ${account.hasPendingVerification ?? "(unknown)"}`);
  lines.push(`  isOnboardingFinished:     ${account.isOnboardingFinished ?? "(unknown)"}`);
  lines.push("");
  lines.push("permissions");

  const p = account.permissions;
  const rows: Array<[string, PermissionCheck]> = [
    ["canAccessServerAdminPanel", p.canAccessServerAdminPanel],
    ["canCreatePersonalProject", p.canCreatePersonalProject],
    ["canCreateWorkspace", p.canCreateWorkspace],
    ["canManageServerRegions", p.canManageServerRegions],
    ["canManageServerUsers", p.canManageServerUsers],
    ["canManageServerWorkspaces", p.canManageServerWorkspaces],
    ["canSupportServerUsers", p.canSupportServerUsers],
    ["canUpdateServerSettings", p.canUpdateServerSettings],
    ["canUsePowerTools", p.canUsePowerTools],
  ];

  const padName = Math.max(...rows.map(([n]) => n.length));
  for (const [name, check] of rows) {
    const mark = check.authorized ? "✓" : "✗";
    const note = check.authorized ? "" : `  (${check.code}: ${check.message})`;
    lines.push(`  ${mark} ${name.padEnd(padName)} ${check.authorized}${note}`);
  }

  return lines.join("\n");
}
