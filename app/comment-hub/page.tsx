import CommentHubPage from '@/components/comment-hub/CommentHubPage'
import Nav from '@/components/Nav';
import { trpc } from '@/trpc/server';
import React from 'react'

export default async function CommentHub() {
  const fixturedGames = await trpc.games.getAllFixtures()
  const liveGames = await trpc.games.liveMatches()

  return (
    <main className='pt-[60px] mb-[500px]'>
      <Nav />
      <CommentHubPage liveGames={liveGames} fixturedGames={fixturedGames} />
    </main>
  );
}

