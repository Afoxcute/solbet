import { drizzle } from 'drizzle-orm/node-postgres';

let db: ReturnType<typeof createDrizzleClient>;

function createDrizzleClient() {
  // const client = createClient({
  //   url: process.env.POSTGRES_DATABASE_URL as string,
  // });
  
  return drizzle(process.env.POSTGRES_DATABASE_URL as string);
}

// For Node.js environments, avoid creating multiple connections
// during development when hot reloading
if (process.env.NODE_ENV === 'production') {
  db = createDrizzleClient();
} else {
  // In development, create a single client instance and reuse it
  const globalWithDb = global as unknown as { db: ReturnType<typeof createDrizzleClient> };
  if (!globalWithDb.db) {
    globalWithDb.db = createDrizzleClient();
  }
  db = globalWithDb.db;
}

export { db };
export * from './schema'; 
