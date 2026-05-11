import type { Speckle } from "@/client.js";
import { ProjectTemplateSpecSchema } from "@/schemas.js";
import type {
  ProjectTemplateSpec,
  ProjectTemplateResult,
  TemplateDashboard,
  TemplateInsight,
} from "@/types.js";
import { getSdk, type Sdk, ProjectVisibility } from "@/generated/sdk.js";
import { SpeckleValidationError } from "@/transport/errors.js";

export type ProjectTemplateStage =
  | "validate"
  | "verifyWorkspace"
  | "createProject"
  | "createModel"
  | "createInsight"
  | "createAutomation"
  | "createDashboard";

export class ProjectTemplateError extends Error {
  override readonly name = "ProjectTemplateError";
  readonly stage: ProjectTemplateStage;
  readonly partial: Partial<ProjectTemplateResult>;
  override readonly cause: unknown;

  constructor(
    stage: ProjectTemplateStage,
    message: string,
    partial: Partial<ProjectTemplateResult>,
    cause?: unknown,
  ) {
    super(`[${stage}] ${message}`);
    this.stage = stage;
    this.partial = partial;
    this.cause = cause;
  }
}

function resolveModelIds(
  refs: ReadonlyArray<string> | undefined,
  modelIds: Record<string, string>,
  insightLabel: string,
): string[] {
  if (!refs || refs.length === 0) return [];
  const out: string[] = [];
  for (const ref of refs) {
    const id = modelIds[ref];
    if (!id) {
      throw new Error(
        `Insight "${insightLabel}" references unknown model "${ref}". Available: ${Object.keys(modelIds).join(", ") || "(none)"}`,
      );
    }
    out.push(id);
  }
  return out;
}

async function applyInsight(
  sdk: Sdk,
  projectId: string,
  modelIds: Record<string, string>,
  insight: TemplateInsight,
): Promise<string> {
  if (insight.kind === "fromTemplate") {
    const ids = resolveModelIds(insight.modelRefs, modelIds, insight.name ?? insight.templateId);
    const res = await sdk.CreateInsightFromTemplate({
      input: {
        projectId,
        templateId: insight.templateId,
        modelIds: ids,
        ...(insight.name !== undefined ? { name: insight.name } : {}),
      },
    });
    return res.insightMutations.createFromTemplate.id;
  }

  const ids = resolveModelIds(insight.modelRefs, modelIds, insight.name);
  const res = await sdk.CreateInsight({
    input: {
      projectId,
      name: insight.name,
      query: insight.query,
      ...(insight.type !== undefined ? { type: insight.type } : {}),
      ...(insight.trigger !== undefined ? { trigger: insight.trigger } : {}),
      ...(insight.metadata !== undefined ? { metadata: insight.metadata } : {}),
      ...(ids.length > 0 ? { modelIds: ids } : {}),
    },
  });
  return res.insightMutations.create.id;
}

async function applyDashboard(
  sdk: Sdk,
  projectId: string,
  automationsByName: Record<string, string>,
  dashboard: TemplateDashboard,
): Promise<string> {
  const dup = await sdk.DuplicateDashboard({
    id: dashboard.fromDashboardId,
    name: dashboard.name,
  });
  const newId = dup.dashboardMutations.duplicate.id;

  let automationId: string | undefined;
  if (dashboard.automationRef !== undefined) {
    const resolved = automationsByName[dashboard.automationRef];
    if (!resolved) {
      throw new Error(
        `Dashboard "${dashboard.name}" references unknown automation "${dashboard.automationRef}". Available: ${
          Object.keys(automationsByName).join(", ") || "(none)"
        }`,
      );
    }
    automationId = resolved;
  }

  const link: { projectId: string; automationId?: string } = { projectId };
  if (automationId !== undefined) link.automationId = automationId;

  await sdk.UpdateDashboard({
    input: {
      id: newId,
      dashboardProjectLinks: [link],
    },
  });

  return newId;
}

export async function applyProjectTemplate(
  speckle: Speckle,
  spec: ProjectTemplateSpec,
): Promise<ProjectTemplateResult> {
  const parsed = ProjectTemplateSpecSchema.safeParse(spec);
  if (!parsed.success) {
    throw new SpeckleValidationError("ProjectTemplateSpec", parsed.error);
  }
  const validated = parsed.data;

  const partial: Partial<ProjectTemplateResult> = {};

  try {
    await speckle.workspace(validated.workspaceId).get;
  } catch (err) {
    throw new ProjectTemplateError(
      "verifyWorkspace",
      `Workspace ${validated.workspaceId} not accessible`,
      partial,
      err,
    );
  }

  const sdk = getSdk(speckle.http);

  let projectId: string;
  try {
    const res = await sdk.CreateWorkspaceProject({
      input: {
        workspaceId: validated.workspaceId,
        name: validated.project.name,
        ...(validated.project.description !== undefined
          ? { description: validated.project.description }
          : {}),
        ...(validated.project.visibility !== undefined
          ? { visibility: validated.project.visibility as ProjectVisibility }
          : {}),
      },
    });
    projectId = res.workspaceMutations.projects.create.id;
    partial.projectId = projectId;
  } catch (err) {
    throw new ProjectTemplateError("createProject", "Project creation failed", partial, err);
  }

  const modelIds: Record<string, string> = {};
  partial.modelIds = modelIds;
  for (const m of validated.models ?? []) {
    try {
      const res = await sdk.CreateModel({
        input: {
          projectId,
          name: m.name,
          ...(m.description !== undefined ? { description: m.description } : {}),
        },
      });
      modelIds[m.name] = res.modelMutations.create.id;
    } catch (err) {
      throw new ProjectTemplateError(
        "createModel",
        `Model "${m.name}" creation failed`,
        partial,
        err,
      );
    }
  }

  const insightIds: string[] = [];
  partial.insightIds = insightIds;
  for (const ins of validated.insights ?? []) {
    const label = ins.kind === "inline" ? ins.name : (ins.name ?? ins.templateId);
    try {
      const id = await applyInsight(sdk, projectId, modelIds, ins);
      insightIds.push(id);
    } catch (err) {
      throw new ProjectTemplateError(
        "createInsight",
        `Insight "${label}" creation failed`,
        partial,
        err,
      );
    }
  }

  const automationIds: string[] = [];
  const automationsByName: Record<string, string> = {};
  partial.automationIds = automationIds;
  for (const a of validated.automations ?? []) {
    try {
      const res = await sdk.CreateAutomation({
        projectId,
        input: {
          name: a.name,
          enabled: a.enabled,
          ...(a.isTestAutomation !== undefined ? { isTestAutomation: a.isTestAutomation } : {}),
        },
      });
      const id = res.projectMutations.automationMutations.create.id;
      automationIds.push(id);
      automationsByName[a.name] = id;
    } catch (err) {
      throw new ProjectTemplateError(
        "createAutomation",
        `Automation "${a.name}" creation failed`,
        partial,
        err,
      );
    }
  }

  const dashboardIds: string[] = [];
  partial.dashboardIds = dashboardIds;
  for (const d of validated.dashboards ?? []) {
    try {
      const id = await applyDashboard(sdk, projectId, automationsByName, d);
      dashboardIds.push(id);
    } catch (err) {
      throw new ProjectTemplateError(
        "createDashboard",
        `Dashboard "${d.name}" creation failed`,
        partial,
        err,
      );
    }
  }

  return { projectId, modelIds, insightIds, automationIds, dashboardIds };
}
