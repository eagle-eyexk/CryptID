import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { computeCredentialHash, hashToDnaKey, DnaKey } from "@/utils/dna";
import { safeCompare, resetRateLimit } from "@/utils/security";

const USER_KEY = "cryptid_user_v2";
const SESSION_KEY = "cryptid_session";

export type StoredUser = {
  username: string;
  hash: string;
  dnaKey: DnaKey;
  createdAt: string;
};

type AuthContextType = {
  isLoading: boolean;
  hasAccount: boolean;
  isAuthenticated: boolean;
  user: StoredUser | null;
  register: (username: string, passphrase: string) => Promise<{ error?: string }>;
  login: (username: string, passphrase: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  wipeAll: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<StoredUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(USER_KEY);
        if (raw) {
          const stored: StoredUser = JSON.parse(raw);
          setUser(stored);
          // Check if session is still active (30 min window)
          const sessionRaw = await AsyncStorage.getItem(SESSION_KEY);
          if (sessionRaw) {
            const session = JSON.parse(sessionRaw);
            if (session.expiresAt && Date.now() < session.expiresAt) {
              setIsAuthenticated(true);
            } else {
              await AsyncStorage.removeItem(SESSION_KEY);
            }
          }
        }
      } catch {
        // start fresh
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const register = useCallback(async (username: string, passphrase: string): Promise<{ error?: string }> => {
    try {
      const existing = await AsyncStorage.getItem(USER_KEY);
      if (existing) return { error: "An identity already exists on this device." };

      const hash = await computeCredentialHash(username, passphrase);
      const dnaKey = hashToDnaKey(hash);

      const newUser: StoredUser = {
        username,
        hash,
        dnaKey,
        createdAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem(USER_KEY, JSON.stringify(newUser));

      // Start session (30 min)
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify({ expiresAt: Date.now() + 30 * 60_000 }));

      setUser(newUser);
      setIsAuthenticated(true);
      return {};
    } catch (e) {
      return { error: "Registration failed. Please try again." };
    }
  }, []);

  const login = useCallback(async (username: string, passphrase: string): Promise<{ error?: string }> => {
    try {
      const raw = await AsyncStorage.getItem(USER_KEY);
      if (!raw) return { error: "No identity found. Please register first." };

      const stored: StoredUser = JSON.parse(raw);

      // Username check (case-insensitive)
      if (stored.username.toLowerCase() !== username.toLowerCase()) {
        return { error: "Identity not recognised." };
      }

      // Hash the provided credentials and compare
      const hash = await computeCredentialHash(username, passphrase);
      if (!safeCompare(hash, stored.hash)) {
        return { error: "Incorrect passphrase." };
      }

      // Success — reset rate limit and start session
      await resetRateLimit();
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify({ expiresAt: Date.now() + 30 * 60_000 }));

      setUser(stored);
      setIsAuthenticated(true);
      return {};
    } catch {
      return { error: "Login failed. Please try again." };
    }
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem(SESSION_KEY);
    setIsAuthenticated(false);
  }, []);

  const wipeAll = useCallback(async () => {
    await AsyncStorage.clear();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        hasAccount: user !== null,
        isAuthenticated,
        user,
        register,
        login,
        logout,
        wipeAll,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
