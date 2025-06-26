const {Pool} = require('pg')
const { drizzle } = require('drizzle-orm/node-postgres');
const { migrate } = require('drizzle-orm/node-postgres/migrator');

async function main() {
  console.log('Migration started...');

  const pool = new Pool({
    connectionString: process.env.POSTGRES_DATABASE_URL,
  });

  const db = drizzle(pool);

  // This will run the migrations in the migrations folder
  await migrate(db, { migrationsFolder: './lib/db/migrations' });

  console.log('Migration completed successfully');
  process.exit(0);
}

main().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
}); 
