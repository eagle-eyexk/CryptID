import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type Sighting = {
  id: string;
  cryptidId: string;
  cryptidName: string;
  date: string;
  location: string;
  description: string;
  weather?: string;
  timeOfDay: "Dawn" | "Day" | "Dusk" | "Night";
  witnessCount: number;
  createdAt: string;
};

type SightingsContextType = {
  sightings: Sighting[];
  addSighting: (sighting: Omit<Sighting, "id" | "createdAt">) => Promise<void>;
  deleteSighting: (id: string) => Promise<void>;
  isLoading: boolean;
};

const SightingsContext = createContext<SightingsContextType | null>(null);

const STORAGE_KEY = "cryptid_sightings";

const DEFAULT_SIGHTINGS: Sighting[] = [
  {
    id: "s1",
    cryptidId: "bigfoot",
    cryptidName: "Bigfoot",
    date: "2025-11-12",
    location: "Olympic National Forest, WA",
    description:
      "Heard tree knocking deep in the forest around midnight. Smelled an overwhelming musky odor. Found a series of 18-inch footprints in the mud the next morning.",
    weather: "Overcast, light rain",
    timeOfDay: "Night",
    witnessCount: 2,
    createdAt: "2025-11-13T08:23:00Z",
  },
  {
    id: "s2",
    cryptidId: "mothman",
    cryptidName: "Mothman",
    date: "2025-12-01",
    location: "Charleston, West Virginia",
    description:
      "A massive winged figure circled the highway overpass three times before vanishing. Its red eyes were visible from 200 meters. My car radio cut out completely during the encounter.",
    weather: "Clear, cold",
    timeOfDay: "Dusk",
    witnessCount: 4,
    createdAt: "2025-12-02T14:11:00Z",
  },
  {
    id: "s3",
    cryptidId: "chupacabra",
    cryptidName: "Chupacabra",
    date: "2026-01-15",
    location: "Laredo, Texas",
    description:
      "Found three goats dead with circular puncture wounds on the neck. No blood anywhere on the ground. Cameras caught a hairless, dog-like creature moving at an unnatural speed.",
    weather: "Warm, dry",
    timeOfDay: "Night",
    witnessCount: 1,
    createdAt: "2026-01-16T09:45:00Z",
  },
  {
    id: "s4",
    cryptidId: "skinwalker",
    cryptidName: "Skinwalker",
    date: "2026-02-20",
    location: "Uintah County, Utah",
    description:
      "Heard my name called in my deceased father's voice coming from the treeline. When I shone my light there, I saw a large wolf-like creature standing upright. It did not run. It watched.",
    weather: "Freezing, clear",
    timeOfDay: "Night",
    witnessCount: 1,
    createdAt: "2026-02-21T06:00:00Z",
  },
];

export function SightingsProvider({ children }: { children: ReactNode }) {
  const [sightings, setSightings] = useState<Sighting[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          setSightings(JSON.parse(raw));
        } else {
          setSightings(DEFAULT_SIGHTINGS);
          await AsyncStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(DEFAULT_SIGHTINGS)
          );
        }
      } catch {
        setSightings(DEFAULT_SIGHTINGS);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const addSighting = useCallback(
    async (data: Omit<Sighting, "id" | "createdAt">) => {
      const newSighting: Sighting = {
        ...data,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
      };
      const updated = [newSighting, ...sightings];
      setSightings(updated);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    },
    [sightings]
  );

  const deleteSighting = useCallback(
    async (id: string) => {
      const updated = sightings.filter((s) => s.id !== id);
      setSightings(updated);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    },
    [sightings]
  );

  return (
    <SightingsContext.Provider
      value={{ sightings, addSighting, deleteSighting, isLoading }}
    >
      {children}
    </SightingsContext.Provider>
  );
}

export function useSightings() {
  const ctx = useContext(SightingsContext);
  if (!ctx) throw new Error("useSightings must be used within SightingsProvider");
  return ctx;
}
