import type { AccountInfo, PermissionCheck } from "@/types.js";
import {
  SpeckleGraphQLError,
  SpeckleTransportError,
  SpeckleValidationError,
} from "@/transport/errors.js";
import { ProjectTemplateError } from "@/workflows/projectTemplate.js";

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

export interface FormattedError {
  name: string;
  message: string;
  stage?: string;
  status?: number;
  issues?: ReadonlyArray<{ path: string; message: string }>;
  partial?: unknown;
  graphqlErrors?: ReadonlyArray<{ message: string; path?: ReadonlyArray<string | number> }>;
  cause?: { name: string; message: string };
}

export function formatError(err: unknown): FormattedError {
  if (err instanceof ProjectTemplateError) {
    return {
      name: err.name,
      message: err.message,
      stage: err.stage,
      partial: err.partial,
      ...(err.cause !== undefined ? { cause: causeOf(err.cause) } : {}),
    };
  }
  if (err instanceof SpeckleGraphQLError) {
    return {
      name: err.name,
      message: err.message,
      graphqlErrors: err.errors.map((e) => ({
        message: e.message,
        ...(e.path ? { path: e.path } : {}),
      })),
    };
  }
  if (err instanceof SpeckleTransportError) {
    return {
      name: err.name,
      message: err.message,
      ...(err.status !== undefined ? { status: err.status } : {}),
      ...(err.cause !== undefined ? { cause: causeOf(err.cause) } : {}),
    };
  }
  if (err instanceof SpeckleValidationError) {
    return {
      name: err.name,
      message: err.message,
      issues: err.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
    };
  }
  if (err instanceof Error) {
    return {
      name: err.name,
      message: err.message,
      ...(err.cause !== undefined ? { cause: causeOf(err.cause) } : {}),
    };
  }
  return { name: "UnknownError", message: String(err) };
}

function causeOf(cause: unknown): { name: string; message: string } {
  if (cause instanceof Error) return { name: cause.name, message: cause.message };
  return { name: "UnknownError", message: String(cause) };
}

export function emitError(err: unknown, output: Output): void {
  const formatted = formatError(err);
  if (output === "json") {
    process.stderr.write(JSON.stringify(formatted, null, 2) + "\n");
    return;
  }
  const head = formatted.stage
    ? `✗ ${formatted.name} [${formatted.stage}]: ${formatted.message}`
    : `✗ ${formatted.name}: ${formatted.message}`;
  process.stderr.write(head + "\n");
  if (formatted.cause) {
    process.stderr.write(`  caused by: ${formatted.cause.name}: ${formatted.cause.message}\n`);
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
