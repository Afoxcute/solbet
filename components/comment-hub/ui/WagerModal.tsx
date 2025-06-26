import { BettingClient } from '@/client/betting-client';
import { trpc } from '@/trpc/client';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useSessionStore } from '@/stores/use-session-store';
import React, { useState } from 'react';
import toast from 'react-hot-toast';

interface WagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceed: (condition: string, stake: number) => void;
  selectedGame: any
  username?: string;
  insufficientBalance?: boolean;
  escrowAccount: string
}

const WagerModal: React.FC<WagerModalProps> = ({
  isOpen,
  onClose,
  selectedGame,
  onProceed,
  username = '',
  escrowAccount,
  insufficientBalance,
}) => {
  const [wagerCondition, setWagerCondition] = useState('');
  const { session: user } = useSessionStore()
  const { publicKey, connected } = useWallet()
  const bettingClient = new BettingClient(publicKey!)
  const [isLoading, setIsLoading] = useState(false);
  const [stakeAmount, setStakeAmount] = useState('');
  const [forUsername, setForUsername] = useState(username);
  const [againstUsername, setAgainstUsername] = useState('');
  const wagerMutation = trpc.wagers.placeWager.useMutation();
  // const {data: escrowAccount, isLoading, error} = trpc.users.getEscrowAccount.useQuery()

  if (!isOpen) return null;

  const handleProceed = async (home: string, away: string, hubId: number, startTime: number) => {
    if (wagerCondition && stakeAmount && escrowAccount && connected) {
      const date = new Date(startTime)
      const formattedTime = date.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }); // e.g., "14:30"

      const numericTime = parseInt(formattedTime.replace(":", ""), 10);
      setIsLoading(true)
      try {
        toast.loading('This might take a while.....')
        // const transaction = await bettingClient.initialize(2)

        const newMatchTx = await bettingClient.createMatch(home, away, String(hubId), numericTime)
        console.log({ newMatchTx })
        if (newMatchTx) {
          const betTx = await bettingClient.placeBet(
            String(hubId),
            Number(stakeAmount),
            wagerCondition,
            publicKey!,
            new PublicKey(escrowAccount)
          )

          console.log({ betTx })
          if (betTx) {
            await wagerMutation.mutateAsync({
              condition: wagerCondition,
              for: Number(user?.id),
              amount: Number(stakeAmount),
              hubId,
            })
          }
          // console.log({newMatchTx, betTx, transaction})
          toast.success('Wager created')
        }
      } catch (error) {
        toast.error('Cannot create a wager')
      } finally {
        setIsLoading(false)
      }
    }
  };

  return (
    <div onClick={(e) => {
      onClose();
      e.stopPropagation();
    }} className="fixed inset-0 bg-black/50 flex items-center justify-center !z-[999999999999] p-4">
      <div onClick={(e) => { e.stopPropagation(); }} className="bg-white w-full max-w-md rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-center flex-1">{insufficientBalance ? "WAGER💰" : "WAGER"}</h2>
          <button onClick={onClose} className="text-black text-2xl ml-2">×</button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="font-bold text-sm mb-2">FOR</p>
            <div className="border border-gray-300 rounded px-2 py-1">
              <input
                type="text"
                className="w-full text-sm outline-none"
                placeholder="@Username"
                value={forUsername ? `@${forUsername}` : ''}
                onChange={(e) => setForUsername(e.target.value.replace('@', ''))}
              />
            </div>
          </div>
          <div>
            <p className="font-bold text-sm mb-2">AGAINST</p>
            <div className="border border-gray-300 rounded px-2 py-1">
              <input
                type="text"
                className="w-full text-sm outline-none"
                placeholder="@Username"
                value={againstUsername ? `@${againstUsername}` : ''}
                onChange={(e) => setAgainstUsername(e.target.value.replace('@', ''))}
              />
            </div>
          </div>
        </div>

        <div className="mb-6">
          <p className="font-bold text-sm mb-2">WAGER CONDITION<span className="text-red-500">*</span></p>
          <div className="border border-gray-300 rounded px-2 py-2">
            <input
              type="text"
              className="w-full text-sm outline-none"
              placeholder="Barcelona to win and Yamal to score"
              value={wagerCondition}
              onChange={(e) => setWagerCondition(e.target.value)}
            />
          </div>
        </div>

        <div className="mb-6">
          <p className="font-bold text-sm mb-2">STAKE<span className="text-red-500">*</span></p>
          <div className="border border-gray-300 rounded px-2 py-2">
            <input
              type="text"
              className="w-full text-sm outline-none"
              placeholder="1 SOL"
              value={stakeAmount}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9.]/g, '');
                setStakeAmount(val);
              }}
            />
          </div>
        </div>

        {insufficientBalance && (
          <p className="text-xs text-red-500 mb-2">Insufficient wallet balance</p>
        )}

        <div className="flex justify-end">
          <button
            className={`bg-green-700 disabled:bg-gray-700 text-white px-4 py-2 rounded`}
            onClick={
              async () => await handleProceed(
                selectedGame.team.home,
                selectedGame.team.away,
                selectedGame.id,
                selectedGame.team.startTime
              )
            }
            disabled={!wagerCondition || !stakeAmount || isLoading}
          >
            {isLoading ? 'Booking...' : !connected ? 'Connect to wallet' : 'Book'}
          </button>
        </div>

        {insufficientBalance && (
          <p className="text-xs text-center mt-2">Funds from external wallet</p>
        )}
      </div>
    </div>
  );
};

export default WagerModal; 
