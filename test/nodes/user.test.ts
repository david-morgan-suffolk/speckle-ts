import { test, expect } from "bun:test";
import { Speckle } from "../../src/client.js";
import { ActiveUser, User } from "../../src/nodes/User.js";
import { mockSpeckle } from "../_helpers/index.js";
import type { UserInfo } from "../../src/types.js";

const sampleUser: UserInfo = {
  id: "u1",
  name: "Alice",
  email: "alice@example.com",
  bio: null,
  company: null,
  avatar: null,
  createdAt: "2024-01-01T00:00:00Z",
};

test("Speckle.user returns User with required id", () => {
  const sk = new Speckle();
  const user = sk.user("u1");
  expect(user).toBeInstanceOf(User);
  expect(user.id).toBe("u1");
});

test("Speckle.activeUser returns ActiveUser without id", () => {
  const sk = new Speckle();
  const me = sk.activeUser;
  expect(me).toBeInstanceOf(ActiveUser);
  expect(me).not.toBeInstanceOf(User);
});

test("User.get fetches by id via User query", async () => {
  const { sk, callsFor } = mockSpeckle({
    User: () => ({ user: sampleUser }),
  });
  const user = await sk.user("u1").get;
  expect(user.name).toBe("Alice");
  expect(callsFor("User")[0]?.variables).toEqual({ id: "u1" });
  await sk.dispose();
});

test("User.get throws when server returns null", async () => {
  const { sk } = mockSpeckle({
    User: () => ({ user: null }),
  });
  await expect(sk.user("missing").get).rejects.toThrow(/User not found: missing/);
  await sk.dispose();
});

test("ActiveUser.get fetches via ActiveUser query (no id variable)", async () => {
  const { sk, callsFor } = mockSpeckle({
    ActiveUser: () => ({ activeUser: sampleUser }),
  });
  const me = await sk.activeUser.get;
  expect(me.name).toBe("Alice");
  expect(callsFor("ActiveUser")[0]?.variables).toEqual({});
  await sk.dispose();
});

test("ActiveUser.get throws when activeUser is null (unauthenticated)", async () => {
  const { sk } = mockSpeckle({
    ActiveUser: () => ({ activeUser: null }),
  });
  await expect(sk.activeUser.get).rejects.toThrow(/ActiveUser not found/);
  await sk.dispose();
});
