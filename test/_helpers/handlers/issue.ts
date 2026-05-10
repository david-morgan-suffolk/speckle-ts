import type { GraphQLHandler } from "../graphql.js";
import type {
  IssueInfo,
  IssueReplyInfo,
  IssueParticipantInfo,
} from "../../../src/types.js";
import type { PageEnvelope } from "./project.js";

export const issueParticipantFixture = (
  id: string,
  name: string,
): IssueParticipantInfo => ({ id, user: { id, name } });

export const issueFixture = (overrides: Partial<IssueInfo> = {}): IssueInfo => ({
  id: "iss_1",
  identifier: "PROJ-1",
  number: 1,
  projectId: "p1",
  title: "Sample issue",
  rawDescription: null,
  status: "open",
  priority: "medium",
  createdAt: "2026-05-01T00:00:00Z",
  updatedAt: "2026-05-01T00:00:00Z",
  dueDate: null,
  viewedAt: null,
  resourceIdString: null,
  author: issueParticipantFixture("u_1", "Alice"),
  assignee: null,
  ...overrides,
});

export const issueReplyFixture = (
  id: string,
  overrides: Partial<IssueReplyInfo> = {},
): IssueReplyInfo => ({
  id,
  issueId: "iss_1",
  projectId: "p1",
  rawDescription: null,
  createdAt: "2026-05-01T00:00:00Z",
  author: issueParticipantFixture("u_1", "Alice"),
  ...overrides,
});

export const projectIssuesHandler =
  (page: PageEnvelope<IssueInfo>): GraphQLHandler =>
  () => ({ project: { issues: page } });

export const issueHandler =
  (issue: IssueInfo): GraphQLHandler =>
  () => ({ project: { issue } });

export const issueRepliesHandler =
  (page: PageEnvelope<IssueReplyInfo>): GraphQLHandler =>
  () => ({ project: { issue: { replies: page } } });

export const createIssueHandler =
  (issue: IssueInfo): GraphQLHandler =>
  () => ({ projectMutations: { issues: { createIssue: issue } } });

export const createReplyHandler =
  (reply: IssueReplyInfo): GraphQLHandler =>
  () => ({ projectMutations: { issues: { createReply: reply } } });

export const updateIssueHandler =
  (issue: IssueInfo): GraphQLHandler =>
  () => ({ projectMutations: { issues: { updateIssue: issue } } });

export const deleteIssueHandler =
  (success = true): GraphQLHandler =>
  () => ({ projectMutations: { issues: { deleteIssue: success } } });

export const markIssueViewedHandler =
  (success = true): GraphQLHandler =>
  () => ({ projectMutations: { issues: { markIssueViewed: success } } });
