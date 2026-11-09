import { describe, expect, it } from "bun:test";
import { Elysia, t } from "elysia";
import { usersRoute } from "../src/routes/users-route";
import type { RegisterUserResult } from "../src/services/users-services";

describe("Users Registration Feature", () => {
  it("harus menolak request jika input tidak lengkap atau format salah", async () => {
    const app = new Elysia().use(usersRoute);

    const response = await app.handle(
      new Request("http://localhost/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "obi", email: "invalid-email" }),
      })
    );

    expect(response.status).toBeGreaterThanOrEqual(400);
  });

  it("harus berhasil melakukan hash password menggunakan bcrypt", async () => {
    const rawPassword = "obi2123";
    const hashedPassword = await Bun.password.hash(rawPassword, {
      algorithm: "bcrypt",
      cost: 10,
    });

    expect(hashedPassword).toBeDefined();
    expect(hashedPassword.startsWith("$2")).toBeTrue();
    expect(hashedPassword.length).toBe(60);

    const isMatch = await Bun.password.verify(rawPassword, hashedPassword);
    expect(isMatch).toBeTrue();
  });

  it("harus mengembalikan error jika service mendeteksi email duplikat", async () => {
    const mockService = {
      registerUser: async (): Promise<RegisterUserResult> => ({
        success: false,
        error: "email sudah terdaftar",
        code: "EMAIL_EXISTS",
      }),
    };

    const mockApp = new Elysia({ prefix: "/api/user" }).post(
      "/",
      {
        body: t.Object({
          name: t.String(),
          email: t.String(),
          password: t.String(),
        }),
      },
      async ({ body, set }: { body: { name: string; email: string; password: string }; set: { status?: number | string } }) => {
        const result = await mockService.registerUser();
        if (!result.success) {
          set.status = 400;
          return { error: result.error };
        }
        return { data: result.data };
      }
    );

    const response = await mockApp.handle(
      new Request("http://localhost/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "obi",
          email: "obi@gmail.com",
          password: "obi2123",
        }),
      })
    );

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json).toEqual({ error: "email sudah terdaftar" });
  });

  it("harus mengembalikan { data: 'ok' } jika registrasi sukses", async () => {
    const mockService = {
      registerUser: async (): Promise<RegisterUserResult> => ({
        success: true,
        data: "ok",
      }),
    };

    const mockApp = new Elysia({ prefix: "/api/user" }).post(
      "/",
      {
        body: t.Object({
          name: t.String(),
          email: t.String(),
          password: t.String(),
        }),
      },
      async ({ body, set }: { body: { name: string; email: string; password: string }; set: { status?: number | string } }) => {
        const result = await mockService.registerUser();
        if (!result.success) {
          set.status = 400;
          return { error: result.error };
        }
        set.status = 200;
        return { data: result.data };
      }
    );

    const response = await mockApp.handle(
      new Request("http://localhost/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "obi",
          email: "newuser@gmail.com",
          password: "obi2123",
        }),
      })
    );

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json).toEqual({ data: "ok" });
  });
});
