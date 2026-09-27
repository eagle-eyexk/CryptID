import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { computeCredentialHash, hashToDnaKey, DnaKey } from "@/utils/dna";
import { safeCompare, resetRateLimit } from "@/utils/security";

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
let inMemoryUser: StoredUser | null = null;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoading] = useState(false);
  const [user, setUser] = useState<StoredUser | null>(() => inMemoryUser);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const register = useCallback(async (username: string, passphrase: string): Promise<{ error?: string }> => {
    try {
      if (inMemoryUser) return { error: "An identity already exists in this session." };

      const hash = await computeCredentialHash(username, passphrase);
      const dnaKey = hashToDnaKey(hash);

      const newUser: StoredUser = {
        username,
        hash,
        dnaKey,
        createdAt: new Date().toISOString(),
      };

      inMemoryUser = newUser;
      setUser(newUser);
      setIsAuthenticated(true);
      return {};
    } catch (e) {
      return { error: "Registration failed. Please try again." };
    }
  }, []);

  const login = useCallback(async (username: string, passphrase: string): Promise<{ error?: string }> => {
    try {
      const stored = inMemoryUser;
      if (!stored) return { error: "No identity exists in this session. Create one first." };

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
      setUser(stored);
      setIsAuthenticated(true);
      return {};
    } catch {
      return { error: "Login failed. Please try again." };
    }
  }, []);

  const logout = useCallback(async () => {
    setIsAuthenticated(false);
  }, []);

  const wipeAll = useCallback(async () => {
    inMemoryUser = null;
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
