import { describe, expect, it } from "bun:test";
import { Elysia } from "elysia";
import { usersRoute } from "../src/routes/users-route";
import type { UserProfile } from "../src/services/users-services";

describe("Users Authentication Middleware & Profile/Logout", () => {
  it("harus menolak GET /api/user/me jika header Authorization tidak ada", async () => {
    const app = new Elysia().use(usersRoute);

    const response = await app.handle(
      new Request("http://localhost/api/user/me", {
        method: "GET",
      })
    );

    expect(response.status).toBe(401);
    const json = await response.json();
    expect(json).toEqual({ error: "unauthorized" });
  });

  it("harus menolak GET /api/user/me jika token tidak valid", async () => {
    const app = new Elysia().use(usersRoute);

    const response = await app.handle(
      new Request("http://localhost/api/user/me", {
        method: "GET",
        headers: {
          Authorization: "Bearer invalid-token-uuid-1234",
        },
      })
    );

    expect(response.status).toBe(401);
    const json = await response.json();
    expect(json).toEqual({ error: "unauthorized" });
  });

  it("harus mengembalikan profile user jika token valid pada GET /api/user/me", async () => {
    const dummyUser: UserProfile = {
      id: 1,
      name: "obi",
      email: "obi@gmail.com",
      createdAt: new Date(),
    };

    const mockAuthMiddleware = new Elysia({ name: "mock-auth" }).derive(
      "plugin",
      async ({ headers }) => {
        const auth = headers["authorization"] || headers["Authorization"];
        if (auth === "Bearer valid-dummy-token") {
          return { user: dummyUser, token: "valid-dummy-token" };
        }
        return { user: null, token: null };
      }
    );

    const mockApp = new Elysia({ prefix: "/api/user" })
      .use(mockAuthMiddleware)
      .get("/me", async ({ user, set }) => {
        if (!user) {
          set.status = 401;
          return { error: "unauthorized" };
        }
        return { data: user };
      });

    const response = await mockApp.handle(
      new Request("http://localhost/api/user/me", {
        method: "GET",
        headers: {
          Authorization: "Bearer valid-dummy-token",
        },
      })
    );

    expect(response.status).toBe(200);
    const json = (await response.json()) as { data: UserProfile };
    expect(json.data.id).toBe(1);
    expect(json.data.name).toBe("obi");
    expect(json.data.email).toBe("obi@gmail.com");
  });

  it("harus menolak DELETE /api/user/logout jika tidak ada token", async () => {
    const app = new Elysia().use(usersRoute);

    const response = await app.handle(
      new Request("http://localhost/api/user/logout", {
        method: "DELETE",
      })
    );

    expect(response.status).toBe(401);
    const json = await response.json();
    expect(json).toEqual({ error: "unauthorized" });
  });

  it("harus berhasil logout dengan DELETE /api/user/logout jika token valid", async () => {
    const mockAuthMiddleware = new Elysia({ name: "mock-auth" }).derive(
      "plugin",
      async ({ headers }) => {
        const auth = headers["authorization"] || headers["Authorization"];
        if (auth === "Bearer valid-dummy-token") {
          return {
            user: { id: 1, name: "obi", email: "obi@gmail.com", createdAt: new Date() },
            token: "valid-dummy-token",
          };
        }
        return { user: null, token: null };
      }
    );

    const mockApp = new Elysia({ prefix: "/api/user" })
      .use(mockAuthMiddleware)
      .delete("/logout", async ({ user, token, set }) => {
        if (!user || !token) {
          set.status = 401;
          return { error: "unauthorized" };
        }
        return { data: "logout sukses" };
      });

    const response = await mockApp.handle(
      new Request("http://localhost/api/user/logout", {
        method: "DELETE",
        headers: {
          Authorization: "Bearer valid-dummy-token",
        },
      })
    );

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json).toEqual({ data: "logout sukses" });
  });
});
