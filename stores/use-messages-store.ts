import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Message {
  message: string,
  id?: number,
  hubId: number,
  userId?: number,
  author?: {
    id: number,
    name: string
    profileImage: string
  },
  time?: string
  replies?: Reply[]
}

export interface Reply {
  id: number;
  commentId: number | null;
  content: string;
  author: {
    id: number | null;
    name: string | null;
    profileImage: string | null
  };
}

interface MessageStore {
  messages: Message[];
  setMessages: (messages: any[]) => void;
  addMessage: (message: any) => void;
  // addReaction: (messageId: string, reaction: string) => void;
  addReply: (messageId: number, reply: Reply) => void;
  // addActionNos: (messageId: string, emoji: number) => void;
  // addReactionsToRef: (messageId: string, type: Reaction) => void;
}

export const useMessageStore = create<MessageStore>()(
  persist(
    (set) => ({
      messages: [],

      setMessages: (messages) => set({ messages }),

      addMessage: (message) =>
        set((state) => ({
          messages: [...state.messages, message]
        })),

      // addReactionsToRef: (messageId, type) =>
      //   set((state) => ({
      //     messages: state.messages.map((m) =>
      //       m.id === messageId
      //         ? ({
      //           ...m,
      //           reactionsToRef: {
      //             ...m.reactionsToRef, // Retain existing reactions
      //             [type]: (m.reactionsToRef?.[type] || 0) + 1, // Increment the specific reaction
      //           },
      //         } as Message)
      //         : m
      //     ),
      //   })),

      // addReaction: (messageId, reaction) =>
      //   set((state) => ({
      //     messages: state.messages.map((msg) =>
      //       msg.id === messageId
      //         ? {
      //           ...msg,
      //           reactions: msg.reactions ? [...msg.reactions, reaction] : [reaction]
      //         }
      //         : msg
      //     )
      //   })),

      addReply: (messageId, reply) =>
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === messageId
              ? {
                ...msg,
                replies: msg.replies ? [...msg.replies, reply] : [reply]
              }
              : msg
          )
        })),

      // addActionNos: (messageId, number) =>
      //   set((state) => ({
      //     messages: state.messages.map((msg) =>
      //       msg.id === messageId
      //         ? {
      //           ...msg,
      //           actionNos: msg.actionNos + number
      //         }
      //         : msg
      //     )
      //   }))
    }),
    { name: "messages-store" }
  )
);

