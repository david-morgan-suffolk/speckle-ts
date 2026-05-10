import { test, expect } from "bun:test";
import {
  mockSpeckle,
  webhookFixture,
  webhookEventFixture,
  listWebhooksHandler,
  webhookHistoryHandler,
  createWebhookHandler,
  updateWebhookHandler,
  deleteWebhookHandler,
} from "../_helpers/index.js";
import { Webhook } from "../../src/nodes/Webhook.js";

test("Project.webhooks lists project webhooks", async () => {
  const wh = webhookFixture({ id: "wh_a", url: "https://a.test" });
  const { sk, callsFor } = mockSpeckle({
    ListWebhooks: listWebhooksHandler([wh]),
  });
  const list = await sk.project("p1").webhooks();
  expect(list).toHaveLength(1);
  expect(list[0]?.id).toBe("wh_a");
  expect(callsFor("ListWebhooks")[0]?.variables).toEqual({ projectId: "p1" });
  await sk.dispose();
});

test("Project.webhook returns Webhook ref without fetching", async () => {
  const { sk, calls } = mockSpeckle({});
  const wh = sk.project("p1").webhook("wh_x");
  expect(wh).toBeInstanceOf(Webhook);
  expect(wh.id).toBe("wh_x");
  expect(wh.project.id).toBe("p1");
  expect(calls).toHaveLength(0);
  await sk.dispose();
});

test("Webhook.get list-and-finds by id", async () => {
  const { sk } = mockSpeckle({
    ListWebhooks: listWebhooksHandler([
      webhookFixture({ id: "wh_a", url: "https://a.test" }),
      webhookFixture({ id: "wh_b", url: "https://b.test" }),
    ]),
  });
  const wh = await sk.project("p1").webhook("wh_b").get;
  expect(wh.url).toBe("https://b.test");
  await sk.dispose();
});

test("Webhook.get throws when id is not in the list", async () => {
  const { sk } = mockSpeckle({
    ListWebhooks: listWebhooksHandler([webhookFixture({ id: "wh_a" })]),
  });
  await expect(sk.project("p1").webhook("missing").get).rejects.toThrow(
    /Webhook not found: missing/,
  );
  await sk.dispose();
});

test("Webhook.history filters events for the webhook id", async () => {
  const { sk, callsFor } = mockSpeckle({
    WebhookHistory: webhookHistoryHandler({
      wh_a: [webhookEventFixture("evt_a1"), webhookEventFixture("evt_a2")],
      wh_b: [webhookEventFixture("evt_b1")],
    }),
  });
  const events = await sk.project("p1").webhook("wh_a").history(20);
  expect(events.map((e) => e.id)).toEqual(["evt_a1", "evt_a2"]);
  expect(callsFor("WebhookHistory")[0]?.variables).toMatchObject({
    projectId: "p1",
    limit: 20,
  });
  await sk.dispose();
});

test("Project.createWebhook posts streamId-mapped input and returns Webhook ref", async () => {
  const { sk, callsFor } = mockSpeckle({
    CreateWebhook: createWebhookHandler("wh_new"),
  });
  const created = await sk.project("p1").createWebhook({
    url: "https://example.com",
    triggers: ["version_create"],
    enabled: true,
    description: "test",
  });
  expect(created).toBeInstanceOf(Webhook);
  expect(created.id).toBe("wh_new");
  const input = callsFor("CreateWebhook")[0]?.variables["webhook"] as {
    streamId: string;
    url: string;
    triggers: string[];
    description?: string;
  };
  expect(input.streamId).toBe("p1");
  expect(input.url).toBe("https://example.com");
  expect(input.triggers).toEqual(["version_create"]);
  expect(input.description).toBe("test");
  await sk.dispose();
});

test("Webhook.update sends partial patch with id + streamId", async () => {
  const { sk, callsFor } = mockSpeckle({
    UpdateWebhook: updateWebhookHandler("wh_a"),
  });
  const id = await sk.project("p1").webhook("wh_a").update({ enabled: false });
  expect(id).toBe("wh_a");
  const input = callsFor("UpdateWebhook")[0]?.variables["webhook"] as {
    id: string;
    streamId: string;
    enabled?: boolean;
  };
  expect(input).toEqual({ id: "wh_a", streamId: "p1", enabled: false });
  await sk.dispose();
});

test("Webhook.delete posts id + streamId only", async () => {
  const { sk, callsFor } = mockSpeckle({
    DeleteWebhook: deleteWebhookHandler("wh_a"),
  });
  const id = await sk.project("p1").webhook("wh_a").delete();
  expect(id).toBe("wh_a");
  expect(callsFor("DeleteWebhook")[0]?.variables["webhook"]).toEqual({
    id: "wh_a",
    streamId: "p1",
  });
  await sk.dispose();
});
