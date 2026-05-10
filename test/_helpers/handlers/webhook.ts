import type { GraphQLHandler } from "../graphql.js";
import type { WebhookInfo, WebhookEventInfo } from "../../../src/types.js";

export const webhookFixture = (overrides: Partial<WebhookInfo> = {}): WebhookInfo => ({
  id: "wh_1",
  url: "https://example.com/hook",
  triggers: ["version_create"],
  enabled: true,
  description: null,
  ...overrides,
});

export const webhookEventFixture = (
  id: string,
  overrides: Partial<WebhookEventInfo> = {},
): WebhookEventInfo => ({
  id,
  webhookId: "wh_1",
  payload: "{}",
  status: 200,
  statusInfo: "ok",
  lastUpdate: "2026-05-01T00:00:00Z",
  retryCount: 0,
  ...overrides,
});

export const listWebhooksHandler =
  (webhooks: WebhookInfo[]): GraphQLHandler =>
  () => ({
    project: { webhooks: { totalCount: webhooks.length, items: webhooks } },
  });

export const webhookHistoryHandler =
  (
    historyByWebhookId: Record<string, WebhookEventInfo[]>,
  ): GraphQLHandler =>
  () => ({
    project: {
      webhooks: {
        items: Object.entries(historyByWebhookId).map(([id, items]) => ({
          id,
          history: { totalCount: items.length, items },
        })),
      },
    },
  });

export const createWebhookHandler =
  (id: string): GraphQLHandler =>
  () => ({ webhookCreate: id });

export const updateWebhookHandler =
  (id: string): GraphQLHandler =>
  () => ({ webhookUpdate: id });

export const deleteWebhookHandler =
  (id: string): GraphQLHandler =>
  () => ({ webhookDelete: id });
