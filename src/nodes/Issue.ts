import { Node } from "./Node.js";
import { assertExists, parseOrThrow } from "../transport/validate.js";
import {
  IssueInfoSchema,
  IssueReplyInfoSchema,
  IssuesPageSchema,
  IssueRepliesPageSchema,
} from "../schemas.js";
import type { Project } from "./Project.js";
import type { Speckle } from "../client.js";
import type {
  CreateIssueInput,
  CreateIssueReplyInput,
  IssueInfo,
  IssueReplyInfo,
  IssuesFilter,
  PageInfo,
  UpdateIssueInput,
} from "../types.js";

const ISSUE_PARTICIPANT_FRAGMENT = /* GraphQL */ `
  id
  user { id name }
`;

const ISSUE_FIELDS = /* GraphQL */ `
  id
  identifier
  number
  projectId
  title
  rawDescription
  status
  priority
  createdAt
  updatedAt
  dueDate
  viewedAt
  resourceIdString
  author { ${ISSUE_PARTICIPANT_FRAGMENT} }
  assignee { ${ISSUE_PARTICIPANT_FRAGMENT} }
`;

const ISSUE_REPLY_FIELDS = /* GraphQL */ `
  id
  issueId
  projectId
  rawDescription
  createdAt
  author { ${ISSUE_PARTICIPANT_FRAGMENT} }
`;

const ISSUE_QUERY = /* GraphQL */ `
  query GetIssue($projectId: String!, $issueId: ID!) {
    project(id: $projectId) {
      issue(id: $issueId) { ${ISSUE_FIELDS} }
    }
  }
`;

const PROJECT_ISSUES_QUERY = /* GraphQL */ `
  query GetProjectIssues($projectId: String!, $input: ProjectIssuesInput) {
    project(id: $projectId) {
      issues(input: $input) {
        totalCount
        cursor
        items { ${ISSUE_FIELDS} }
      }
    }
  }
`;

const ISSUE_REPLIES_QUERY = /* GraphQL */ `
  query GetIssueReplies($projectId: String!, $issueId: ID!, $input: IssueRepliesInput) {
    project(id: $projectId) {
      issue(id: $issueId) {
        replies(input: $input) {
          totalCount
          cursor
          items { ${ISSUE_REPLY_FIELDS} }
        }
      }
    }
  }
`;

const CREATE_ISSUE_MUTATION = /* GraphQL */ `
  mutation CreateIssue($input: CreateIssueInput!) {
    projectMutations {
      issues {
        createIssue(input: $input) { ${ISSUE_FIELDS} }
      }
    }
  }
`;

const CREATE_REPLY_MUTATION = /* GraphQL */ `
  mutation CreateIssueReply($input: CreateIssueReplyInput!) {
    projectMutations {
      issues {
        createReply(input: $input) { ${ISSUE_REPLY_FIELDS} }
      }
    }
  }
`;

const UPDATE_ISSUE_MUTATION = /* GraphQL */ `
  mutation UpdateIssue($input: UpdateIssueInput!) {
    projectMutations {
      issues {
        updateIssue(input: $input) { ${ISSUE_FIELDS} }
      }
    }
  }
`;

const DELETE_ISSUE_MUTATION = /* GraphQL */ `
  mutation DeleteIssue($input: DeleteIssueInput!) {
    projectMutations {
      issues {
        deleteIssue(input: $input)
      }
    }
  }
`;

const MARK_ISSUE_VIEWED_MUTATION = /* GraphQL */ `
  mutation MarkIssueViewed($input: MarkIssueViewedInput!) {
    projectMutations {
      issues {
        markIssueViewed(input: $input)
      }
    }
  }
`;

function issuesInput(filter?: IssuesFilter): Record<string, unknown> | undefined {
  if (!filter) return undefined;
  const out: Record<string, unknown> = {};
  if (filter.resourceIdString !== undefined) out["resourceIdString"] = filter.resourceIdString;
  if (filter.search !== undefined) out["search"] = filter.search;
  if (filter.statuses !== undefined) out["statuses"] = filter.statuses;
  if (filter.loadedVersionsOnly !== undefined)
    out["loadedVersionsOnly"] = filter.loadedVersionsOnly;
  if (filter.cursor !== undefined) out["cursor"] = filter.cursor;
  if (filter.limit !== undefined) out["limit"] = filter.limit;
  return out;
}

