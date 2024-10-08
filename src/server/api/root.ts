import { ballotRouter } from "~/server/api/routers/ballot";
import { configRouter } from "~/server/api/routers/config";
import { resultsRouter } from "~/server/api/routers/results";
import { commentsRouter } from "~/server/api/routers/comments";
import { projectsRouter } from "~/server/api/routers/projects";
import { metadataRouter } from "~/server/api/routers/metadata";
import { applicationsRouter } from "~/server/api/routers/applications";
import { metricsRouter } from "~/server/api/routers/metrics";
import { profileRouter } from "~/server/api/routers/profile";
import { votersRouter } from "~/server/api/routers/voters";
import { createTRPCRouter } from "~/server/api/trpc";
import { encryptionRouter } from "./routers/encryption";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  config: configRouter,
  comments: commentsRouter,
  results: resultsRouter,
  ballot: ballotRouter,
  voters: votersRouter,
  applications: applicationsRouter,
  profile: profileRouter,
  metadata: metadataRouter,
  projects: projectsRouter,
  encryption: encryptionRouter,
  metrics: metricsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
