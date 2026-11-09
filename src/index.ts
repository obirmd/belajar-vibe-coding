import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { healthRoutes } from "./routes/health";
import { userRoutes } from "./routes/users";

const port = Number(process.env.PORT) || 3000;

const app = new Elysia()
  .use(cors())
  .get("/", () => ({
    name: "Belajar Vibe Coding API",
    version: "1.0.0",
    health: "/health",
    users: "/users",
  }))
  .use(healthRoutes)
  .use(userRoutes)
  .listen(port);

console.log(`🦊 Elysia server is running at http://${app.server?.hostname}:${app.server?.port}`);

export type App = typeof app;

