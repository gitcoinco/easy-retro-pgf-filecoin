import { z } from "zod";
import type { PrismaClient } from "@prisma/client";
import {
  createTRPCRouter,
  adminProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { FilterSchema } from "~/features/filter/types";
import { fetchAttestations } from "~/utils/fetchAttestations";
import { config, eas } from "~/config";
import { calculateVotes } from "~/utils/calculateResults";
import { type Vote } from "~/features/ballot/types";
import { getSettings } from "./config";
import { getAppState } from "~/utils/state";
import { TRPCError } from "@trpc/server";

export const resultsRouter = createTRPCRouter({
  votes: adminProcedure.query(async ({ ctx }) =>
    calculateBallotResults(ctx.db),
  ),
  results: publicProcedure.query(async ({ ctx }) => {
    if (getAppState() !== "RESULTS") {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Results not available yet",
      });
    }
    return calculateBallotResults(ctx.db);
  }),
  project: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      if (getAppState() !== "RESULTS") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Results not available yet",
        });
      }
      const { projects } = await calculateBallotResults(ctx.db);

      return {
        amount: projects?.[input.id]?.votes ?? 0,
      };
    }),

  projects: publicProcedure
    .input(FilterSchema)
    .query(async ({ input, ctx }) => {
      if (getAppState() !== "RESULTS") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Results not available yet",
        });
      }
      const { projects } = await calculateBallotResults(ctx.db);

      const sortedIDs = Object.entries(projects ?? {})
        .sort((a, b) => b[1].votes - a[1].votes)
        .map(([id]) => id)
        .slice(
          input.cursor * input.limit,
          input.cursor * input.limit + input.limit,
        );

      return fetchAttestations([eas.schemas.metadata], {
        where: {
          id: { in: sortedIDs },
        },
      }).then((attestations) =>
        // Results aren't returned from EAS in the same order as the `where: { in: sortedIDs }`
        // Sort the attestations based on the sorted array
        attestations.sort(
          (a, b) => sortedIDs.indexOf(a.id) - sortedIDs.indexOf(b.id),
        ),
      );
    }),
});

const defaultCalculation = config.distributionCalculation;
async function calculateBallotResults(db: PrismaClient) {
  const settings = await getSettings(db);
  const calculation = settings?.config?.calculation ?? defaultCalculation;

  // Fetch the ballots
  let ballots = await db.ballot.findMany({
    where: { publishedAt: { not: null } },
    select: { voterId: true, votes: true },
  });

  const roundId = config.roundId.split("ez-rpgf-filecoin-")[1];
  if (roundId !== "1") {
    ballots = ballots.filter((b) => b.voterId.includes(`${roundId}-`));
  }

  const projects = calculateVotes(
    ballots as unknown as { voterId: string; votes: Vote[] }[],
    calculation,
  );

  const averageVotes = 0;
  const totalVotes = Math.floor(
    Object.values(projects).reduce((sum, x) => sum + x.votes, 0),
  );
  const totalVoters = ballots.length;

  return { projects, totalVoters, totalVotes, averageVotes };
}
