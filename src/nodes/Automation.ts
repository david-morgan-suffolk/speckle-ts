import { Node } from "./Node.js";
import { assertExists, parseOrThrow } from "../transport/validate.js";
import {
  AutomationInfoSchema,
  AutomationsPageSchema,
  AutomateRunsPageSchema,
} from "../schemas.js";
import type { Project } from "./Project.js";
import type { Speckle } from "../client.js";
import type {
  AutomationInfo,
  AutomateRunInfo,
  AutomationListOptions,
  AutomationRunsOptions,
  CreateAutomationInput,
  PageInfo,
  UpdateAutomationInput,
} from "../types.js";

const AUTOMATION_FIELDS = /* GraphQL */ `
  id
  name
  enabled
  isTestAutomation
  createdAt
  updatedAt
`;

const AUTOMATE_RUN_FIELDS = /* GraphQL */ `
  id
  automationId
  automationRevisionId
  status
  createdAt
  updatedAt
  functionRuns {
    id
    functionId
    functionReleaseId
    status
    statusMessage
    contextView
    elapsed
    results
    createdAt
    updatedAt
  }
`;

const LIST_AUTOMATIONS_QUERY = /* GraphQL */ `
  query ListProjectAutomations($projectId: String!, $cursor: String, $limit: Int) {
    project(id: $projectId) {
      automations(cursor: $cursor, limit: $limit) {
        totalCount
        cursor
        items { ${AUTOMATION_FIELDS} }
      }
    }
  }
`;

const GET_AUTOMATION_QUERY = /* GraphQL */ `
  query GetAutomation($projectId: String!, $automationId: String!) {
    project(id: $projectId) {
      automation(id: $automationId) { ${AUTOMATION_FIELDS} }
    }
  }
`;

const LIST_AUTOMATION_RUNS_QUERY = /* GraphQL */ `
  query ListAutomationRuns(
    $projectId: String!
    $automationId: String!
    $cursor: String
    $limit: Int
  ) {
    project(id: $projectId) {
      automation(id: $automationId) {
        runs(cursor: $cursor, limit: $limit) {
          totalCount
          cursor
          items { ${AUTOMATE_RUN_FIELDS} }
        }
      }
    }
  }
`;

const CREATE_AUTOMATION_MUTATION = /* GraphQL */ `
  mutation CreateProjectAutomation($projectId: ID!, $input: ProjectAutomationCreateInput!) {
    projectMutations {
      automationMutations(projectId: $projectId) {
        create(input: $input) { ${AUTOMATION_FIELDS} }
      }
    }
  }
`;

const UPDATE_AUTOMATION_MUTATION = /* GraphQL */ `
  mutation UpdateProjectAutomation($projectId: ID!, $input: ProjectAutomationUpdateInput!) {
    projectMutations {
      automationMutations(projectId: $projectId) {
        update(input: $input) { ${AUTOMATION_FIELDS} }
      }
    }
  }
`;

const DELETE_AUTOMATION_MUTATION = /* GraphQL */ `
  mutation DeleteProjectAutomation($projectId: ID!, $automationId: ID!) {
    projectMutations {
      automationMutations(projectId: $projectId) {
        delete(automationId: $automationId)
      }
    }
  }
`;

const TRIGGER_AUTOMATION_MUTATION = /* GraphQL */ `
  mutation TriggerProjectAutomation($projectId: ID!, $automationId: ID!, $versionId: ID) {
    projectMutations {
      automationMutations(projectId: $projectId) {
        trigger(automationId: $automationId, versionId: $versionId)
      }
    }
  }
`;

function listVars(
  projectId: string,
  opts?: AutomationListOptions,
): Record<string, unknown> {
  const out: Record<string, unknown> = { projectId };
  if (opts?.cursor !== undefined && opts.cursor !== null) out["cursor"] = opts.cursor;
  if (opts?.limit !== undefined) out["limit"] = opts.limit;
  return out;
}

function runsVars(
  projectId: string,
  automationId: string,
  opts?: AutomationRunsOptions,
): Record<string, unknown> {
  const out: Record<string, unknown> = { projectId, automationId };
  if (opts?.cursor !== undefined && opts.cursor !== null) out["cursor"] = opts.cursor;
  if (opts?.limit !== undefined) out["limit"] = opts.limit;
  return out;
}

export async function listProjectAutomations(
  speckle: Speckle,
  projectId: string,
  opts?: AutomationListOptions,
): Promise<PageInfo<AutomationInfo>> {
  const data = await speckle.http.request<
    { project: { automations: unknown } | null },
    Record<string, unknown>
  >(LIST_AUTOMATIONS_QUERY, listVars(projectId, opts));
  const project = assertExists(data.project, "Project", projectId);
  return parseOrThrow("ProjectAutomations", AutomationsPageSchema, project.automations);
}

export async function* iterateProjectAutomations(
  speckle: Speckle,
  projectId: string,
  opts?: Omit<AutomationListOptions, "cursor">,
): AsyncIterable<AutomationInfo> {
  let cursor: string | null | undefined = undefined;
  while (true) {
    const page = await listProjectAutomations(speckle, projectId, {
      ...(opts ?? {}),
      ...(cursor !== undefined && cursor !== null ? { cursor } : {}),
    });
    for (const item of page.items) yield item;
    if (!page.cursor) break;
    cursor = page.cursor;
  }
}

