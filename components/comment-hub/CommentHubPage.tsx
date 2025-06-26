"use client"
import React, { FC, Suspense } from 'react'
import Tabs from './ui/tabs'
import { useTabsStore } from '@/stores/use-tabs-store'
import SearchComponent from './ui/search-component'
import Carousel from '../carousel/carousel'
import { PlusIcon } from 'lucide-react'
import LoadingIcon from '@/public/icons/LoadingIcon'
import Link from 'next/link'
import LiveCarousel from '../carousel/live-carousel'

type CommentHubPageProps = {
  fixturedGames: any[]
  liveGames: any[]
}

const tabs = [
  "All",
  "PL",
  "UCL",
  "La Liga"
]

const CommentHubPage: FC<CommentHubPageProps> = ({fixturedGames, liveGames}) => {
  const { selected, setSelected } = useTabsStore()
  const [isLoading, setIsLoading] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [filteredGames, setFilteredGames] = React.useState(liveGames ? liveGames : [])
  const [filteredUpcomingGames, setFilteredUpcomingGames] = React.useState(fixturedGames ? fixturedGames : [])

  // console.log({ liveGames, fixturedGames })

  React.useEffect(() => {
    setIsLoading(true);

    const timeoutId = setTimeout(() => {
      const safeQuery = query.trim().toLowerCase();
      if (safeQuery !== "" && liveGames && fixturedGames) {
        const gamesFiltered = liveGames.filter((g: any) =>
          g.away.name.toLowerCase().includes(query.toLowerCase()) ||
          g.home.name.toLowerCase().includes(query.toLowerCase())
        );

        const upcomingGamesFilter = fixturedGames.filter((g: UpcomingMatch) =>
          g.away.name.toLowerCase().includes(query.toLowerCase()) ||
          g.home.name.toLowerCase().includes(query.toLowerCase())
        );

        setFilteredGames(gamesFiltered);
        setFilteredUpcomingGames(upcomingGamesFilter);
      } else if(liveGames && fixturedGames) {
        setFilteredGames(liveGames);
        setFilteredUpcomingGames(fixturedGames);
      }

      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [query, liveGames, fixturedGames]);


  return (
    <main className="bg-[ECF5F5] min-h-screen">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center py-3 gap-10 font-bold">
          <h2 className="text-gray-500">In-Play Wagers</h2>
          <h2 className="">Live Hubs</h2>
        </div>

        <SearchComponent setQuery={setQuery} />

        <div className="mt-2 flex justify-center">
          <Suspense>
            <Tabs tabs={tabs} onSelected={setSelected} selected={selected} />
          </Suspense>
        </div>

        <div className="mt-5">
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-base">Live Hubs</h3>
            <div className="flex items-center text-xs text-gray-500 ">
            </div>
          </div>

          <div className="bg-[ECF5F5] rounded-xl p-3 ">
            {(isLoading) ? (
              <div className="flex justify-center py-4">
                <LoadingIcon />
              </div>
            ) : (
              <LiveCarousel tabs={filteredGames} />
            )}
          </div>
          
        </div>
        <div className="mt-5">
          <h3 className="text-base mb-1">Upcoming Hubs</h3>
          <div className="bg-[ECF5F5] rounded-xl p-3">
            {(isLoading) ? (
              <div className="flex justify-center py-4">
                <LoadingIcon />
              </div>
            ) : (
              <Carousel tabs={filteredUpcomingGames?.slice(0, 9)}  />
            )}
          </div>
        </div>

        <Link href="/comment-hub/create-new-hub" className="fixed bottom-6 right-6 z-40 bg-green-700 hover:bg-green-800 rounded-full shadow-lg p-5 transition-colors">
          <PlusIcon fontSize={64} size={32} color='#fff' />
        </Link>
      </div>
    </main>
  )
}

export default CommentHubPage
