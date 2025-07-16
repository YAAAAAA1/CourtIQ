import { createTRPCRouter } from "./routes/create-context";

export const appRouter = createTRPCRouter({
  // Add your routes here
});

export type AppRouter = typeof appRouter; 