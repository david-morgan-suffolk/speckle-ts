import { Node } from "./Node.js";
import { assertExists, parseOrThrow } from "../transport/validate.js";
import { WebhookInfoSchema, WebhookEventInfoSchema } from "../schemas.js";
import { z } from "zod";
import type { Project } from "./Project.js";
import type { Speckle } from "../client.js";
import type {
  CreateWebhookInput,
  UpdateWebhookInput,
  WebhookEventInfo,
  WebhookInfo,
} from "../types.js";

const WEBHOOK_FIELDS = /* GraphQL */ `
  id
  url
  triggers
  enabled
  description
`;

const LIST_WEBHOOKS_QUERY = /* GraphQL */ `
  query ListWebhooks($projectId: String!) {
    project(id: $projectId) {
      webhooks {
        totalCount
        items {
          ${WEBHOOK_FIELDS}
        }
      }
    }
  }
`;

const WEBHOOK_HISTORY_QUERY = /* GraphQL */ `
  query WebhookHistory($projectId: String!, $limit: Int) {
    project(id: $projectId) {
      webhooks {
        items {
          id
          history(limit: $limit) {
            totalCount
            items {
              id
              webhookId
              payload
              status
              statusInfo
              lastUpdate
              retryCount
            }
          }
        }
      }
    }
  }
`;

const CREATE_WEBHOOK_MUTATION = /* GraphQL */ `
  mutation CreateWebhook($webhook: WebhookCreateInput!) {
    webhookCreate(webhook: $webhook)
  }
`;

const UPDATE_WEBHOOK_MUTATION = /* GraphQL */ `
  mutation UpdateWebhook($webhook: WebhookUpdateInput!) {
    webhookUpdate(webhook: $webhook)
  }
`;

const DELETE_WEBHOOK_MUTATION = /* GraphQL */ `
  mutation DeleteWebhook($webhook: WebhookDeleteInput!) {
    webhookDelete(webhook: $webhook)
  }
`;

const WebhookListSchema = z.array(WebhookInfoSchema);
const WebhookHistorySchema = z.array(WebhookEventInfoSchema);

export async function listWebhooks(
  speckle: Speckle,
  projectId: string,
): Promise<WebhookInfo[]> {
  const data = await speckle.http.request<
    { project: { webhooks: { items: unknown[] } } | null },
    { projectId: string }
  >(LIST_WEBHOOKS_QUERY, { projectId });
  const project = assertExists(data.project, "Project", projectId);
  return parseOrThrow("Webhooks", WebhookListSchema, project.webhooks.items);
}

interface WebhookHistoryWrapper {
  id: string;
  history: { items: unknown[] } | null;
}

export async function getWebhookHistory(
  speckle: Speckle,
  projectId: string,
  webhookId: string,
  limit?: number,
): Promise<WebhookEventInfo[]> {
  const data = await speckle.http.request<
    { project: { webhooks: { items: WebhookHistoryWrapper[] } } | null },
    { projectId: string; limit?: number }
  >(WEBHOOK_HISTORY_QUERY, {
    projectId,
    ...(limit !== undefined ? { limit } : {}),
  });
  const project = assertExists(data.project, "Project", projectId);
  const found = project.webhooks.items.find((w) => w.id === webhookId);
  const wh = assertExists(found, "Webhook", webhookId);
  return parseOrThrow(
    "WebhookHistory",
    WebhookHistorySchema,
    wh.history?.items ?? [],
  );
}

export async function createWebhook(
  speckle: Speckle,
  projectId: string,
  input: CreateWebhookInput,
): Promise<string> {
  const data = await speckle.http.request<
    { webhookCreate: string },
    { webhook: CreateWebhookInput & { streamId: string } }
  >(CREATE_WEBHOOK_MUTATION, {
    webhook: { streamId: projectId, ...input },
  });
  return data.webhookCreate;
}

export async function updateWebhook(
  speckle: Speckle,
  projectId: string,
  webhookId: string,
  patch: UpdateWebhookInput,
): Promise<string> {
  const data = await speckle.http.request<
    { webhookUpdate: string },
    { webhook: UpdateWebhookInput & { id: string; streamId: string } }
  >(UPDATE_WEBHOOK_MUTATION, {
    webhook: { id: webhookId, streamId: projectId, ...patch },
  });
  return data.webhookUpdate;
}

export async function deleteWebhook(
  speckle: Speckle,
  projectId: string,
  webhookId: string,
): Promise<string> {
  const data = await speckle.http.request<
    { webhookDelete: string },
    { webhook: { id: string; streamId: string } }
  >(DELETE_WEBHOOK_MUTATION, {
    webhook: { id: webhookId, streamId: projectId },
  });
  return data.webhookDelete;
}

export class Webhook extends Node<WebhookInfo> {
  readonly id: string;
  readonly project: Project;

  constructor(speckle: Speckle, project: Project, id: string) {
    super(speckle, project);
    this.project = project;
    this.id = id;
  }

  /**
   * Server has no single-webhook query; this lists all webhooks on the project
   * and filters by id. Cheap for typical webhook counts; prefer
   * Project.webhooks() when iterating many.
   */
  protected async fetch(): Promise<WebhookInfo> {
    const all = await listWebhooks(this.speckle, this.project.id);
    const found = all.find((w) => w.id === this.id);
    return assertExists(found, "Webhook", this.id);
  }

  history(limit?: number): Promise<WebhookEventInfo[]> {
    return getWebhookHistory(this.speckle, this.project.id, this.id, limit);
  }

  update(patch: UpdateWebhookInput): Promise<string> {
    return updateWebhook(this.speckle, this.project.id, this.id, patch);
  }

  delete(): Promise<string> {
    return deleteWebhook(this.speckle, this.project.id, this.id);
  }
}
