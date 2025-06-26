"use client"
import { teamLogos, } from '@/data'
import BackIcon from '@/public/icons/BackIcon'
import CurvedArrow from '@/public/icons/CurvedArrow'
import { formatDateToBritish } from '@/utils/utils'
import { useRouter } from 'next/navigation'
import React, { useState, useEffect, useRef, FC } from 'react'
import MessagePopup from './ui/message-popup'
import MessageInput from './ui/message-input'
import gsap from 'gsap'
import WagerModal from './ui/WagerModal'
import FundWagerModal from './ui/FundWagerModal'
import TransactionConfirmedModal from './ui/TransactionConfirmedModal'
import { Message, useMessageStore } from '@/stores/use-messages-store'
import pusherClient from '@/lib/pusher/init'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { useAuthLogin } from '@/hooks/use-auth-login'
import Image from 'next/image'
import { useAtom } from 'jotai'
import { allMessagesAtom } from '@/stores/navStore'
import { getSolanaBalance } from '@/utils/solanaHelpers'
import { trpc } from '@/trpc/client'
import { useProviderStore } from '@/stores/use-provider-store'
import { useSessionStore } from '@/stores/use-session-store'
import { useWallet } from '@solana/wallet-adapter-react'

type ClientParticularGamePageProps = {
  seletedGame: any
  particularGameLiveScores: any
  escrowAccount: string
};

