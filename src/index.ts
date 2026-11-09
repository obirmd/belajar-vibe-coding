import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { healthRoutes } from "./routes/health";
import { usersRoute } from "./routes/users-route";

const port = Number(process.env.PORT) || 3000;

const app = new Elysia()
  .use(cors())
  .get("/", () => ({
    name: "Belajar Vibe Coding API",
    version: "1.0.0",
    health: "/health",
    register: "POST /api/user",
    login: "POST /api/user/login",
    me: "GET /api/user/me",
    logout: "DELETE /api/user/logout",
  }))
  .use(healthRoutes)
  .use(usersRoute)
  .listen(port);

console.log(`🦊 Elysia server is running at http://${app.server?.hostname}:${app.server?.port}`);

export type App = typeof app;
