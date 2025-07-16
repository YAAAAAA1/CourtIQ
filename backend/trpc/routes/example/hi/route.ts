import { z } from "zod";

// Simple route without tRPC for now
export default {
  input: z.object({ name: z.string() }),
  handler: ({ input }: { input: { name: string } }) => {
    return {
      hello: input.name,
      date: new Date(),
    };
  }
};