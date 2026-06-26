import { createRouter, publicQuery } from "./middleware";
import { stockRouter } from "./routers/stock";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  stock: stockRouter,
});

export type AppRouter = typeof appRouter;
