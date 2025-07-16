import { createTRPCRouter } from "./create-context";

export const appRouter = createTRPCRouter({
  // Add your routes here
});

export type AppRouter = typeof appRouter;