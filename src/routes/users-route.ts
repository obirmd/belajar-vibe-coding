import { Elysia, t } from "elysia";
import { usersService } from "../services/users-services";
import { authMiddleware } from "../middlewares/auth-middleware";

export const usersRoute = new Elysia({ prefix: "/api/user" })
  .use(authMiddleware)
  .post(
    "/",
    {
      body: t.Object({
        name: t.String({ minLength: 1, error: "name wajib diisi" }),
        email: t.String({ format: "email", error: "format email tidak valid" }),
        password: t.String({ minLength: 1, error: "password wajib diisi" }),
      }),
    },
    async ({
      body,
      set,
    }: {
      body: { name: string; email: string; password: string };
      set: { status?: number | string };
    }) => {
      const result = await usersService.registerUser(body);

      if (!result.success) {
        if (result.code === "EMAIL_EXISTS") {
          set.status = 400;
          return { error: result.error };
        }
        set.status = 500;
        return { error: result.error };
      }

      set.status = 200;
      return { data: result.data };
    }
  )
  .post(
    "/login",
    {
      body: t.Object({
        email: t.String({ minLength: 1, error: "email wajib diisi" }),
        password: t.String({ minLength: 1, error: "password wajib diisi" }),
      }),
    },
    async ({
      body,
      set,
    }: {
      body: { email: string; password: string };
      set: { status?: number | string };
    }) => {
      const result = await usersService.loginUser(body);

      if (!result.success) {
        if (result.code === "INVALID_CREDENTIALS") {
          set.status = 400;
          return { error: result.error };
        }
        set.status = 500;
        return { error: result.error };
      }

      set.status = 200;
      return { data: result.data };
    }
  )
  .get("/me", async ({ user, set }) => {
    if (!user) {
      set.status = 401;
      return { error: "unauthorized" };
    }

    set.status = 200;
    return { data: user };
  })
  .delete("/logout", async ({ user, token, set }) => {
    if (!user || !token) {
      set.status = 401;
      return { error: "unauthorized" };
    }

    await usersService.logoutUser(token);

    set.status = 200;
    return { data: "logout sukses" };
  });
