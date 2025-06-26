import CreateNewCommentHubPage from '@/components/comment-hub/CreateNewCommentHubPage'
import React, { Suspense } from 'react'
import { trpc } from '@/trpc/server';

// Mark the page as dynamically rendered
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function CreateCommentHub() {
  try {
    const [fixturedGames, liveGames] = await Promise.all([
      trpc.games.getAllFixtures().catch(() => []),
      trpc.games.liveMatches().catch(() => [])
    ]);

    const allGames = [...(liveGames || []), ...(fixturedGames || [])];

    return (
      <main className='pt-[60px]'>
        <Suspense fallback={<div>Loading...</div>}>
          <CreateNewCommentHubPage allGames={allGames} />
        </Suspense>
      </main>
    );
  } catch (error) {
    console.error('Error fetching games:', error);
    // Return a fallback UI when data fetching fails
    return (
      <main className='pt-[60px]'>
        <div className="text-center p-4">
          <h2 className="text-xl font-semibold mb-2">Unable to load games</h2>
          <p>Please try again later</p>
        </div>
      </main>
    );
  }
}

export default CreateCommentHub
