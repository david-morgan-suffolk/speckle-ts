import { Node } from "./Node.js";
import { parseOrThrow } from "../transport/validate.js";
import { AccountInfoSchema } from "../schemas.js";
import type { Speckle } from "../client.js";
import type { AccountInfo } from "../types.js";

const ACCOUNT_QUERY = /* GraphQL */ `
  query Account {
    activeUser {
      id
      name
      email
      role
      verified
      hasPendingVerification
      isOnboardingFinished
      permissions {
        canAccessServerAdminPanel {
          authorized
          code
          message
        }
        canCreatePersonalProject {
          authorized
          code
          message
        }
        canCreateWorkspace {
          authorized
          code
          message
        }
        canManageServerRegions {
          authorized
          code
          message
        }
        canManageServerUsers {
          authorized
          code
          message
        }
        canManageServerWorkspaces {
          authorized
          code
          message
        }
        canSupportServerUsers {
          authorized
          code
          message
        }
        canUpdateServerSettings {
          authorized
          code
          message
        }
        canUsePowerTools {
          authorized
          code
          message
        }
      }
    }
  }
`;

export class Account extends Node<AccountInfo> {
  constructor(speckle: Speckle) {
    super(speckle, null);
  }

  protected async fetch(): Promise<AccountInfo> {
    const data = await this.speckle.http.request<{ activeUser: unknown }>(ACCOUNT_QUERY);
    if (!data.activeUser) throw new Error("No active account — token missing or invalid");
    return parseOrThrow("Account", AccountInfoSchema, data.activeUser);
  }
}
