import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "../init";
import { db, wagers } from "@/lib/db";

export const wagersRouter = createTRPCRouter({
  placeWager: baseProcedure
    .input(
      z.object({
        amount: z.number(),
        condition: z.string(),
        against: z.number().nullish(),
        for: z.number(),
        hubId: z.number(),
      })
    )
    .mutation(async ({input}) => {
      const {hubId, for: forBettor, against, condition, amount} = input
      await db.insert(wagers).values({
        amount,
        condition,
        against,
        for: forBettor,
        hubId,
        isOpen: true
    })
  }),
})

