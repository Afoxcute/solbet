"use client";
import { useMessageStore, Reply } from "@/stores/use-messages-store";
import React, { useState, useEffect } from "react";
import { formatDateToBritish, formatNumberInThousands } from "@/utils/utils";
import ReactionsIcon from "@/public/icons/ReactionsIcon";
import ShareIcon from "@/public/icons/ShareIcon";
import WagerModal from "./WagerModal";
import FundWagerModal from "./FundWagerModal";
import TransactionConfirmedModal from "./TransactionConfirmedModal";
import { BettingClient } from "@/client/betting-client";
import { Wallet } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
import { useAuth } from "@/utils/useAuth";
import toast from "react-hot-toast";
import { trpc } from "@/trpc/client";
import { set } from "@project-serum/anchor/dist/cjs/utils/features";
import { useAtom } from "jotai";
import { allMessagesAtom } from "@/stores/navStore";
import LoadingIcon from "@/public/icons/LoadingIcon";
import Image from "next/image";

const MessagePopup = ({ seletedGame }: { seletedGame: any }) => {
  const [messages, setMessages] = useAtom(allMessagesAtom)
  const {
    data: allMessages,
    isLoading,
    error,
  } = trpc.messages.getAllMessages.useQuery({ hubName: seletedGame.hub.name });
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [isWagerModalOpen, setIsWagerModalOpen] = useState(false);
  const [isFundModalOpen, setIsFundModalOpen] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [insufficientBalance, setInsufficientBalance] = useState(false);
  const [wagerCondition, setWagerCondition] = useState("");
  const [stakeAmount, setStakeAmount] = useState(0);
  const [replyText, setReplyText] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [showAllReplies, setShowAllReplies] = useState<Record<string, boolean>>(
    {}
  );

  // console.log({allMessages, seletedGame})

  useEffect(() => {
    if (!isLoading && allMessages) {
      setMessages(allMessages);
    }
  }, [allMessages, isLoading, setMessages]);


  const handleWagerClick = (message: any) => {
    setSelectedMessage(message);
    setIsWagerModalOpen(true);
  };

  const handleWagerProceed = (condition: string, stake: number) => {
    setWagerCondition(condition);
    setStakeAmount(stake);

    // For demo purposes, we're showing insufficient balance if stake > 5
    if (stake < 0.1) {
      setInsufficientBalance(true);
    } else {
      setIsWagerModalOpen(false);
      setIsFundModalOpen(true);
    }
  };

  const handleFundConfirm = async () => {
    try {
      // In a real implementation, we would use the BettingClient to submit the transaction
      // const wallet = new Wallet(/* user's keypair */);
      // const bettingClient = new BettingClient(wallet, 'devnet');
      // const tx = await bettingClient.placeBet(
      //   `${selectedMessage.id}`,
      //   stakeAmount,
      //   wagerCondition,
      //   new PublicKey('your-token-mint'),
      //   new PublicKey('your-bettor-token-account'),
      //   new PublicKey('your-escrow-token-account')
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

  const handleShowReplies = (messageId: number) => {
    setShowAllReplies((prev) => ({
      ...prev,
      [messageId]: !prev[messageId],
    }));
  };

  const handleReplyClick = (messageId: number) => {
    setReplyingTo(messageId);
  };

  // const handleSubmitReply = (messageId: string) => {
  //   if (!replyText.trim()) return;
  //
  //   // Check if it's a standard message or custom Josiah message
  //   if (messageId.startsWith("josiah-")) {
  //     const reply: Reply = {
  //       id: 1,
  //       author: {
  //         id: 1,
  //         name: user?.name as string,
  //         profileImage: user?.image || "https://via.placeholder.com/50?text=U",
  //       }
  //       content: replyText
  //     };
  //
  //     // Update the custom messages state
  //     setCustomMessages(prev => ({
  //       ...prev,
  //       [messageId]: {
  //         ...prev[messageId],
  //         replies: [...prev[messageId].replies, reply]
  //       }
  //     }));
  //
  //     // Show success notification
  //     toast.success("Reply added successfully!");
  //   } else {
  //     // For regular messages in the message store
  //     const reply: Reply = {
  //       id: `reply-${Date.now()}`,
  //       avatarUrl: user?.image || "https://via.placeholder.com/50?text=U",
  //       username: user?.username || "You",
  //       time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  //       content: replyText
  //     };
  //
  //     addReply(messageId, reply);
  //     toast.success("Reply added successfully!");
  //   }
  //
  //   // Clear the reply text but keep the reply input open
  //   setReplyText('');
  //
  //   // Make sure the replies section is expanded
  //   setShowAllReplies(prev => ({
  //     ...prev,
  //     [messageId]: true
  //   }));
  // }

  // Enhanced messages for demo
  if(isLoading) {
    return (
    <div className="flex justify-center py-4">
      <LoadingIcon />
    </div>
    )
  } else {
    return (
    <section className="overflow-auto h-full pt-2">
      {/* Original messages */}
      {messages.length === 0 ? (
        <p className="text-center text-gray-500 py-8">
          No messages in the hub.
        </p>
      ) : (
        messages.map((message, i) => {
            const {date, time} = formatDateToBritish(message.time!)
          return (
          <div
            key={message.id}
            className={`${
              i !== messages.length - 1 && "border-b border-[#B7B7B7] "
            } py-4`}
          >
            <div className="flex gap-2 items-start">
              <Image
                src={message.author?.profileImage}
                alt={message.author?.name}
                width={50}
                height={50}
                className="size-[50px] rounded-full object-cover"
              />

              <div className="grid gap-1 w-full">
                <p className="flex gap-1 items-center">
                  <span className="text-[#616061] text-[1rem] md:text-[0.75rem] font-medium">
                    {message.author?.name}
                  </span>
                  <span className="text-[0.5rem] lg:text-[0.5rem] text-[#808080]/55">
                    {time}
                  </span>
                </p>
                <p className="flex gap-2 justify-between items-start">
                  <span className="lg:w-[700px] text-[1rem] tracking-[0.2px] w-full">
                    {message.message}
                  </span>
                  {/* {!message.isRef && ( */}
                  {/*   <button */}
                  {/*     className='flex items-center gap-[2px]' */}
                  {/*     onClick={() => handleWagerClick(message)} */}
                  {/*   > */}
                  {/*     <span className='text-[0.9rem] lg:text-[0.9rem]'>⚽</span> */}
                  {/*     <span className='text-[#000]/50 text-[0.6rem] w-[15%] lg:text-[0.8rem]'> {formatNumberInThousands(message.actionNos)}</span> */}
                  {/*   </button> */}
                  {/* )} */}
                </p>

                <div className="lg:w-[700px] text-[1rem] tracking-[0.2px] w-[calc(100%_-_10%)] flex justify-between items-center">
                  {message.replies && message.replies.length > 0 ? (
                    <button
                      onClick={() => handleShowReplies(message.id!)}
                      className="text-[#000000] underline text-[0.7rem] lg:text-[0.75rem] hover:text-blue-600"
                    >
                      {showAllReplies[message.id!]
                        ? "Hide replies"
                        : `View ${message.replies.length} ${
                            message.replies.length === 1 ? "reply" : "replies"
                          }`}
                    </button>
                  ) : (
                    <button className="text-[#ECF5F5]/60 text-[0.7rem] lg:text-[0.75rem] hover:text-[#ECF5F5]">
                      {`Reply to ${message.author?.name}`}
                    </button>
                  )}

                  <div className="flex gap-2 items-center">
                    {/* {!message.isRef && ( */}
                    {/*   <button */}
                    {/*     className='bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium hover:bg-yellow-200' */}
                    {/*     onClick={() => handleWagerClick(message)} */}
                    {/*   > */}
                    {/*     Wager */}
                    {/*   </button> */}
                    {/* )} */}
                  </div>
                </div>

                {/* Show all replies when expanded */}
                {/* {showAllReplies[message.id] && message.replies && ( */}
                {/*   <div className="ml-12 mt-3 border-l-2 border-gray-200 pl-4"> */}
                {/*     <Replies replies={message.replies} messageUsername={message.username} /> */}
                {/**/}
                {/*     {replyingTo !== message.id && ( */}
                {/*       <div className="mt-2 mb-3"> */}
                {/*         <button */}
                {/*           onClick={() => setReplyingTo(message.id)} */}
                {/*           className="text-blue-600 text-sm hover:text-blue-800" */}
                {/*         > */}
                {/*           Add a reply... */}
                {/*         </button> */}
                {/*       </div> */}
                {/*     )} */}
                {/*   </div> */}
                {/* )} */}

                {/* Reply input when replying to this message */}
                {replyingTo === message.id && (
                  <div className="mt-2 ml-6 flex gap-2 items-center">
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={`Reply to ${message.author?.name}...`}
                      className="flex-1 p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => setReplyingTo(null)}
                        className="text-gray-500 text-sm hover:text-gray-700"
                      >
                        Cancel
                      </button>
                      <button
                        className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-600"
                        disabled={!replyText.trim()}
                      >
                        Send
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) 
        })
      )}

      {/* Wager Modals */}
      <WagerModal
        isOpen={isWagerModalOpen}
        onClose={() => {
          setIsWagerModalOpen(false);
          setInsufficientBalance(false);
        }}
        selectedGame={seletedGame}
        onProceed={handleWagerProceed}
        username={selectedMessage?.username || "User"}
        insufficientBalance={insufficientBalance}
        escrowAccount={seletedGame.hub.escrowAccount || ""}
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
    </section>
  );
  }
};

export default MessagePopup;
