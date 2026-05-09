import { test, expect } from "bun:test";
import { Speckle } from "../../src/client.js";
import {
  WorkspaceInfoSchema,
  WorkspaceLimitsSchema,
  WorkspacePlanInfoSchema,
  WorkspacePlanUsageSchema,
  WorkspaceSubscriptionInfoSchema,
  WorkspaceSubscriptionSeatsSchema,
} from "../../src/schemas.js";

const SAMPLE_LIMITS = {
  commentsHistoryInDays: 30,
  dashboardCount: 10,
  modelCount: null,
  projectCount: 25,
  userCount: 50,
  versionCount: null,
  versionsHistoryInDays: 365,
};

const SAMPLE_USAGE = {
  dashboardCount: 3,
  projectCount: 7,
  sync: {
    versionSyncsMonthly: 12,
    versionSyncsTotal: 144,
    versionsLoadedMonthly: 8,
    versionsLoadedTotal: 96,
    versionsPublishedMonthly: 4,
    versionsPublishedTotal: 48,
  },
  users: { pendingUserCount: 1, userCount: 9 },
  versions: { pendingVersionCount: 0, versionCount: 22 },
};

const SAMPLE_PLAN = {
  createdAt: "2026-01-01T00:00:00Z",
  features: ["workspaceProjects", "automate"],
  limitOverrides: null,
  limits: SAMPLE_LIMITS,
  name: "business",
  paymentMethod: "billing",
  status: "valid",
  usage: SAMPLE_USAGE,
  validUntil: null,
};

const SAMPLE_SEATS = {
  editors: { assigned: 4, available: 10 },
  viewers: { assigned: 12, available: 50 },
};

const SAMPLE_SUBSCRIPTION = {
  addOn: { currentQuantity: 0 },
  billingInterval: "monthly",
  createdAt: "2026-01-01T00:00:00Z",
  currency: "usd",
  currentBillingCycleEnd: "2026-06-01T00:00:00Z",
  seats: SAMPLE_SEATS,
  updatedAt: "2026-05-01T00:00:00Z",
};

test("WorkspaceInfoSchema requires readOnly", () => {
  const sample = {
    id: "w1",
    name: "Acme",
    slug: "acme",
    description: null,
    createdAt: "2026-01-01T00:00:00Z",
    readOnly: false,
  };
  const parsed = WorkspaceInfoSchema.parse(sample);
  expect(parsed.readOnly).toBe(false);
});

test("WorkspaceLimitsSchema accepts mixed null/number", () => {
  const parsed = WorkspaceLimitsSchema.parse(SAMPLE_LIMITS);
  expect(parsed.modelCount).toBeNull();
  expect(parsed.projectCount).toBe(25);
});

test("WorkspacePlanUsageSchema parses nested counts", () => {
  const parsed = WorkspacePlanUsageSchema.parse(SAMPLE_USAGE);
  expect(parsed.sync.versionSyncsMonthly).toBe(12);
  expect(parsed.users.pendingUserCount).toBe(1);
  expect(parsed.versions.versionCount).toBe(22);
});

test("WorkspacePlanInfoSchema parses full plan with limits + usage", () => {
  const parsed = WorkspacePlanInfoSchema.parse(SAMPLE_PLAN);
  expect(parsed.name).toBe("business");
  expect(parsed.status).toBe("valid");
  expect(parsed.limits.projectCount).toBe(25);
  expect(parsed.usage.users.userCount).toBe(9);
  expect(parsed.validUntil).toBeNull();
});

test("WorkspaceSubscriptionSeatsSchema parses editors and viewers", () => {
  const parsed = WorkspaceSubscriptionSeatsSchema.parse(SAMPLE_SEATS);
  expect(parsed.editors.assigned).toBe(4);
  expect(parsed.viewers.available).toBe(50);
});

test("WorkspaceSubscriptionInfoSchema parses full subscription", () => {
  const parsed = WorkspaceSubscriptionInfoSchema.parse(SAMPLE_SUBSCRIPTION);
  expect(parsed.billingInterval).toBe("monthly");
  expect(parsed.addOn.currentQuantity).toBe(0);
  expect(parsed.seats.editors.assigned).toBe(4);
});

test("Workspace.plan returns null when server reports no plan", async () => {
  const fakeFetch = (async () =>
    new Response(JSON.stringify({ data: { workspace: { plan: null } } }), {
      status: 200,
      headers: { "content-type": "application/json" },
    })) as unknown as typeof fetch;
  const sk = new Speckle({ fetch: fakeFetch });
  const plan = await sk.workspace("w1").plan();
  expect(plan).toBeNull();
  await sk.dispose();
});

test("Workspace.plan throws when workspace itself is null", async () => {
  const fakeFetch = (async () =>
    new Response(JSON.stringify({ data: { workspace: null } }), {
      status: 200,
      headers: { "content-type": "application/json" },
    })) as unknown as typeof fetch;
  const sk = new Speckle({ fetch: fakeFetch });
  await expect(sk.workspace("missing").plan()).rejects.toThrow();
  await sk.dispose();
});

test("Workspace.limits parses limits subtree", async () => {
  const fakeFetch = (async () =>
    new Response(
      JSON.stringify({
        data: { workspace: { plan: { limits: SAMPLE_LIMITS } } },
      }),
      { status: 200, headers: { "content-type": "application/json" } },
    )) as unknown as typeof fetch;
  const sk = new Speckle({ fetch: fakeFetch });
  const limits = await sk.workspace("w1").limits();
  expect(limits?.projectCount).toBe(25);
  expect(limits?.modelCount).toBeNull();
  await sk.dispose();
});

test("Workspace.billing returns combined shape with nullables", async () => {
  let capturedBody: unknown = null;
  const fakeFetch = (async (_url: string | URL | Request, init?: RequestInit) => {
    capturedBody = init?.body ? JSON.parse(init.body as string) : null;
    return new Response(
      JSON.stringify({
        data: {
          workspace: {
            plan: SAMPLE_PLAN,
            subscription: SAMPLE_SUBSCRIPTION,
            seats: null,
          },
        },
      }),
      { status: 200, headers: { "content-type": "application/json" } },
    );
  }) as unknown as typeof fetch;
  const sk = new Speckle({ fetch: fakeFetch });
  const billing = await sk.workspace("w1").billing();
  expect(billing.plan?.name).toBe("business");
  expect(billing.subscription?.billingInterval).toBe("monthly");
  expect(billing.seats).toBeNull();
  expect((capturedBody as { variables: { id: string } }).variables.id).toBe("w1");
  await sk.dispose();
});