export async function listProjectIssues(
  speckle: Speckle,
  projectId: string,
  filter?: IssuesFilter,
): Promise<PageInfo<IssueInfo>> {
  const input = issuesInput(filter);
  const data = await speckle.http.request<
    { project: { issues: unknown } | null },
    Record<string, unknown>
  >(PROJECT_ISSUES_QUERY, {
    projectId,
    ...(input !== undefined ? { input } : {}),
  });
  const project = assertExists(data.project, "Project", projectId);
  return parseOrThrow("ProjectIssues", IssuesPageSchema, project.issues);
}

export async function* iterateProjectIssues(
  speckle: Speckle,
  projectId: string,
  filter?: IssuesFilter,
): AsyncIterable<IssueInfo> {
  let cursor: string | null | undefined = filter?.cursor;
  while (true) {
    const page = await listProjectIssues(speckle, projectId, {
      ...(filter ?? {}),
      ...(cursor !== undefined && cursor !== null ? { cursor } : {}),
    });
    for (const item of page.items) yield item;
    if (!page.cursor) break;
    cursor = page.cursor;
  }
}

export async function listAllProjectIssues(
  speckle: Speckle,
  projectId: string,
  filter?: IssuesFilter,
): Promise<IssueInfo[]> {
  const out: IssueInfo[] = [];
  for await (const it of iterateProjectIssues(speckle, projectId, filter)) {
    out.push(it);
  }
  return out;
}

export async function getIssue(
  speckle: Speckle,
  projectId: string,
  issueId: string,
): Promise<IssueInfo> {
  const data = await speckle.http.request<
    { project: { issue: unknown } | null },
    { projectId: string; issueId: string }
  >(ISSUE_QUERY, { projectId, issueId });
  const project = assertExists(data.project, "Project", projectId);
  const issue = assertExists(project.issue, "Issue", issueId);
  return parseOrThrow("Issue", IssueInfoSchema, issue);
}

export interface IssueRepliesOptions {
  cursor?: string | null;
  limit?: number;
  sortDirection?: "asc" | "desc";
}

function repliesInput(opts?: IssueRepliesOptions): Record<string, unknown> | undefined {
  if (!opts) return undefined;
  const out: Record<string, unknown> = {};
  if (opts.cursor !== undefined && opts.cursor !== null) out["cursor"] = opts.cursor;
  if (opts.limit !== undefined) out["limit"] = opts.limit;
  if (opts.sortDirection !== undefined) out["sortDirection"] = opts.sortDirection;
  return Object.keys(out).length > 0 ? out : undefined;
}

export async function listIssueReplies(
  speckle: Speckle,
  projectId: string,
  issueId: string,
  opts?: IssueRepliesOptions,
): Promise<PageInfo<IssueReplyInfo>> {
  const input = repliesInput(opts);
  const data = await speckle.http.request<
    { project: { issue: { replies: unknown } | null } | null },
    Record<string, unknown>
  >(ISSUE_REPLIES_QUERY, {
    projectId,
    issueId,
    ...(input !== undefined ? { input } : {}),
  });
  const project = assertExists(data.project, "Project", projectId);
  const issue = assertExists(project.issue, "Issue", issueId);
  return parseOrThrow("IssueReplies", IssueRepliesPageSchema, issue.replies);
}

export async function* iterateIssueReplies(
  speckle: Speckle,
  projectId: string,
  issueId: string,
  opts?: Omit<IssueRepliesOptions, "cursor">,
): AsyncIterable<IssueReplyInfo> {
  let cursor: string | null | undefined = undefined;
  while (true) {
    const page = await listIssueReplies(speckle, projectId, issueId, {
      ...(opts ?? {}),
      ...(cursor !== undefined && cursor !== null ? { cursor } : {}),
    });
    for (const item of page.items) yield item;
    if (!page.cursor) break;
    cursor = page.cursor;
  }
}

