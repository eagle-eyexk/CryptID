import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";

export type Message = {
  id: string;
  text: string;
  fromMe: boolean;
  timestamp: number;
};

export type Conversation = {
  id: string;
  name: string;
  alias: string;
  createdAt: number;
  messages: Message[];
};

type ChatsContextType = {
  conversations: Conversation[];
  createConversation: (name: string, alias: string) => string;
  deleteConversation: (id: string) => Promise<void>;
  sendMessage: (convId: string, text: string) => Promise<void>;
  burnAllMessages: (convId: string) => Promise<void>;
  markMessagesSeen: (convId: string, messageIds: string[]) => void;
  clearAllMessages: () => void;
  getConversation: (id: string) => Conversation | undefined;
  isLoading: boolean;
};

const ChatsContext = createContext<ChatsContextType | null>(null);

export function ChatsProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const isLoading = false;

  const createConversation = useCallback(
    (name: string, alias: string): string => {
      const id =
        Date.now().toString() + Math.random().toString(36).substr(2, 9);
      const conv: Conversation = {
        id,
        name,
        alias,
        createdAt: Date.now(),
        messages: [],
      };
      setConversations((prev) => {
        return [conv, ...prev];
      });
      return id;
    },
    []
  );

  const deleteConversation = useCallback(
    async (id: string) => {
      setConversations((prev) => {
        return prev.filter((c) => c.id !== id);
      });
    },
    []
  );

  const sendMessage = useCallback(
    async (convId: string, text: string) => {
      const now = Date.now();
      setConversations((prev) => {
        const updated = prev.map((conv) => {
          if (conv.id !== convId) return conv;
          const msgId = now.toString() + Math.random().toString(36).substr(2, 9);
          const userMsg: Message = {
            id: msgId,
            text,
            fromMe: true,
            timestamp: now,
          };
          return { ...conv, messages: [...conv.messages, userMsg] };
        });
        return updated;
      });
    },
    []
  );

  const burnAllMessages = useCallback(
    async (convId: string) => {
      setConversations((prev) => {
        return prev.map((conv) =>
          conv.id === convId ? { ...conv, messages: [] } : conv
        );
      });
    },
    []
  );

  const markMessagesSeen = useCallback(
    (convId: string, messageIds: string[]) => {
      if (!messageIds.length) return;
      const ids = new Set(messageIds);
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === convId
            ? { ...conv, messages: conv.messages.filter((message) => !ids.has(message.id)) }
            : conv
        )
      );
    },
    []
  );

  const clearAllMessages = useCallback(() => {
    setConversations([]);
  }, []);

  const getConversation = useCallback(
    (id: string) => conversations.find((c) => c.id === id),
    [conversations]
  );

  return (
    <ChatsContext.Provider
      value={{
        conversations,
        createConversation,
        deleteConversation,
        sendMessage,
        burnAllMessages,
        markMessagesSeen,
        clearAllMessages,
        getConversation,
        isLoading,
      }}
    >
      {children}
    </ChatsContext.Provider>
  );
}

export function useChats() {
  const ctx = useContext(ChatsContext);
  if (!ctx) throw new Error("useChats must be used within ChatsProvider");
  return ctx;
}
