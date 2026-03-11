import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const PIN_KEY = "cryptid_pin";
const DEFAULT_PIN = "1234";

type AuthContextType = {
  isLocked: boolean;
  isSetup: boolean;
  pin: string;
  unlock: (attempt: string) => boolean;
  lock: () => void;
  setPin: (newPin: string) => Promise<void>;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLocked, setIsLocked] = useState(true);
  const [pin, setStoredPin] = useState(DEFAULT_PIN);
  const [isSetup, setIsSetup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem(PIN_KEY);
        if (stored) {
          setStoredPin(stored);
          setIsSetup(true);
        } else {
          await AsyncStorage.setItem(PIN_KEY, DEFAULT_PIN);
          setIsSetup(true);
        }
      } catch {
        setIsSetup(true);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const unlock = (attempt: string): boolean => {
    if (attempt === pin) {
      setIsLocked(false);
      return true;
    }
    return false;
  };

  const lock = () => setIsLocked(true);

  const setPin = async (newPin: string) => {
    await AsyncStorage.setItem(PIN_KEY, newPin);
    setStoredPin(newPin);
  };

  return (
    <AuthContext.Provider
      value={{ isLocked, isSetup, pin, unlock, lock, setPin, isLoading }}
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