export async function listAllProjectAutomations(
  speckle: Speckle,
  projectId: string,
  opts?: Omit<AutomationListOptions, "cursor">,
): Promise<AutomationInfo[]> {
  const out: AutomationInfo[] = [];
  for await (const a of iterateProjectAutomations(speckle, projectId, opts)) {
    out.push(a);
  }
  return out;
}

export async function getAutomation(
  speckle: Speckle,
  projectId: string,
  automationId: string,
): Promise<AutomationInfo> {
  const data = await speckle.http.request<
    { project: { automation: unknown } | null },
    { projectId: string; automationId: string }
  >(GET_AUTOMATION_QUERY, { projectId, automationId });
  const project = assertExists(data.project, "Project", projectId);
  const automation = assertExists(project.automation, "Automation", automationId);
  return parseOrThrow("Automation", AutomationInfoSchema, automation);
}

export async function listAutomationRuns(
  speckle: Speckle,
  projectId: string,
  automationId: string,
  opts?: AutomationRunsOptions,
): Promise<PageInfo<AutomateRunInfo>> {
  const data = await speckle.http.request<
    { project: { automation: { runs: unknown } | null } | null },
    Record<string, unknown>
  >(LIST_AUTOMATION_RUNS_QUERY, runsVars(projectId, automationId, opts));
  const project = assertExists(data.project, "Project", projectId);
  const automation = assertExists(project.automation, "Automation", automationId);
  return parseOrThrow("AutomationRuns", AutomateRunsPageSchema, automation.runs);
}

export async function* iterateAutomationRuns(
  speckle: Speckle,
  projectId: string,
  automationId: string,
  opts?: Omit<AutomationRunsOptions, "cursor">,
): AsyncIterable<AutomateRunInfo> {
  let cursor: string | null | undefined = undefined;
  while (true) {
    const page = await listAutomationRuns(speckle, projectId, automationId, {
      ...(opts ?? {}),
      ...(cursor !== undefined && cursor !== null ? { cursor } : {}),
    });
    for (const item of page.items) yield item;
    if (!page.cursor) break;
    cursor = page.cursor;
  }
}

export async function createAutomation(
  speckle: Speckle,
  projectId: string,
  input: CreateAutomationInput,
): Promise<AutomationInfo> {
  const data = await speckle.http.request<
    {
      projectMutations: {
        automationMutations: { create: unknown };
      };
    },
    { projectId: string; input: CreateAutomationInput }
  >(CREATE_AUTOMATION_MUTATION, { projectId, input });
  return parseOrThrow(
    "CreateAutomation",
    AutomationInfoSchema,
    data.projectMutations.automationMutations.create,
  );
}

export async function updateAutomation(
  speckle: Speckle,
  projectId: string,
  automationId: string,
  patch: UpdateAutomationInput,
): Promise<AutomationInfo> {
  const data = await speckle.http.request<
    {
      projectMutations: {
        automationMutations: { update: unknown };
      };
    },
    { projectId: string; input: UpdateAutomationInput & { id: string } }
  >(UPDATE_AUTOMATION_MUTATION, {
    projectId,
    input: { id: automationId, ...patch },
  });
  return parseOrThrow(
    "UpdateAutomation",
    AutomationInfoSchema,
    data.projectMutations.automationMutations.update,
  );
}

export async function deleteAutomation(
  speckle: Speckle,
  projectId: string,
  automationId: string,
): Promise<boolean> {
  const data = await speckle.http.request<
    {
      projectMutations: {
        automationMutations: { delete: boolean };
      };
    },
    { projectId: string; automationId: string }
  >(DELETE_AUTOMATION_MUTATION, { projectId, automationId });
  return data.projectMutations.automationMutations.delete;
}

export async function triggerAutomation(
  speckle: Speckle,
  projectId: string,
  automationId: string,
  versionId?: string,
): Promise<string> {
  const data = await speckle.http.request<
    {
      projectMutations: {
        automationMutations: { trigger: string };
      };
    },
    { projectId: string; automationId: string; versionId?: string | null }
  >(TRIGGER_AUTOMATION_MUTATION, {
    projectId,
    automationId,
    versionId: versionId ?? null,
  });
  return data.projectMutations.automationMutations.trigger;
}

export class Automation extends Node<AutomationInfo> {
  readonly id: string;
  readonly project: Project;

  constructor(speckle: Speckle, project: Project, id: string) {
    super(speckle, project);
    this.project = project;
    this.id = id;
  }

  protected fetch(): Promise<AutomationInfo> {
    return getAutomation(this.speckle, this.project.id, this.id);
  }

  listRuns(opts?: AutomationRunsOptions): Promise<PageInfo<AutomateRunInfo>> {
    return listAutomationRuns(this.speckle, this.project.id, this.id, opts);
  }

  runs(opts?: Omit<AutomationRunsOptions, "cursor">): AsyncIterable<AutomateRunInfo> {
    return iterateAutomationRuns(this.speckle, this.project.id, this.id, opts);
  }

  trigger(versionId?: string): Promise<string> {
    return triggerAutomation(this.speckle, this.project.id, this.id, versionId);
  }

  update(patch: UpdateAutomationInput): Promise<AutomationInfo> {
    return updateAutomation(this.speckle, this.project.id, this.id, patch);
  }

  delete(): Promise<boolean> {
    return deleteAutomation(this.speckle, this.project.id, this.id);
  }
}
