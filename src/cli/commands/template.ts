import { defineCommand } from "citty";
import { readFileSync } from "node:fs";
import { extname, resolve } from "node:path";
import { authArgs, output, withSpeckle } from "@/cli/commands/_shared.js";
import { emit } from "@/cli/format.js";
import { ProjectTemplateSpecSchema } from "@/schemas.js";
import type { ProjectTemplateSpec } from "@/types.js";
import { applyProjectTemplate } from "@/workflows/index.js";

async function loadSpec(path: string): Promise<ProjectTemplateSpec> {
  const abs = resolve(process.cwd(), path);
  const raw = readFileSync(abs, "utf8");
  let parsed: unknown;
  const ext = extname(abs).toLowerCase();
  if (ext === ".yaml" || ext === ".yml") {
    let yaml: typeof import("yaml");
    try {
      yaml = await import("yaml");
    } catch {
      throw new Error("YAML support requires the optional 'yaml' package. Run: bun add -d yaml");
    }
    parsed = yaml.parse(raw);
  } else {
    parsed = JSON.parse(raw);
  }
  const result = ProjectTemplateSpecSchema.safeParse(parsed);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  ${i.path.join(".") || "(root)"}: ${i.message}`)
      .join("\n");
    throw new Error(`Invalid template spec at ${abs}:\n${issues}`);
  }
  return result.data;
}

const apply = defineCommand({
  meta: { name: "apply", description: "Apply a project template spec (.json or .yaml)" },
  args: {
    ...authArgs,
    spec: { type: "positional", description: "Path to template spec file", required: true },
  },
  async run({ args }) {
    const spec = await loadSpec(args.spec);
    await withSpeckle(args, async ({ speckle }) => {
      const result = await applyProjectTemplate(speckle, spec);
      if (output(args) === "json") {
        emit(result, "json");
        return;
      }
      emit(`✓ project: ${result.projectId}`, "text");
      emit(`  models:      ${Object.keys(result.modelIds).length}`, "text");
      emit(`  insights:    ${result.insightIds.length}`, "text");
      emit(`  automations: ${result.automationIds.length}`, "text");
    });
  },
});

export default defineCommand({
  meta: { name: "template", description: "Project template commands" },
  subCommands: { apply },
});

export { apply, loadSpec };
