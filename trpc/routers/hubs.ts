import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "../init";
import { comments, db, hubs, teams, users, wagers, wallets } from "@/lib/db";
import { and, eq, name } from "drizzle-orm";
import { encryptData } from "@/utils/utils";
import { TRPCError } from "@trpc/server";

export const hubsRouter = createTRPCRouter({
  launchHubs: baseProcedure
    .input(
      z.object({
        name: z.string(),
        startTime: z.string(),
        home: z.string(),
        away: z.string(),
        homeScore: z.number(),
        awayScore: z.number(),
        isGameStarted: z.boolean()
      })
    )
    .mutation(async ({input}) => {
      const {name, isGameStarted, home, homeScore, awayScore, startTime, away} = input
      const existingHub = await db.select({id: hubs.id, isGameFinished: hubs.isGameFinished}).from(hubs).where(eq(hubs.name, name))
      if(!existingHub[0]) {
        const newHub = await db.insert(hubs).values({
          name,
          isGameStarted,
        }).returning({id: hubs.id, name: hubs.name}) 

        await db.insert(teams).values({
          away,
          home,
          startTime,
          homeScore,
          awayScore,
          hubId: newHub[0].id,
        })
      }
    }),

  getAParticularHub: baseProcedure
    .input(
      z.object({
        name: z.string()
      })
    )
    .query(async ({input}) => {
      const {name} = input
      const hub = await db.select({
        hub: hubs,
        team: teams,
        comment: comments,
        wager: wagers
      })
        .from(hubs)
        .where(and(eq(hubs.name, name), eq(hubs.isGameFinished, false)))
        .leftJoin(teams, eq(teams.hubId, hubs.id))
        .leftJoin(comments, eq(comments.hubId, hubs.id))
        .leftJoin(wagers, eq(wagers.hubId, hubs.id))

      if (!hub[0]) {
        // You can either throw an error or return a fallback value
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Hub not found',
        });
      }

      return hub[0];
    }),

});


