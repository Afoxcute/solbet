import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "../init";
import { db, tokens, users, wallets } from "@/lib/db";
import { eq } from "drizzle-orm";
import { airdropSol, getTokenAccounts } from "@/utils/solanaHelpers";
import { PublicKey } from "@solana/web3.js";
import { TRPCError } from "@trpc/server";
import toast from "react-hot-toast";

export const walletsRouter = createTRPCRouter({
  createANewWallet: baseProcedure
    .input(
      z.object({
        address: z.string(),
        publicKey: z.string(),
        balance: z.number(),
        email: z.string()
      })
    )
    .mutation(async ({input}) => {
      const {address, email, balance, publicKey} = input
      const existingUser = await db
        .select({
          id: users.id,
          walletId: wallets.id, // can be null if no wallet
        })
        .from(users)
        .leftJoin(wallets, eq(users.id, wallets.userId))
        .where(eq(users.email, email));
      
      if(existingUser) {
        const hasWallet = !!existingUser[0].walletId
        if(hasWallet) {
          return;
        } else {
          const newWallet = await db.insert(wallets).values({
            publicKey: address,
            userId: existingUser[0].id,
            isMainWallet: false,
            provider: publicKey,
            solanaBalance: balance,
          }).returning({id: wallets.id, publicKey: wallets.publicKey, provider: wallets.provider, balance: wallets.solanaBalance})

          const tokenAccounts = await getTokenAccounts(new PublicKey(publicKey))

          for (const token of tokenAccounts) {
            await db.insert(tokens).values({
              walletId: newWallet[0].id,
              balance,
              tokenName: "90plus",
              mintAddress: publicKey,
              decimals: token.decimals,
            })
          }

          return newWallet;
        }
      } else {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'No user like this'
        })
      }
  })
})

