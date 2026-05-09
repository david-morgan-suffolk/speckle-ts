import { resolve } from "node:path";
import {
  Speckle,
  applyProjectTemplate,
  ProjectTemplateError,
  ProjectTemplateSpecSchema,
  type ProjectTemplateSpec,
} from "../src/index.js";

const VISIBILITY = ["PUBLIC", "PRIVATE", "WORKSPACE"] as const;
type Visibility = (typeof VISIBILITY)[number];

interface CliArgs {
  apply: boolean;
  force: boolean;
  out?: string;
  path?: string;
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = { apply: false, force: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--apply") args.apply = true;
    else if (a === "--force") args.force = true;
    else if (a === "--out") args.out = argv[++i];
    else if (a && !a.startsWith("--")) args.path = a;
  }
  return args;
}

function slugify(s: string): string {
  const slug = s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || `template-${Date.now()}`;
}

function promptRequired(label: string): string {
  while (true) {
    const v = prompt(`${label}:`)?.trim();
    if (v) return v;
    console.error(`  ${label} is required`);
  }
}

function promptOptional(label: string): string | undefined {
  const v = prompt(`${label} (optional):`)?.trim();
  return v || undefined;
}

function promptVisibility(): Visibility {
  while (true) {
    const raw = prompt(`visibility [WORKSPACE]:`)?.trim() || "WORKSPACE";
    const v = raw.toUpperCase();
    if ((VISIBILITY as readonly string[]).includes(v)) return v as Visibility;
    console.error(`  must be one of ${VISIBILITY.join(", ")}`);
  }
}

function buildSpec(): ProjectTemplateSpec {
  const workspaceId = promptRequired("workspaceId");
  const name = promptRequired("project name");
  const visibility = promptVisibility();
  const description = promptOptional("description");
  const project: ProjectTemplateSpec["project"] = { name, visibility };
  if (description) project.description = description;
  return { workspaceId, project, models: [], insights: [], automations: [] };
}

async function loadSpec(path: string): Promise<ProjectTemplateSpec> {
  const file = Bun.file(path);
  if (!(await file.exists())) {
    console.error(`✗ ${path} not found`);
    process.exit(1);
  }
  const raw = await file.json();
  const parsed = ProjectTemplateSpecSchema.safeParse(raw);
  if (!parsed.success) {
    console.error(`✗ ${path} is not a valid ProjectTemplateSpec:`);
    for (const issue of parsed.error.issues) {
      console.error(`  ${issue.path.join(".") || "(root)"}: ${issue.message}`);
    }
    process.exit(1);
  }
  return parsed.data;
}

async function writeSpec(spec: ProjectTemplateSpec, out: string, force: boolean): Promise<string> {
  const target = resolve(process.cwd(), out);
  if (!force && (await Bun.file(target).exists())) {
    console.error(`✗ ${target} exists (use --force to overwrite)`);
    process.exit(1);
  }
  await Bun.write(target, JSON.stringify(spec, null, 2) + "\n");
  return target;
}

async function applyAndReport(spec: ProjectTemplateSpec): Promise<void> {
  const TOKEN = process.env.SPECKLE_TOKEN;
  if (!TOKEN) {
    console.error("✗ SPECKLE_TOKEN missing (required with --apply)");
    process.exit(1);
  }
  const SERVER = process.env.SPECKLE_SERVER ?? "https://app.speckle.systems";
  const sk = new Speckle({ server: SERVER, token: TOKEN });
  try {
    const result = await applyProjectTemplate(sk, spec);
    console.log(`✓ project: ${result.projectId}`);
    console.log(`  models:      ${Object.keys(result.modelIds).length}`);
    console.log(`  insights:    ${result.insightIds.length}`);
    console.log(`  automations: ${result.automationIds.length}`);
  } catch (err) {
    if (err instanceof ProjectTemplateError) {
      console.error(`✗ stage=${err.stage}: ${err.message}`);
      console.error("  partial:", JSON.stringify(err.partial, null, 2));
    } else {
      console.error("✗ apply failed:", err);
    }
    process.exitCode = 1;
  } finally {
    await sk.dispose();
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  let spec: ProjectTemplateSpec;

  if (args.path) {
    const path = resolve(process.cwd(), args.path);
    spec = await loadSpec(path);
    console.log(`loaded ${path}`);
  } else {
    spec = ProjectTemplateSpecSchema.parse(buildSpec());
    const out = args.out ?? `./templates/${slugify(spec.project.name)}.json`;
    const written = await writeSpec(spec, out, args.force);
    console.log(`✓ wrote ${written}`);
    if (!args.apply) {
      console.log("  edit models/insights/automations, then re-run with --apply <path>");
    }
  }

  if (args.apply) await applyAndReport(spec);
}

main().catch((err) => {
  console.error("✗ template-new failed:", err);
  process.exit(1);
});
