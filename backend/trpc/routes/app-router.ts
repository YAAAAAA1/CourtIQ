import { createTRPCRouter } from "./create-context.js";

export const appRouter = createTRPCRouter({
  // Add your routes here
});

export type AppRouter = typeof appRouter;