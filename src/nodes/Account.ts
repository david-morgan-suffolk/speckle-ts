import { Node } from "./Node.js";
import { assertExists, parseOrThrow } from "../transport/validate.js";
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
    const user = assertExists(data.activeUser, "Account");
    return parseOrThrow("Account", AccountInfoSchema, user);
  }
}
