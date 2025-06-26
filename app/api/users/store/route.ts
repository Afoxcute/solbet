import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, wallets } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { Connection, PublicKey } from '@solana/web3.js';

export async function POST(req: NextRequest) {
  try {
    // Get data from request
    const userData = await req.json();
    
    // Get current session if available
    const session = await getServerSession();
    let userId = null;

    // Check if there's an existing user with this email
    let user = null;
    if (userData.email) {
      const [existingUser] = await db.select()
        .from(users)
        .where(eq(users.email, userData.email));
      user = existingUser;
    }

    // If no user found, check by wallet public key
    if (!user && userData.publicKey) {
      const [wallet] = await db.select({
          wallet: wallets,
          user: users
        })
        .from(wallets)
        .innerJoin(users, eq(users.id, wallets.userId))
        .where(eq(wallets.publicKey, userData.publicKey));
        
      if (wallet) {
        user = wallet.user;
      }
    }

    // If user exists, update them
    if (user) {
      // Update user information
      await db.update(users)
        .set({
          name: userData.name || user.name,
          image: userData.profileImage || user.image,
        })
        .where(eq(users.id, user.id));
        
      userId = user.id;
    } else {
      // Create new user
      const newUser = {
        id: crypto.randomUUID(),
        name: userData.name || `User ${userData.verifierId?.slice(0, 6) || 'New'}`,
        email: userData.email,
        image: userData.profileImage,
      };
      
      await db.insert(users)
        .values(newUser);
        
      userId = newUser.id;
    }
    
    // If we have a public key, create or update the wallet
    let walletId = null;
    if (userData.publicKey) {
      const [existingWallet] = await db.select()
        .from(wallets)
        .where(eq(wallets.publicKey, userData.publicKey));
      
      if (existingWallet) {
        // Update existing wallet
        await db.update(wallets)
          .set({ 
            lastSignedIn: new Date().toISOString(),
            userId: userId, // Link wallet to the current user
          })
          .where(eq(wallets.id, existingWallet.id));
          
        walletId = existingWallet.id;
      } else {
        // Create new wallet
        const newWallet = {
          id: crypto.randomUUID(),
          publicKey: userData.publicKey,
          provider: 'web3auth',
          userId: userId,
          isMainWallet: true,
          connectedAt: new Date().toISOString(),
          lastSignedIn: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        await db.insert(wallets)
          .values(newWallet);
          
        walletId = newWallet.id;
      }
      
      // Update wallet balance
      await updateWalletBalance(userData.publicKey, walletId);
    }
    
    // Return success response
    return NextResponse.json({ 
      success: true, 
      message: "User data stored successfully" 
    }, { status: 200 });
  } catch (error) {
    console.error("Error storing user data:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to store user data"
    }, { status: 500 });
  }
}

// Function to update the wallet balance
async function updateWalletBalance(publicKey: string, walletId: string) {
  try {
    // Connect to Solana network
    const connection = new Connection(
      process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.testnet.solana.com',
      'confirmed'
    );
    
    // Get wallet SOL balance
    const walletPublicKey = new PublicKey(publicKey);
    const balance = await connection.getBalance(walletPublicKey);
    const solBalance = balance / 1e9; // Convert lamports to SOL
    
    // Update wallet in database
    await db.update(wallets)
      .set({ solanaBalance: solBalance })
      .where(eq(wallets.id, walletId));
    
    return { success: true, balance: solBalance };
  } catch (error) {
    console.error('Error updating wallet balance:', error);
    return { success: false, error };
  }
} 
