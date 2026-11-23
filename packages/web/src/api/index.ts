import type { RouterClient } from "@orpc/server";
import { createApp } from "./__core/app";
import { ping } from "./routes/ping";
import { streets, buildings, families, members, agents } from "./routes/registry";
import { settings, stats, admin } from "./routes/admin";

export const router = {
  ping,
  streets,
  buildings,
  families,
  members,
  agents,
  settings,
  stats,
  admin,
};

export type AppRouter = typeof router;
/** Typed client for the router — used by the web and mobile api clients. */
export type AppRouterClient = RouterClient<AppRouter>;

const app = createApp(router);

export default app;
