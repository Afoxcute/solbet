# Migrating from Prisma to Drizzle

This project has been migrated from Prisma ORM to Drizzle ORM for database operations. This document explains the changes made and how to use the new setup.

## Why Drizzle?

Drizzle offers several advantages over Prisma:

- Fully type-safe SQL query builder
- Better performance with less overhead
- No code generation step required
- Simpler setup and configuration
- Direct SQL access when needed
- Smaller bundle size

## Schema Changes

The database schema has been migrated from Prisma's schema format to Drizzle's TypeScript-based schema. Key changes:

- Schema definitions moved from `prisma/schema.prisma` to `lib/db/schema.ts`
- Database client initialization moved from `utils/prisma.ts` to `lib/db/index.ts`
- Compatible APIs maintained for backward compatibility

## Migration Steps

The migration involved the following steps:

1. Created Drizzle schema based on existing Prisma schema
2. Set up Drizzle client configuration
3. Created migration files for the schema
4. Updated all files that used Prisma client to use Drizzle
5. Created a data migration script to transfer data

## Using the New Setup

### Database Operations

```typescript
// Import the db client
import { db } from '@/lib/db';
import { users, wallets } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// Query data
const allUsers = await db.select().from(users);
const user = await db.select().from(users).where(eq(users.id, userId));

// Insert data
await db.insert(users).values({
  id: crypto.randomUUID(),
  name: 'John Doe',
  email: 'john@example.com'
});

// Update data
await db.update(users)
  .set({ name: 'Jane Doe' })
  .where(eq(users.id, userId));

// Delete data
await db.delete(users).where(eq(users.id, userId));
```

### Running Migrations

```bash
# Generate migration files
pnpm db:generate

# Apply migrations
pnpm db:migrate

# Push schema changes directly to the database (development)
pnpm db:push
```

### Migrating Data from Prisma

If you need to migrate existing data from a Prisma database:

```bash
pnpm db:migrate-from-prisma
```

## Files Changed

- Added: `lib/db/schema.ts` - Drizzle schema definitions
- Added: `lib/db/index.ts` - Drizzle client setup
- Added: `lib/db/migrate.ts` - Migration script
- Added: `drizzle.config.ts` - Drizzle configuration
- Modified: `utils/prisma.ts` - Now re-exports Drizzle client
- Modified: Various app files to use Drizzle instead of Prisma

## Further Resources

- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
- [SQLite with Drizzle](https://orm.drizzle.team/docs/quick-sqlite/index) 