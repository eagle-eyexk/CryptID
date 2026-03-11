import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type BurnTimer = 30 | 60 | 300 | 3600 | 86400 | -1;

export const BURN_LABELS: Record<BurnTimer, string> = {
  30: "30 sec",
  60: "1 min",
  300: "5 min",
  3600: "1 hour",
  86400: "24 hours",
  [-1]: "Never",
};

export type Message = {
  id: string;
  text: string;
  fromMe: boolean;
  timestamp: number;
  expiresAt: number | null;
  burned: boolean;
};

export type Conversation = {
  id: string;
  name: string;
  alias: string;
  burnTimer: BurnTimer;
  createdAt: number;
  messages: Message[];
};

type ChatsContextType = {
  conversations: Conversation[];
  createConversation: (name: string, alias: string, burnTimer: BurnTimer) => string;
  deleteConversation: (id: string) => Promise<void>;
  sendMessage: (convId: string, text: string) => Promise<void>;
  addAiMessage: (convId: string, text: string) => Promise<void>;
  burnAllMessages: (convId: string) => Promise<void>;
  getConversation: (id: string) => Conversation | undefined;
  isLoading: boolean;
};

const ChatsContext = createContext<ChatsContextType | null>(null);
const STORAGE_KEY = "cryptid_chats";

function purgeExpired(conversations: Conversation[]): Conversation[] {
  const now = Date.now();
  return conversations.map((conv) => ({
    ...conv,
    messages: conv.messages.filter(
      (m) => !m.expiresAt || m.expiresAt > now
    ),
  }));
}

export function ChatsProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const save = useCallback(async (convs: Conversation[]) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(convs));
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed: Conversation[] = JSON.parse(raw);
          const cleaned = purgeExpired(parsed);
          setConversations(cleaned);
          await save(cleaned);
        }
      } catch {
        // start fresh
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  // Purge expired messages every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setConversations((prev) => {
        const cleaned = purgeExpired(prev);
        save(cleaned);
        return cleaned;
      });
    }, 10_000);
    return () => clearInterval(interval);
  }, [save]);

  const createConversation = useCallback(
    (name: string, alias: string, burnTimer: BurnTimer): string => {
      const id =
        Date.now().toString() + Math.random().toString(36).substr(2, 9);
      const conv: Conversation = {
        id,
        name,
        alias,
        burnTimer,
        createdAt: Date.now(),
        messages: [],
      };
      setConversations((prev) => {
        const updated = [conv, ...prev];
        save(updated);
        return updated;
      });
      return id;
    },
    [save]
  );

  const deleteConversation = useCallback(
    async (id: string) => {
      setConversations((prev) => {
        const updated = prev.filter((c) => c.id !== id);
        save(updated);
        return updated;
      });
    },
    [save]
  );

  const sendMessage = useCallback(
    async (convId: string, text: string) => {
      const now = Date.now();
      setConversations((prev) => {
        const updated = prev.map((conv) => {
          if (conv.id !== convId) return conv;
          const msgId = now.toString() + Math.random().toString(36).substr(2, 9);
          const expiresAt =
            conv.burnTimer === -1 ? null : now + conv.burnTimer * 1000;
          const userMsg: Message = {
            id: msgId,
            text,
            fromMe: true,
            timestamp: now,
            expiresAt,
            burned: false,
          };
          return { ...conv, messages: [...conv.messages, userMsg] };
        });
        save(updated);
        return updated;
      });
    },
    [save]
  );

  const addAiMessage = useCallback(
    async (convId: string, text: string) => {
      const now = Date.now();
      setConversations((prev) => {
        const updated = prev.map((conv) => {
          if (conv.id !== convId) return conv;
          const msgId = now.toString() + Math.random().toString(36).substr(2, 9);
          const expiresAt =
            conv.burnTimer === -1 ? null : now + conv.burnTimer * 1000;
          const aiMsg: Message = {
            id: msgId,
            text,
            fromMe: false,
            timestamp: now,
            expiresAt,
            burned: false,
          };
          return { ...conv, messages: [...conv.messages, aiMsg] };
        });
        save(updated);
        return updated;
      });
    },
    [save]
  );

  const burnAllMessages = useCallback(
    async (convId: string) => {
      setConversations((prev) => {
        const updated = prev.map((conv) =>
          conv.id === convId ? { ...conv, messages: [] } : conv
        );
        save(updated);
        return updated;
      });
    },
    [save]
  );

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
        addAiMessage,
        burnAllMessages,
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
