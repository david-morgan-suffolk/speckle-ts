import { Node } from "./Node.js";
import { assertExists, parseOrThrow } from "../transport/validate.js";
import { UserInfoSchema } from "../schemas.js";
import type { Speckle } from "../client.js";
import type { UserInfo } from "../types.js";

const ACTIVE_USER_QUERY = /* GraphQL */ `
  query ActiveUser {
    activeUser {
      id
      name
      email
      bio
      company
      avatar
      createdAt
    }
  }
`;

const USER_QUERY = /* GraphQL */ `
  query User($id: String!) {
    user(id: $id) {
      id
      name
      bio
      company
      avatar
      createdAt
    }
  }
`;

export class User extends Node<UserInfo> {
  readonly id: string | null;

  private constructor(speckle: Speckle, id: string | null) {
    super(speckle, null);
    this.id = id;
  }

  static byId(speckle: Speckle, id: string): User {
    return new User(speckle, id);
  }

  static active(speckle: Speckle): User {
    return new User(speckle, null);
  }

  protected async fetch(): Promise<UserInfo> {
    if (this.id === null) {
      const data = await this.speckle.http.request<{ activeUser: unknown }>(ACTIVE_USER_QUERY);
      const user = assertExists(data.activeUser, "ActiveUser");
      return parseOrThrow("ActiveUser", UserInfoSchema, user);
    }
    const data = await this.speckle.http.request<{ user: unknown }, { id: string }>(USER_QUERY, {
      id: this.id,
    });
    const user = assertExists(data.user, "User", this.id);
    return parseOrThrow("User", UserInfoSchema, user);
  }
}
