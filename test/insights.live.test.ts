import { test, expect } from "bun:test";
import { Speckle } from "../src/client.js";

const TOKEN = process.env.SPECKLE_TOKEN;
const SERVER = process.env.SPECKLE_SERVER ?? "https://app.speckle.systems";
const OUT_PATH = process.env.SPECKLE_INSIGHTS_OUT ?? "tmp/insights.json";
const PROJECT_FILTER = process.env.SPECKLE_INSIGHTS_PROJECT_ID;
const WORKSPACE_FILTER = process.env.SPECKLE_INSIGHTS_WORKSPACE_ID;
const MAX_PROJECT_PAGES = Number(process.env.SPECKLE_INSIGHTS_MAX_PAGES ?? 5);

const MY_PROJECTS = /* GraphQL */ `
  query MyProjectsForInsights($cursor: String) {
    activeUser {
      projects(limit: 50, cursor: $cursor) {
        cursor
        items {
          id
          name
          workspaceId
        }
      }
    }
  }
`;

const PROJECT_INSIGHTS = /* GraphQL */ `
  query ProjectInsightsSnapshot($projectId: String!) {
    projectInsights(projectId: $projectId) {
      id
      name
      type
      trigger
      version
      templateVersion
      customized
      derivedPackageCount
      modelIds
      projectId
      metadata
      query
      createdAt
      updatedAt
      createdBy
      updatedBy
      latestResults {
        id
        modelId
        versionId
        timestamp
        summary
        result
      }
      dataSources {
        alias
        dataSourceId
        insightId
      }
    }
  }
`;

const WORKSPACE_TEMPLATES = /* GraphQL */ `
  query WorkspaceInsightTemplatesSnapshot($workspaceId: String!) {
    workspaceInsightTemplates(workspaceId: $workspaceId) {
      id
      name
      type
      description
      version
      workspaceId
      metadata
      query
      createdAt
      updatedAt
      createdBy
      updatedBy
    }
  }
`;

interface ProjectRef {
  id: string;
  name: string;
  workspaceId: string | null;
}

type ProjectsPage = { activeUser: { projects: { cursor: string | null; items: ProjectRef[] } } | null };

async function listAccessibleProjects(sk: Speckle): Promise<ProjectRef[]> {
  const out: ProjectRef[] = [];
  let cursor: string | null = null;
  for (let page = 0; page < MAX_PROJECT_PAGES; page++) {
    const data = (await sk.http.request<ProjectsPage>(MY_PROJECTS, { cursor })) as ProjectsPage;
    const pageData = data.activeUser?.projects;
    if (!pageData) break;
    out.push(...pageData.items);
    cursor = pageData.cursor;
    if (!cursor) break;
  }
  return out;
}

async function fetchProjectInsights(sk: Speckle, projectId: string): Promise<unknown[] | null> {
  try {
    const data = await sk.http.request<{ projectInsights: unknown[] }>(PROJECT_INSIGHTS, { projectId });
    return data.projectInsights;
  } catch (err) {
    console.warn(`projectInsights failed for ${projectId}:`, (err as Error).message);
    return null;
  }
}

async function fetchWorkspaceTemplates(sk: Speckle, workspaceId: string): Promise<unknown[] | null> {
  try {
    const data = await sk.http.request<{ workspaceInsightTemplates: unknown[] }>(WORKSPACE_TEMPLATES, {
      workspaceId,
    });
    return data.workspaceInsightTemplates;
  } catch (err) {
    console.warn(`workspaceInsightTemplates failed for ${workspaceId}:`, (err as Error).message);
    return null;
  }
}

const TIMEOUT_MS = Number(process.env.SPECKLE_INSIGHTS_TIMEOUT_MS ?? 120_000);

test.skipIf(!TOKEN)("snapshot insight* queries to JSON for offline search", async () => {
  const sk = new Speckle({ server: SERVER, token: TOKEN });

  const projects: ProjectRef[] = PROJECT_FILTER
    ? [{ id: PROJECT_FILTER, name: "<filtered>", workspaceId: WORKSPACE_FILTER ?? null }]
    : await listAccessibleProjects(sk);

  const insightsByProject: Record<string, { project: ProjectRef; insights: unknown[] }> = {};
  for (const p of projects) {
    const insights = await fetchProjectInsights(sk, p.id);
    if (insights && insights.length > 0) {
      insightsByProject[p.id] = { project: p, insights };
    }
  }

  const workspaceIds = WORKSPACE_FILTER
    ? new Set([WORKSPACE_FILTER])
    : new Set(projects.map((p) => p.workspaceId).filter((id): id is string => Boolean(id)));

  const templatesByWorkspace: Record<string, unknown[]> = {};
  for (const wsId of workspaceIds) {
    const templates = await fetchWorkspaceTemplates(sk, wsId);
    if (templates && templates.length > 0) {
      templatesByWorkspace[wsId] = templates;
    }
  }

  const snapshot = {
    server: SERVER,
    capturedAt: new Date().toISOString(),
    projectCount: projects.length,
    insightsByProject,
    templatesByWorkspace,
  };

  await Bun.write(OUT_PATH, JSON.stringify(snapshot, null, 2));
  await sk.dispose();

  console.log(
    `wrote ${OUT_PATH}: ${Object.keys(insightsByProject).length} projects with insights, ${Object.keys(templatesByWorkspace).length} workspaces with templates`,
  );

  expect(snapshot.capturedAt).toBeTruthy();
}, TIMEOUT_MS);
