import CreateNewCommentHubPage from '@/components/comment-hub/CreateNewCommentHubPage'
import React, { Suspense } from 'react'
import { trpc } from '@/trpc/server';

async function CreateCommentHub() {
  const [fixturedGames, liveGames] = await Promise.all([
    trpc.games.getAllFixtures(),
    trpc.games.liveMatches()
  ])
  const allGames = [...liveGames, ...fixturedGames]
  return (
    <main className='pt-[60px]'>
      <Suspense>
        <CreateNewCommentHubPage allGames={allGames}/>
      </Suspense>
    </main>
  )
}

export default CreateCommentHub
