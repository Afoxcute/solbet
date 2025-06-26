"use client";
import React from "react";
import useEmblaCarousel from "embla-carousel-react";
import { DotButton, useDotButton } from "./carousel-buttons";
import { Game, teamLogos } from "@/data";
import Image from "next/image";
import CurvedArrow from "@/public/icons/CurvedArrow";
import { formatDateToBritish, formatString } from "@/utils/utils";
import { useRouter } from "next/navigation";
import { useAuthLogin } from "@/hooks/use-auth-login";
import { toast } from "react-hot-toast";
import { trpc } from "@/trpc/client";
import { useSessionStore } from "@/stores/use-session-store";

const LiveCarousel = ({
  tabs,
}: {
  tabs: any[] | undefined;
}) => {
  const router = useRouter();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });
  const launchNewHubMutation = trpc.hubs.launchHubs.useMutation()
  const { selectedIndex, scrollSnaps, onDotButtonClick } =
    useDotButton(emblaApi);

  React.useEffect(() => {
    if (emblaApi) {
      //console.log(emblaApi.slideNodes()) // Access API
    }
  }, [emblaApi]);

  const { session: user } = useSessionStore()
  const { login, loggedIn } = useAuthLogin();

  async function launchNewHub(urlRoute: string, home: string, away: string, startTime: string, homeScore: number, awayScore: number) {
    if (user !== null) {
      toast.success("Launching the hub");

      await launchNewHubMutation.mutateAsync({
        name: urlRoute,
        startTime,
        home,
        away,
        awayScore,
        homeScore,
        isGameStarted: true
      })

      router.push(`/comment-hub/${urlRoute}`);
    } else {
      toast.error("Please login to join the hub");
      login();
    }
  }

  function joinAHub(urlRoute: string) {
    if (user !== null) {
      toast.success("Joining the hub");
      router.push(`/comment-hub/${urlRoute}`);
    } else {
      toast.error("Please login to join the hub");
      login();
    }

  }



  return (
    <div className="overflow-hidden mt-[20px]" ref={emblaRef}>
      <div className="flex lg:gap-1 lg[touch-action:pan-y_pinch-zoom] lg:ml-[calc(1rem_*_ -1)]">
        {tabs?.length === 0 ? (
          <p className="text-[1.5rem] flex items-center justify-center text-center p-5">No live games currently</p>
        ) : (
          <>
            {tabs?.map((game, i) => {
              const urlRoute = formatString(`${game.home.name} vs ${game.away.name}`);
              const { data: hub, isLoading, error } = trpc.hubs.getAParticularHub.useQuery({ name: urlRoute })
              const homeMatchedKey = Object.keys(teamLogos).find((key) =>
                key.toLowerCase().includes(game.home.name.toLowerCase())
              );
              const awayMatchedKey = Object.keys(teamLogos).find((key) =>
                key.toLowerCase().includes(game.away.name.toLowerCase())
              );
              const logoHome = homeMatchedKey ? teamLogos[homeMatchedKey] : ''
              const logoAway = awayMatchedKey ? teamLogos[awayMatchedKey] : ''

              return (
                <div
                  className="min-w-0 lg:lg:transform-gpu lg:pl-[1rem] lg:flex-[0_0_50%] flex-[0_0_100%] gap-3 border border-[#BEBEBE]/50 bg-white rounded-[12px]"
                  key={i}
                >
                  <div className="p-3 text-black">
                    <div className="flex justify-between items-center">
                      <div
                        className={`text-[0.65rem] text-[#FF0000] flex gap-1 items-center`}
                      >
                        <div className="bg-[#FF0000] size-1 rounded" />
                        Live
                      </div>
                      <p className="font-semibold text-[1rem]">Premier League</p>
                      <CurvedArrow />
                    </div>

                    <div className="flex justify-between items-center p-4">
                      <div className="flex flex-col items-center">
                        <Image
                          src={logoHome}
                          alt={game.home.name}
                          width={100}
                          height={100}
                          className="w-[50px] lg:w-[150px]"
                        />
                        <p className="text-center text-[0.9rem] lg:text-[1rem] ">
                          {game.home.name}
                        </p>
                      </div>

                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-1 font-bold">
                          <p className="text-[#FF0000] text-[1.5rem] lg:text-[2rem]">
                            {game.home.score}
                          </p>
                          <span className="text-[1.5rem] lg:text-[2rem]">:</span>
                          <p className="text-[#FF0000] text-[1.5rem] lg:text-[2rem]">
                            {game.away.score}
                          </p>
                        </div>
                        <div>{game.status.liveTime.long}</div>
                      </div>


                      <div className="flex flex-col items-center">
                        <Image
                          src={logoAway}
                          alt={game.away.name}
                          width={100}
                          height={100}
                          className="w-[50px] lg:w-[150px]"
                        />
                        <p className="text-center text-[0.9rem] lg:text-[1rem]">
                          {game.away.name}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-center items-center">
                      <button
                        onClick={async () => {
                          if (hub?.hub.name === urlRoute) {
                            joinAHub(urlRoute)
                          } else {
                            await launchNewHub(urlRoute, game.home.name, game.away.name, game.status.utcTime, game.home.score, game.away.score)
                          }
                        }}
                        className="w-fit bg-darkGreen py-1 cursor-pointer px-6 text-white font-extrabold rounded-xl"
                      >
                        {(!isLoading && hub?.hub.name === urlRoute) ? 'Join Hub' : 'Launch Hub'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      <div className="flex gap-[2px] mt-[5px] flex-wrap justify-center items-center -mr-[calc((2.6rem-1.4rem)/2)]">
        {scrollSnaps.map((_, index) => (
          <DotButton
            key={index}
            onClick={() => onDotButtonClick(index)}
            className={`appearance-none bg-transparent touch-manipulation inline-flex items-center justify-center cursor-pointer border-0 p-0 m-0 w-[10px] h-[10px] rounded-full ${index === selectedIndex
              ? "shadow-[inset_0_0_0_0.2rem_#0A6B41]"
              : "shadow-[inset_0_0_0_0.2rem_#7BAF9A]"
              }`}
          />
        ))}
      </div>
    </div>
  )
}

export default LiveCarousel
