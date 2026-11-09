import { Elysia } from "elysia";
import { usersService, type UserProfile } from "../services/users-services";

export const authMiddleware = new Elysia({ name: "auth-middleware" }).derive(
  "plugin",
  async ({ headers }) => {
    const authHeader = headers["authorization"] || headers["Authorization"];

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return {
        user: null as UserProfile | null,
        token: null as string | null,
      };
    }

    const token = authHeader.slice(7).trim();
    if (!token) {
      return {
        user: null as UserProfile | null,
        token: null as string | null,
      };
    }

    const result = await usersService.getUserByToken(token);
    if (!result.success) {
      return {
        user: null as UserProfile | null,
        token: null as string | null,
      };
    }

    return {
      user: result.user,
      token,
    };
  }
);
