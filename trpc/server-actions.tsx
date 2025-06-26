import 'server-only';
import { createCallerFactory, createTRPCContext } from './init';
import { appRouter } from './routers/_app';

// Create a server-side TRPC caller for use in server components and server actions
// This should never be imported from client components
export const serverCaller = createCallerFactory(appRouter)(createTRPCContext); 