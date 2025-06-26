// This script migrates data from Prisma's SQLite database to our new Drizzle schema
const fs = require('fs');
const path = require('path');
const { createClient } = require('@libsql/client');
const { drizzle } = require('drizzle-orm/libsql');
const { migrate } = require('drizzle-orm/libsql/migrator');
const { Database } = require('sqlite3');

async function main() {
  try {
    console.log('🚀 Starting Prisma to Drizzle migration...');
    
    // Source Prisma database path
    const prismaDbPath = path.join(process.cwd(), 'prisma', 'dev.db');
    
    // Check if Prisma DB exists
    if (!fs.existsSync(prismaDbPath)) {
      console.error('❌ Prisma database not found at:', prismaDbPath);
      process.exit(1);
    }
    
    // Target Drizzle database
    const targetDbPath = path.join(process.cwd(), 'dev.db');
    
    // Create a fresh database
    if (fs.existsSync(targetDbPath)) {
      fs.unlinkSync(targetDbPath);
      console.log('✅ Removed existing Drizzle database');
    }
    
    // Initialize Drizzle
    const client = createClient({
      url: `file:${targetDbPath}`,
    });
    
    const db = drizzle(client);
    
    // Run migrations first to create the schema
    console.log('📝 Running Drizzle migrations...');
    await migrate(db, { migrationsFolder: './lib/db/migrations' });
    console.log('✅ Migrations applied successfully');
    
    // Open the Prisma SQLite database
    const prismaDb = new Database(prismaDbPath);
    
    // Function to query the Prisma database
    const queryPrisma = (sql) => {
      return new Promise((resolve, reject) => {
        prismaDb.all(sql, [], (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });
    };

    // Function to execute a query on Drizzle
    const executeOnDrizzle = async (sql, params = []) => {
      return client.execute(sql, params);
    };
    
    // Migrate users
    console.log('👤 Migrating users...');
    const users = await queryPrisma('SELECT * FROM User');
    
    if (users.length > 0) {
      for (const user of users) {
        await executeOnDrizzle(
          'INSERT INTO users (id, name, email, email_verified, image, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [
            user.id,
            user.name,
            user.email,
            user.emailVerified, 
            user.image,
            user.createdAt || new Date().toISOString(),
            user.updatedAt || new Date().toISOString(),
          ]
        );
      }
      console.log(`✅ Migrated ${users.length} users`);
    } else {
      console.log('ℹ️ No users to migrate');
    }
    
    // Migrate accounts
    console.log('🔑 Migrating accounts...');
    const accounts = await queryPrisma('SELECT * FROM Account');
    
    if (accounts.length > 0) {
      for (const account of accounts) {
        await executeOnDrizzle(
          'INSERT INTO accounts (id, user_id, type, provider, provider_account_id, refresh_token, access_token, expires_at, token_type, scope, id_token, session_state) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [
            account.id,
            account.userId, 
            account.type, 
            account.provider,
            account.providerAccountId,
            account.refresh_token,
            account.access_token,
            account.expires_at,
            account.token_type,
            account.scope,
            account.id_token,
            account.session_state,
          ]
        );
      }
      console.log(`✅ Migrated ${accounts.length} accounts`);
    } else {
      console.log('ℹ️ No accounts to migrate');
    }
    
    // Migrate sessions
    console.log('🔐 Migrating sessions...');
    const sessions = await queryPrisma('SELECT * FROM Session');
    
    if (sessions.length > 0) {
      for (const session of sessions) {
        await executeOnDrizzle(
          'INSERT INTO sessions (id, session_token, user_id, expires) VALUES (?, ?, ?, ?)',
          [
            session.id,
            session.sessionToken,
            session.userId,
            session.expires,
          ]
        );
      }
      console.log(`✅ Migrated ${sessions.length} sessions`);
    } else {
      console.log('ℹ️ No sessions to migrate');
    }
    
    // Migrate verification tokens
    console.log('🔍 Migrating verification tokens...');
    const verificationTokens = await queryPrisma('SELECT * FROM VerificationToken');
    
    if (verificationTokens.length > 0) {
      for (const token of verificationTokens) {
        await executeOnDrizzle(
          'INSERT INTO verification_tokens (identifier, token, expires) VALUES (?, ?, ?)',
          [token.identifier, token.token, token.expires]
        );
      }
      console.log(`✅ Migrated ${verificationTokens.length} verification tokens`);
    } else {
      console.log('ℹ️ No verification tokens to migrate');
    }
    
    // Migrate wallets
    console.log('👛 Migrating wallets...');
    const wallets = await queryPrisma('SELECT * FROM Wallet');
    
    if (wallets.length > 0) {
      for (const wallet of wallets) {
        await executeOnDrizzle(
          'INSERT INTO wallets (id, user_id, public_key, provider, connected_at, last_signed_in, solana_balance, is_main_wallet, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [
            wallet.id,
            wallet.userId,
            wallet.publicKey,
            wallet.provider,
            wallet.connectedAt || new Date().toISOString(),
            wallet.lastSignedIn || new Date().toISOString(),
            wallet.solanaBalance,
            wallet.isMainWallet ? 1 : 0,
            wallet.createdAt || new Date().toISOString(),
            wallet.updatedAt || new Date().toISOString(),
          ]
        );
      }
      console.log(`✅ Migrated ${wallets.length} wallets`);
    } else {
      console.log('ℹ️ No wallets to migrate');
    }
    
    // Migrate tokens
    console.log('🪙 Migrating tokens...');
    const tokens = await queryPrisma('SELECT * FROM Token');
    
    if (tokens.length > 0) {
      for (const token of tokens) {
        await executeOnDrizzle(
          'INSERT INTO tokens (id, wallet_id, mint_address, token_name, symbol, balance, decimals, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [
            token.id,
            token.walletId,
            token.mintAddress,
            token.tokenName,
            token.symbol,
            token.balance,
            token.decimals,
            token.createdAt || new Date().toISOString(),
            token.updatedAt || new Date().toISOString(),
          ]
        );
      }
      console.log(`✅ Migrated ${tokens.length} tokens`);
    } else {
      console.log('ℹ️ No tokens to migrate');
    }
    
    // Close databases
    prismaDb.close();
    client.close();
    
    console.log('🎉 Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

main(); 