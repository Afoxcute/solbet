import SendIcon from "@/public/icons/SendIcon";
import React, { forwardRef, useState, useEffect } from "react";
import { Message, useMessageStore } from "@/stores/use-messages-store";
import { useAuthLogin } from "@/hooks/use-auth-login";
import { trpc } from "@/trpc/client";
import { useSessionStore } from "@/stores/use-session-store";

interface MessageInputProps {
  ref: React.ForwardedRef<HTMLDivElement | null>;
  hubId: number;
  hubName: string
  onWagerClick?: () => void;
}

const MessageInput = forwardRef<HTMLDivElement | null, MessageInputProps>(
  ({ onWagerClick, hubId, hubName: name }, ref) => {
    // const { user } = useAuthLogin();
    const { session: user } = useSessionStore()
    const [message, setMessage] = useState("");
    // const messagesMutation = trpc.messages.sendMessages.useMutation();

    const utils = trpc.useUtils();
    const addMessage = trpc.messages.sendMessages.useMutation({
      // ✅ Optimistic Update
      onMutate: async (newMessage) => {
        await utils.messages.getAllMessages.cancel({ hubName: name });
        const previous = utils.messages.getAllMessages.getData({ hubName: name });
        const tempId = -Date.now()
        // Optimistically update local cache
        utils.messages.getAllMessages.setData({ hubName: name }, (old = []) => {
          const aNewMessage = {
            id: tempId,
            hubId,
            message: newMessage.content,
            author: {
              id: newMessage.userId!,
              name: user?.name!,
              profileImage: user?.profileImage!
            },
            userId: newMessage.userId,
            time: new Date().toISOString()
          }


          return [...old, aNewMessage].sort((a, b) =>
            new Date(a.time ?? '').getTime() - new Date(b.time ?? '').getTime()
          );
        });

        return { previous }
      },
      // ✅ Rollback on error
      onError: (err, newMessage, context) => {
        if (context?.previous) {
          utils.messages.getAllMessages.setData({ hubName: name }, context.previous);
        }
      },
      // ✅ Re-fetch on success
      onSettled: () => {
        utils.messages.getAllMessages.invalidate({ hubName: name });
      },
    });

    const handleSendMessage = async () => {
      if (!message.trim()) return;

      addMessage.mutateAsync({
        hubId,
        content: message.trim(),
        userId: Number(user?.id),
      })

      // Clear the input
      setMessage("");
    };

    // Handle enter key press
    const handleKeyPress = async (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    };

    // Focus the input when component mounts
    // useEffect(() => {
    //   const inputField = document.querySelector('.message-input') as HTMLInputElement;
    //   if (inputField) {
    //     setTimeout(() => {
    //       inputField.focus();
    //     }, 300);
    //   }
    // }, []);

    return (
      <div
        ref={ref}
        className="fixed bottom-0 bg-[#ECF5F5] p-3 right-0 left-0 z-40 shadow-lg border-t border-gray-200"
      >
        <div className="flex gap-2 items-center max-w-2xl mx-auto">
          <button
            onClick={onWagerClick}
            className="cursor-pointer bg-[#0A6B41] hover:bg-[#0A6B41] rounded-full py-2 px-6 text-white text-sm font-medium flex items-center gap-1 transition-colors flex-shrink-0"
          >
            <span className="text-lg"></span>
            <span>Wager</span>
          </button>

          <div className="flex justify-between items-center border border-[#D9D9D9] w-full rounded-lg py-1 px-3 focus-within:ring-1 focus-within:ring-blue-400">
            <input
              className="outline-none w-full p-1 bg-transparent message-input"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={async (e) => await handleKeyPress(e)}
              placeholder="Type a message..."
            />
            <button
              onClick={() => {
                handleSendMessage();
              }}
              disabled={!message.trim()}
              className={`${!message.trim()
                ? "text-gray-400"
                : "text-blue-500 hover:text-blue-600"
                } flex-shrink-0`}
            >
              <SendIcon />
            </button>
          </div>
        </div>
      </div>
    );
  }
);

MessageInput.displayName = "MessageInput";

export default MessageInput;
