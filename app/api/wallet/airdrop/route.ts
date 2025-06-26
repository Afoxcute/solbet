import { NextRequest, NextResponse } from 'next/server';
import { airdropSol } from '@/utils/solanaHelpers';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';
import { wallets, users } from '@/lib/db/schema';
import { eq, or, and, inArray, exists } from 'drizzle-orm';

/**
 * Handles airdrop request
 * This endpoint allows requesting an airdrop on devnet for testing
 */
export async function POST(req: NextRequest) {
  try {
    // Get the wallet address from request
    const { walletAddress, amount } = await req.json();

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    // Get the current user session
    const session = await getServerSession();

    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Find the user first
    const usersWithEmail = session.user.email
      ? await db.select().from(users).where(eq(users.email, session.user.email))
      : [];

    // Find users with twitter account matching session
    const usersWithTwitter = session.user.twitterId
      ? await db.select({ id: users.id })
        .from(users)
      // .innerJoin(accounts, eq(accounts.userId, users.id))
      // .where(eq(accounts.providerAccountId, session.user.twitterId))
      : [];

    const userIds = [
      ...usersWithEmail.map(u => u.id),
      ...usersWithTwitter.map(u => u.id)
    ];

    if (userIds.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 403 }
      );
    }

    // Verify that the wallet belongs to the user
    const userWallets = await db.select()
      .from(wallets)
      .where(
        and(
          eq(wallets.publicKey, walletAddress),
          inArray(wallets.userId, userIds)
        )
      );

    if (userWallets.length === 0) {
      return NextResponse.json(
        { error: 'This wallet does not belong to the authenticated user' },
        { status: 403 }
      );
    }

    // Request the airdrop
    const signature = await airdropSol(walletAddress, amount || 1);

    return NextResponse.json({
      success: true,
      signature,
      message: `Airdrop of ${amount || 1} SOL to ${walletAddress} successful!`
    });
  } catch (error) {
    console.error('Airdrop error:', error);

    return NextResponse.json(
      {
        error: 'Failed to process airdrop',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 
