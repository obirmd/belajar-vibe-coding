import { eq } from "drizzle-orm";
import { db } from "../db";
import { users } from "../db/schema";

export interface RegisterUserInput {
  name: string;
  email: string;
  password: string;
}

export type RegisterUserResult =
  | { success: true; data: "ok" }
  | { success: false; error: string; code: "EMAIL_EXISTS" | "INTERNAL_ERROR" };

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
}

export const usersService = new UsersService();