export async function createIssue(
  speckle: Speckle,
  projectId: string,
  input: CreateIssueInput,
): Promise<IssueInfo> {
  const data = await speckle.http.request<
    { projectMutations: { issues: { createIssue: unknown } } },
    { input: CreateIssueInput & { projectId: string } }
  >(CREATE_ISSUE_MUTATION, { input: { projectId, ...input } });
  return parseOrThrow(
    "CreateIssue",
    IssueInfoSchema,
    data.projectMutations.issues.createIssue,
  );
}

export async function createIssueReply(
  speckle: Speckle,
  projectId: string,
  issueId: string,
  input: CreateIssueReplyInput,
): Promise<IssueReplyInfo> {
  const data = await speckle.http.request<
    { projectMutations: { issues: { createReply: unknown } } },
    { input: CreateIssueReplyInput & { projectId: string; issueId: string } }
  >(CREATE_REPLY_MUTATION, { input: { projectId, issueId, ...input } });
  return parseOrThrow(
    "CreateIssueReply",
    IssueReplyInfoSchema,
    data.projectMutations.issues.createReply,
  );
}

export async function updateIssue(
  speckle: Speckle,
  projectId: string,
  issueId: string,
  patch: UpdateIssueInput,
): Promise<IssueInfo> {
  const data = await speckle.http.request<
    { projectMutations: { issues: { updateIssue: unknown } } },
    { input: UpdateIssueInput & { projectId: string; issueId: string } }
  >(UPDATE_ISSUE_MUTATION, { input: { projectId, issueId, ...patch } });
  return parseOrThrow(
    "UpdateIssue",
    IssueInfoSchema,
    data.projectMutations.issues.updateIssue,
  );
}

export async function deleteIssue(
  speckle: Speckle,
  projectId: string,
  issueId: string,
): Promise<boolean> {
  const data = await speckle.http.request<
    { projectMutations: { issues: { deleteIssue: boolean } } },
    { input: { projectId: string; issueId: string } }
  >(DELETE_ISSUE_MUTATION, { input: { projectId, issueId } });
  return data.projectMutations.issues.deleteIssue;
}

export async function markIssueViewed(
  speckle: Speckle,
  projectId: string,
  issueId: string,
): Promise<boolean> {
  const data = await speckle.http.request<
    { projectMutations: { issues: { markIssueViewed: boolean } } },
    { input: { projectId: string; issueId: string } }
  >(MARK_ISSUE_VIEWED_MUTATION, { input: { projectId, issueId } });
  return data.projectMutations.issues.markIssueViewed;
}

export class Issue extends Node<IssueInfo> {
  readonly id: string;
  readonly project: Project;

  constructor(speckle: Speckle, project: Project, id: string) {
    super(speckle, project);
    this.project = project;
    this.id = id;
  }

  protected fetch(): Promise<IssueInfo> {
    return getIssue(this.speckle, this.project.id, this.id);
  }

  listReplies(opts?: IssueRepliesOptions): Promise<PageInfo<IssueReplyInfo>> {
    return listIssueReplies(this.speckle, this.project.id, this.id, opts);
  }

  replies(opts?: Omit<IssueRepliesOptions, "cursor">): AsyncIterable<IssueReplyInfo> {
    return iterateIssueReplies(this.speckle, this.project.id, this.id, opts);
  }

  reply(input: CreateIssueReplyInput): Promise<IssueReplyInfo> {
    return createIssueReply(this.speckle, this.project.id, this.id, input);
  }

  update(patch: UpdateIssueInput): Promise<IssueInfo> {
    return updateIssue(this.speckle, this.project.id, this.id, patch);
  }

  delete(): Promise<boolean> {
    return deleteIssue(this.speckle, this.project.id, this.id);
  }

  markViewed(): Promise<boolean> {
    return markIssueViewed(this.speckle, this.project.id, this.id);
  }
}
