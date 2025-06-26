// Re-export the db client from our Drizzle implementation
import { db } from '../lib/db';

// Export db as default and named export for backward compatibility
export default db;
export { db as prisma }; 