import { test, expect } from "bun:test";
import { Speckle } from "../../src/client.js";
import { AccountInfoSchema } from "../../src/schemas.js";

const TOKEN = process.env.SPECKLE_TOKEN;
const SERVER = process.env.SPECKLE_SERVER ?? "https://app.speckle.systems";
const TIMEOUT_MS = Number(process.env.SPECKLE_ACCOUNT_TIMEOUT_MS ?? 30_000);

test.skipIf(!TOKEN)(
  "Account.get returns role + permissions matching schema",
  async () => {
    const sk = new Speckle({ server: SERVER, token: TOKEN });
    try {
      const account = await sk.account.get;

      expect(account.id).toBeTruthy();
      expect(typeof account.name).toBe("string");

      const validRoles = new Set(["server:admin", "server:user", "server:guest", "server:archived-user"]);
      if (account.role !== null) {
        expect(validRoles.has(account.role)).toBe(true);
      }

      const p = account.permissions;
      const checks = [
        p.canAccessServerAdminPanel,
        p.canCreatePersonalProject,
        p.canCreateWorkspace,
        p.canManageServerRegions,
        p.canManageServerUsers,
        p.canManageServerWorkspaces,
        p.canSupportServerUsers,
        p.canUpdateServerSettings,
        p.canUsePowerTools,
      ];
      for (const c of checks) {
        expect(typeof c.authorized).toBe("boolean");
        expect(typeof c.code).toBe("string");
        expect(typeof c.message).toBe("string");
      }

      expect(AccountInfoSchema.safeParse(account).success).toBe(true);

      console.log(
        `account ${account.id} role=${account.role} canCreateWorkspace=${p.canCreateWorkspace.authorized} canCreatePersonalProject=${p.canCreatePersonalProject.authorized}`,
      );
    } finally {
      await sk.dispose();
    }
  },
  TIMEOUT_MS,
);
