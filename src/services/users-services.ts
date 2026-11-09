import { eq } from "drizzle-orm";
import { db } from "../db";
import { sessions, users } from "../db/schema";

export interface RegisterUserInput {
  name: string;
  email: string;
  password: string;
}

export type RegisterUserResult =
  | { success: true; data: "ok" }
  | { success: false; error: string; code: "EMAIL_EXISTS" | "INTERNAL_ERROR" };

export interface LoginUserInput {
  email: string;
  password: string;
}

export type LoginUserResult =
  | { success: true; data: string }
  | { success: false; error: string; code: "INVALID_CREDENTIALS" | "INTERNAL_ERROR" };

export class UsersService {
  async registerUser(input: RegisterUserInput): Promise<RegisterUserResult> {
    try {
      const existingUser = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);

      if (existingUser.length > 0) {
        return {
          success: false,
          error: "email sudah terdaftar",
          code: "EMAIL_EXISTS",
        };
      }

      const hashedPassword = await Bun.password.hash(input.password, {
        algorithm: "bcrypt",
        cost: 10,
      });

      await db.insert(users).values({
        name: input.name,
        email: input.email,
        password: hashedPassword,
      });

      return {
        success: true,
        data: "ok",
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Terjadi kesalahan pada server",
        code: "INTERNAL_ERROR",
      };
    }
  }

  async loginUser(input: LoginUserInput): Promise<LoginUserResult> {
    try {
      const userList = await db
        .select({
          id: users.id,
          password: users.password,
        })
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);

      const user = userList[0];
      if (!user) {
        return {
          success: false,
          error: "email atau password salah",
          code: "INVALID_CREDENTIALS",
        };
      }

      const isPasswordValid = await Bun.password.verify(input.password, user.password);
      if (!isPasswordValid) {
        return {
          success: false,
          error: "email atau password salah",
          code: "INVALID_CREDENTIALS",
        };
      }

      const token = crypto.randomUUID();

      await db.insert(sessions).values({
        token,
        userId: user.id,
      });

      return {
        success: true,
        data: token,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Terjadi kesalahan pada server",
        code: "INTERNAL_ERROR",
      };
    }
  }
}

export const usersService = new UsersService();
