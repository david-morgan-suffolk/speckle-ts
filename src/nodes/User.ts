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
  readonly id: string;

  constructor(speckle: Speckle, id: string) {
    super(speckle, null);
    this.id = id;
  }

  protected async fetch(): Promise<UserInfo> {
    const data = await this.speckle.http.request<{ user: unknown }, { id: string }>(
      USER_QUERY,
      { id: this.id },
    );
    const user = assertExists(data.user, "User", this.id);
    return parseOrThrow("User", UserInfoSchema, user);
  }
}

export class ActiveUser extends Node<UserInfo> {
  constructor(speckle: Speckle) {
    super(speckle, null);
  }

  protected async fetch(): Promise<UserInfo> {
    const data = await this.speckle.http.request<{ activeUser: unknown }>(ACTIVE_USER_QUERY);
    const user = assertExists(data.activeUser, "ActiveUser");
    return parseOrThrow("ActiveUser", UserInfoSchema, user);
  }
}
