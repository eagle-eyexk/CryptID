import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { Platform } from "react-native";
import {
  computeCredentialHash,
  createCredentialMaterial,
  CREDENTIAL_KDF,
  CREDENTIAL_KDF_ITERATIONS,
} from "@/utils/dna";
import type { DnaKey } from "@/utils/dna";
import { safeCompare, resetRateLimit } from "@/utils/security";
import { apiFetch, readApiError } from "@/utils/api";

export type StoredUser = {
  id?: string;
  username: string;
  algorithm?: typeof CREDENTIAL_KDF;
  iterations?: typeof CREDENTIAL_KDF_ITERATIONS;
  salt?: string;
  hash?: string;
  dnaKey?: DnaKey;
  createdAt: string;
  sessionExpiresAt?: string;
};

type AuthContextType = {
  isLoading: boolean;
  hasAccount: boolean;
  isAuthenticated: boolean;
  user: StoredUser | null;
  register: (username: string, passphrase: string) => Promise<{ error?: string; dnaKey?: DnaKey }>;
  login: (username: string, passphrase: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  wipeAll: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);
let inMemoryUser: StoredUser | null = null;

type ServerUser = {
  id: string;
  username: string;
  createdAt: string;
  sessionExpiresAt: string;
};

function parseServerUser(value: unknown): StoredUser | null {
  if (!value || typeof value !== "object") return null;
  const user = value as Partial<ServerUser>;
  if (
    typeof user.id !== "string" ||
    typeof user.username !== "string" ||
    typeof user.createdAt !== "string" ||
    typeof user.sessionExpiresAt !== "string"
  ) {
    return null;
  }
  return {
    id: user.id,
    username: user.username,
    createdAt: user.createdAt,
    sessionExpiresAt: user.sessionExpiresAt,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const isWeb = Platform.OS === "web";
  const [isLoading, setIsLoading] = useState(isWeb);
  const [user, setUser] = useState<StoredUser | null>(() => isWeb ? null : inMemoryUser);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const refreshServerSession = useCallback(async () => {
    if (!isWeb) return null;
    try {
      const response = await apiFetch("/api/auth/me");
      if (!response.ok) {
        setUser(null);
        setIsAuthenticated(false);
        return null;
      }
      const body = (await response.json()) as { user?: unknown };
      const activeUser = parseServerUser(body.user);
      if (!activeUser) {
        setUser(null);
        setIsAuthenticated(false);
        return null;
      }
      setUser(activeUser);
      setIsAuthenticated(true);
      return activeUser;
    } catch {
      setUser(null);
      setIsAuthenticated(false);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isWeb]);

  useEffect(() => {
    if (!isWeb) return;
    void refreshServerSession();
  }, [isWeb, refreshServerSession]);

  useEffect(() => {
    if (
      !isWeb ||
      !isAuthenticated ||
      !user?.sessionExpiresAt ||
      typeof document === "undefined"
    ) {
      return;
    }

    const expiresAt = Date.parse(user.sessionExpiresAt);
    const timer = window.setTimeout(
      () => void refreshServerSession(),
      Math.max(0, expiresAt - Date.now()),
    );
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible" && Date.now() >= expiresAt) {
        void refreshServerSession();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [isWeb, isAuthenticated, user?.sessionExpiresAt, refreshServerSession]);

  const register = useCallback(async (username: string, passphrase: string): Promise<{ error?: string; dnaKey?: DnaKey }> => {
    try {
      if (Platform.OS === "web") {
        const response = await apiFetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, passphrase }),
        });
        if (!response.ok) {
          return { error: await readApiError(response, "Registration failed. Please try again.") };
        }
        const body = (await response.json()) as { user?: unknown };
        const createdUser = parseServerUser(body.user);
        if (!createdUser) return { error: "The account response was incomplete. Please try again." };
        setUser(createdUser);
        setIsAuthenticated(true);
        setIsLoading(false);
        return {};
      }

      if (inMemoryUser) return { error: "An identity already exists in this session." };

      const credential = await createCredentialMaterial(passphrase);

      const newUser: StoredUser = {
        username: username.trim(),
        algorithm: credential.algorithm,
        iterations: credential.iterations,
        salt: credential.salt,
        hash: credential.hash,
        dnaKey: credential.dnaKey,
        createdAt: new Date().toISOString(),
      };

      inMemoryUser = newUser;
      setUser(newUser);
      setIsAuthenticated(true);
      return { dnaKey: credential.dnaKey };
    } catch (e) {
      return { error: "Registration failed. Please try again." };
    }
  }, []);

  const login = useCallback(async (username: string, passphrase: string): Promise<{ error?: string }> => {
    try {
      if (Platform.OS === "web") {
        const response = await apiFetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, passphrase }),
        });
        if (!response.ok) {
          return { error: await readApiError(response, "Login failed. Please try again.") };
        }
        const body = (await response.json()) as { user?: unknown };
        const activeUser = parseServerUser(body.user);
        if (!activeUser) return { error: "The account response was incomplete. Please try again." };
        setUser(activeUser);
        setIsAuthenticated(true);
        setIsLoading(false);
        return {};
      }

      const stored = inMemoryUser;
      if (!stored) return { error: "No identity exists in this session. Create one first." };

      // Username check (case-insensitive)
      if (stored.username.toLowerCase() !== username.toLowerCase()) {
        return { error: "Identity not recognised." };
      }

      if (
        stored.algorithm !== CREDENTIAL_KDF ||
        stored.iterations !== CREDENTIAL_KDF_ITERATIONS ||
        !stored.salt ||
        !stored.hash ||
        !stored.dnaKey
      ) {
        return { error: "This identity needs to be reset before it can be unlocked." };
      }

      const hash = await computeCredentialHash(passphrase, stored.salt);
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
    if (Platform.OS === "web") {
      const response = await apiFetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error("The server did not confirm sign out.");
      setUser(null);
      setIsAuthenticated(false);
      return;
    }
    setIsAuthenticated(false);
  }, []);

  const wipeAll = useCallback(async () => {
    if (Platform.OS === "web") {
      await logout();
      return;
    }
    inMemoryUser = null;
    setUser(null);
    setIsAuthenticated(false);
  }, [logout]);

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