const ClientParticularGamePage: FC<ClientParticularGamePageProps> = ({ seletedGame, escrowAccount, particularGameLiveScores }) => {
  const router = useRouter();
  const inputRef = React.useRef<HTMLDivElement>(null);
  const boxRef = React.useRef<HTMLDivElement>(null);
  const messageAreaRef = useRef<HTMLDivElement>(null);
  const [isSlidOut, setIsSlidOut] = React.useState(false);
  const [messages, setMessages] = useAtom(allMessagesAtom)
  const [messageCount, setMessageCount] = useState(0);
  const homeMatchedKey = Object.keys(teamLogos).find((key) =>
    key.toLowerCase().includes(seletedGame ? seletedGame.team!.home.toLowerCase() : '')
  );
  const awayMatchedKey = Object.keys(teamLogos).find((key) =>
    key.toLowerCase().includes(seletedGame ? seletedGame.team!.away.toLowerCase() : '')
  );
  const logoHome = homeMatchedKey ? teamLogos[homeMatchedKey] : ''
  const logoAway = awayMatchedKey ? teamLogos[awayMatchedKey] : ''

  useEffect(() => {
    setMessageCount(messages.length);
  }, [messages]);

  // Track message changes and scroll to bottom when new messages are added
  useEffect(() => {
    if (messages.length > messageCount) {
      scrollToBottom();
      setMessageCount(messages.length);
    }
  }, [messages.length, messageCount]);

  useEffect(() => {
    const channel = pusherClient.subscribe(String(seletedGame.hub!.id));

    // channel.bind("new-message", (payload: any) => {
    //   console.log({payload});
    //   setMessages(prev => [
    //     ...prev,
    //     payload
    //   ]);
    // });

    channel.bind("new-message", (payload: any) => {
      setMessages(prev => {
        // Remove optimistic message (match by message content or negative temp ID logic)
        const filtered = prev.filter(msg => {
          // Option 1: Remove messages with same content and temp ID (if used)
          const isDuplicate =
            msg.message === payload.message &&
            msg.userId === payload.userId &&
            new Date(msg.time).getTime() === new Date(payload.time!).getTime();

          // Option 2: Remove negative ID (if optimistic messages use tempId = -Date.now())
          const isTemp = typeof msg.id === 'number' && msg.id < 0;

          return !isDuplicate && !isTemp;
        });

        return [...filtered, payload].sort((a, b) =>
          new Date(a.time).getTime() - new Date(b.time).getTime()
        );
      });
    });

    return () => {
      pusherClient.unsubscribe(String(seletedGame.hub!.id));
    };
  }, [pusherClient]);

  const scrollToBottom = () => {
    if (messageAreaRef.current) {
      setTimeout(() => {
        messageAreaRef.current?.scrollTo({
          top: messageAreaRef.current.scrollHeight,
          behavior: "smooth",
        });
      }, 100);
    }
  };

  // New function to handle manual scroll to bottom
  const handleScrollToBottom = () => {
    scrollToBottom();
  };

  // Wager state
  const { session: user } = useSessionStore()
  const { publicKey, connected } = useWallet()
  const [isWagerModalOpen, setIsWagerModalOpen] = useState(false);
  const [isFundModalOpen, setIsFundModalOpen] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [insufficientBalance, setInsufficientBalance] = useState(false);
  const [wagerCondition, setWagerCondition] = useState("");
  const [stakeAmount, setStakeAmount] = useState(0);
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);
  const { date, time } = formatDateToBritish(seletedGame ? seletedGame.team!.startTime : '')
  const [newBalance, setNewBalance] = useState(0)
  const { provider } = useProviderStore()
  // const {data: privateKey, isLoading, error} = trpc.users.getPrivateKey.useQuery({email: user?.email!, provider: provider})

  console.log({ provider: provider, user })

  useEffect(() => {
    if (user !== null && connected) {
      const lastRunKey = 'last-balance-check';
      const now = Date.now();
      const lastRun = Number(localStorage.getItem(lastRunKey));

      const TWO_MINUTES = 2 * 60 * 1000;

      if (!lastRun || now - lastRun > TWO_MINUTES) {
        const getB = async () => {
          const userBalance = await getSolanaBalance(publicKey!.toBase58());
          console.log({ userBalance })

          // await updateWalletData(user?.address!);
          setNewBalance(userBalance)
          localStorage.setItem(lastRunKey, String(now));
        };

        getB();
      }
    }
  }, [user]);


  const handleToggle = () => {
    if (!boxRef.current) return;

    if (!isSlidOut) {
      boxRef.current.style.position = "fixed";
      boxRef.current.style.top = `${boxRef.current.offsetTop}px`;
      boxRef.current.style.left = `${boxRef.current.offsetLeft}px`;

      // Slide OUT (down off the screen)
      gsap.to(boxRef.current, {
        y: window.innerHeight,
        duration: 1,
        ease: "power4.in",
      });

      // Animate input down and fade
      gsap.to(inputRef.current, {
        y: 100,
        opacity: 0,
        duration: 1,
        ease: "power4.in",
      });
    } else {
      // Slide BACK IN (to original position)
      gsap.to(boxRef.current, {
        y: 0,
        duration: 1,
        ease: "power4.in",
        onComplete: () => {
          if (boxRef.current) {
            boxRef.current.style.position = "static";
          }
        },
      });

      gsap.to(inputRef.current, {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power4.out",
      });
    }

    setIsSlidOut((prev) => !prev); // Toggle state
  };

  const handleWagerClick = () => {
    setSelectedMessage(null);
    setIsWagerModalOpen(true);
  };

  const handleWagerProceed = (condition: string, stake: number) => {
    setWagerCondition(condition);
    setStakeAmount(stake);

    // For demo purposes, we're showing insufficient balance if stake > 5
    if (stake < 0.5 || newBalance === 0) {
      setInsufficientBalance(true);
    } else {
      setIsWagerModalOpen(false);
      setIsFundModalOpen(true);
    }
  };

  const handleFundConfirm = async () => {
    try {
      // In a real implementation, we would use the BettingClient
      // For example:
      // const wallet = new Wallet(keypair);
      // const bettingClient = new BettingClient(wallet, 'devnet');
      // const tx = await bettingClient.placeBet(
      //   matchId,
      //   stakeAmount,
      //   wagerCondition,
      //   tokenMint,
      //   bettorTokenAccount,
      //   escrowTokenAccount
      // );

      // For demo, we just show confirmation
      setIsFundModalOpen(false);
      setIsConfirmationModalOpen(true);

      // Close confirmation after 3 seconds
      setTimeout(() => {
        setIsConfirmationModalOpen(false);
      }, 3000);
    } catch (error) {
      console.error("Error placing bet:", error);
    }
  };

  return (
    <main className="min-h-screen flex flex-col">
      <div className="overflow-visible text-white z-30 shadow-md pb-3 bg-gradient-to-b from-gradientDarkGreen to-gradientLightGreen">
        <div className="container mx-auto px-4 md:px-6 pt-2 pb-2">
          {/* Navigation bar */}
          <div className="flex justify-between items-center mb-2">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-full hover:bg-[#3E3D3D30] transition-colors"
            >
              <BackIcon />
            </button>
            <CurvedArrow />
          </div>

          {/* Teams and score section */}
          <div className="flex flex-col justify-center items-center">
            <div className="flex w-full md:w-[90%] max-w-2xl pt-1 justify-between items-center">
              {/* Home team */}
              <div className="flex flex-col items-center">
                {seletedGame.team.home && (
                  <Image
                    src={logoHome}
                    alt={seletedGame.team.home}
                    width={100}
                    height={100}
                    className="w-[40px] md:w-[50px] lg:w-[60px] transition-transform hover:scale-105"
                  />
                )}
                <p className="text-center text-[0.65rem] md:text-[0.7rem] lg:text-[0.8rem] font-medium mt-1">
                  {seletedGame.team.home}
                </p>
              </div>

              {/* Score or time */}
              <div className="grid place-items-center">
                <div className="flex items-center gap-2 leading-8 font-bold">
                  <p className="text-[2rem] md:text-[2.2rem] lg:text-[2.5rem]">
                    {seletedGame.hub.isGameStarted === true ? particularGameLiveScores.home.score : seletedGame.team.homeScore}
                  </p>
                  <span className="text-[2rem] md:text-[2.2rem] lg:text-[2.5rem]">
                    {" "}
                    -{" "}
                  </span>
                  <p className="text-[2rem] md:text-[2.2rem] lg:text-[2.5rem]">
                    {seletedGame.hub.isGameStarted === true ? particularGameLiveScores.away.score : seletedGame.team?.awayScore}
                  </p>
                </div>
                <div className=" text-[0.65rem] md:text-[0.7rem] flex flex-col gap-1 items-center bg-[#ffffff20] px-3 py-0.5 rounded-full">
                  <span>{seletedGame.hub.isGameStarted === true && particularGameLiveScores.status.liveTime.long}</span>
                  <span>{seletedGame.hub.isGameStarted === false && date}</span>
                </div>
              </div>

              {/* Away team */}
              <div className="flex flex-col items-center">
                {seletedGame.team.away && (
                  <Image
                    src={logoAway}
                    alt={seletedGame.team.away}
                    width={100}
                    height={100}
                    className="w-[40px] md:w-[50px] lg:w-[60px] transition-transform hover:scale-105"
                  />
                )}
                <p className="text-center text-[0.65rem] md:text-[0.7rem] lg:text-[0.8rem] font-medium mt-1">
                  {seletedGame.team.away}
                </p>
              </div>
            </div>

            {/* Match overview section - using a green underline to make it stand out */}
            <div className="mt-3 mb-1">
              <p className=" font-medium text-[0.7rem] md:text-[0.8rem] inline-block relative p-2">


              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Container - Adjusts based on screen size */}
      <div className="">
        {/* Message area - takes remaining height */}
        <div
          ref={messageAreaRef}
          className="border h-[calc(100vh-290px)] sm:h-[calc(100vh-340px)] bg-[#ECF5F5] flex-1 z-20 overflow-y-auto rounded-t-3xl message-area"
          style={{ marginTop: "0", border: "none" }}
        >
          <div className="  px-3 py-1 bg-[#ECF5F5] pb-20" ref={boxRef}>
            <MessagePopup seletedGame={seletedGame} />
          </div>

          {/* Scroll to Bottom button - shows only when not at bottom */}
          <button
            onClick={handleScrollToBottom}
            className="fixed bottom-24 right-4 text-black rounded-full p-3 transition-colors z-50"
            aria-label="Scroll to bottom"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="black"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </button>
        </div>

        {/* Message input - always at bottom */}
        <MessageInput
          hubName={seletedGame.hub.name!}
          hubId={seletedGame.hub.id!}
          ref={inputRef}
          onWagerClick={handleWagerClick}
        />
      </div>

      {/* Wager Modals */}
      <WagerModal
        isOpen={isWagerModalOpen}
        onClose={() => {
          setIsWagerModalOpen(false);
          setInsufficientBalance(false);
        }}
        onProceed={handleWagerProceed}
        selectedGame={seletedGame}
        escrowAccount={escrowAccount ? escrowAccount : ""}
        username={user?.name || "Pkay"}
        insufficientBalance={insufficientBalance}
      />

      <FundWagerModal
        isOpen={isFundModalOpen}
        onClose={() => setIsFundModalOpen(false)}
        onConfirm={handleFundConfirm}
        amount={stakeAmount}
      />

      <TransactionConfirmedModal
        isOpen={isConfirmationModalOpen}
        onClose={() => setIsConfirmationModalOpen(false)}
      />
    </main>
  );

};

export default ClientParticularGamePage;
