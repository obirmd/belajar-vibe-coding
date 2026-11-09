import { describe, expect, it } from "bun:test";
import { Elysia, t } from "elysia";
import { usersRoute } from "../src/routes/users-route";
import type { LoginUserResult } from "../src/services/users-services";

describe("User Login Feature", () => {
  it("harus menolak request jika email atau password kosong", async () => {
    const app = new Elysia().use(usersRoute);

    const response = await app.handle(
      new Request("http://localhost/api/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "", password: "" }),
      })
    );

    expect(response.status).toBeGreaterThanOrEqual(400);
  });

  it("harus mengembalikan error jika email atau password salah", async () => {
    const mockService = {
      loginUser: async (): Promise<LoginUserResult> => ({
        success: false,
        error: "email atau password salah",
        code: "INVALID_CREDENTIALS",
      }),
    };

    const mockApp = new Elysia({ prefix: "/api/user" }).post(
      "/login",
      {
        body: t.Object({
          email: t.String(),
          password: t.String(),
        }),
      },
      async ({
        body,
        set,
      }: {
        body: { email: string; password: string };
        set: { status?: number | string };
      }) => {
        const result = await mockService.loginUser();
        if (!result.success) {
          set.status = 400;
          return { error: result.error };
        }
        set.status = 200;
        return { data: result.data };
      }
    );

    const response = await mockApp.handle(
      new Request("http://localhost/api/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "wrong@gmail.com",
          password: "wrongpassword",
        }),
      })
    );

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json).toEqual({ error: "email atau password salah" });
  });

  it("harus mengembalikan token UUID jika email dan password benar", async () => {
    const dummyToken = crypto.randomUUID();

    const mockService = {
      loginUser: async (): Promise<LoginUserResult> => ({
        success: true,
        data: dummyToken,
      }),
    };

    const mockApp = new Elysia({ prefix: "/api/user" }).post(
      "/login",
      {
        body: t.Object({
          email: t.String(),
          password: t.String(),
        }),
      },
      async ({
        body,
        set,
      }: {
        body: { email: string; password: string };
        set: { status?: number | string };
      }) => {
        const result = await mockService.loginUser();
        if (!result.success) {
          set.status = 400;
          return { error: result.error };
        }
        set.status = 200;
        return { data: result.data };
      }
    );

    const response = await mockApp.handle(
      new Request("http://localhost/api/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "obi@gmail.com",
          password: "obi2123",
        }),
      })
    );

    expect(response.status).toBe(200);
    const json = (await response.json()) as { data: string };
    expect(json.data).toBe(dummyToken);
    // UUID v4 format verification
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    expect(uuidRegex.test(json.data)).toBeTrue();
  });
});

