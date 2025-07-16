import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { cors } from "hono/cors";

// app will be mounted at /api
const app = new Hono();

// Enable CORS for all routes
app.use("*", cors());

// Simple health check endpoint
app.get("/", (c) => {
  return c.json({ status: "ok", message: "API is running" });
});

// TODO: Re-enable tRPC when backend is properly configured
// Mount tRPC router at /trpc
// app.use(
//   "/trpc/*",
//   trpcServer({
//     endpoint: "/api/trpc",
//     router: appRouter,
//     createContext,
//   })
// );

export default app;