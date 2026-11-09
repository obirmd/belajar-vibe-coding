import { Elysia, t } from "elysia";
import { db } from "../db";
import { users } from "../db/schema";

export const userRoutes = new Elysia({ prefix: "/users" })
  .get("/", async () => {
    try {
      return await db.select().from(users);
    } catch (error) {
      return {
        message: "Database query error",
        error: error instanceof Error ? error.message : String(error),
      };
    }
  })
  .post(
    "/",
    async ({ body, set }: { body: { name: string; email: string }; set: { status?: number | string } }) => {
      try {
        await db.insert(users).values(body);
        set.status = 201;
        return { message: "User created successfully" };
      } catch (error) {
        set.status = 500;
        return {
          message: "Failed to create user",
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
    {
      body: t.Object({
        name: t.String(),
        email: t.String(),
      }),
    }
  );
