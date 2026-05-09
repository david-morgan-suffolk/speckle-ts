import { defineCommand } from "citty";
import { readFileSync } from "node:fs";
import { extname, resolve } from "node:path";
import { authArgs, output, withSpeckle } from "@/cli/commands/_shared.js";
import { emit } from "@/cli/format.js";
import { ProjectTemplateSpecSchema } from "@/schemas.js";
import type { ProjectTemplateSpec } from "@/types.js";
import { applyProjectTemplate, ProjectTemplateError } from "@/workflows/index.js";

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
      try {
        const result = await applyProjectTemplate(speckle, spec);
        if (output(args) === "json") {
          emit(result, "json");
        } else {
          emit(`✓ project: ${result.projectId}`, "text");
          emit(`  models:      ${Object.keys(result.modelIds).length}`, "text");
          emit(`  insights:    ${result.insightIds.length}`, "text");
          emit(`  automations: ${result.automationIds.length}`, "text");
        }
      } catch (err) {
        if (err instanceof ProjectTemplateError) {
          if (output(args) === "json") {
            emit({ error: err.message, stage: err.stage, partial: err.partial }, "json");
          } else {
            console.error(`✗ stage=${err.stage}: ${err.message}`);
            console.error("  partial:", JSON.stringify(err.partial, null, 2));
          }
          process.exitCode = 1;
          return;
        }
        throw err;
      }
    });
  },
});

export default defineCommand({
  meta: { name: "template", description: "Project template commands" },
  subCommands: { apply },
});

export { apply, loadSpec };
