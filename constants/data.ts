export type Cryptid = {
  id: string;
  name: string;
  nickname?: string;
  region: string;
  firstSighted: string;
  category: "Humanoid" | "Aquatic" | "Aerial" | "Feline" | "Canine" | "Reptilian" | "Unknown";
  dangerLevel: 1 | 2 | 3 | 4 | 5;
  description: string;
  abilities: string[];
  evidence: string;
  color: string;
  icon: string;
};

export const CRYPTIDS: Cryptid[] = [
  {
    id: "bigfoot",
    name: "Bigfoot",
    nickname: "Sasquatch",
    region: "Pacific Northwest, USA",
    firstSighted: "1958",
    category: "Humanoid",
    dangerLevel: 2,
    description:
      "A large, bipedal primate-like creature covered in dark hair, standing 7–10 feet tall. Witnesses describe an ape-like face with a broad, flat nose. Bigfoot is known for leaving enormous footprints — up to 24 inches long — and emitting a powerful, musky odor. Thousands of encounters have been reported across North American forests.",
    abilities: [
      "Extreme stealth in dense forest",
      "Superhuman strength",
      "Infrasound communication",
      "Tree-knocking behavior",
    ],
    evidence:
      "Over 10,000 reported sightings. The Patterson-Gimlin film from 1967 remains the most debated video evidence. Numerous plaster casts of oversized footprints exist in university collections.",
    color: "#8B6914",
    icon: "🦶",
  },
  {
    id: "mothman",
    name: "Mothman",
    nickname: "The Harbinger",
    region: "Point Pleasant, West Virginia",
    firstSighted: "1966",
    category: "Aerial",
    dangerLevel: 4,
    description:
      "A winged humanoid entity standing over 6 feet tall with massive bat-like wings and glowing red eyes. Unlike other cryptids, Mothman sightings often precede major disasters. The creature appeared repeatedly in Point Pleasant before the Silver Bridge collapse in 1967, which killed 46 people. Sightings have since been reported near other catastrophes worldwide.",
    abilities: [
      "Supersonic flight",
      "Prophetic presence",
      "Hypnotic red eyes",
      "Electromagnetic interference",
    ],
    evidence:
      "Over 100 witnesses during the 1966–67 Point Pleasant wave. Radar anomalies recorded. More recent sightings reported in Chicago (2017) and globally near disaster sites.",
    color: "#4A1A6B",
    icon: "🦇",
  },
  {
    id: "lochness",
    name: "Loch Ness Monster",
    nickname: "Nessie",
    region: "Scottish Highlands, Scotland",
    firstSighted: "565 AD",
    category: "Aquatic",
    dangerLevel: 2,
    description:
      "A large aquatic creature inhabiting the deep waters of Loch Ness, Scotland. Described as having a long neck, small head, and massive body with flippers, resembling a plesiosaur. The loch's dark, peaty water makes visibility near zero, allowing Nessie to evade detection despite its reported massive size of 20–30 feet.",
    abilities: [
      "Deep-water submersion",
      "Exceptional camouflage",
      "Extraordinary speed",
      "Thermal concealment",
    ],
    evidence:
      "The 1934 'Surgeon's Photograph' remains iconic. Sonar contacts have detected large unexplained objects. DNA analysis of loch water (2018) found unusual genetic signatures.",
    color: "#1A4A6B",
    icon: "🌊",
  },
  {
    id: "chupacabra",
    name: "Chupacabra",
    nickname: "Goat Sucker",
    region: "Puerto Rico, Latin America, Southwest USA",
    firstSighted: "1995",
    category: "Canine",
    dangerLevel: 3,
    description:
      "A predatory creature that drains the blood of livestock, leaving victims with puncture wounds and completely exsanguinated. Two distinct forms have been reported: a bipedal, reptilian form with spines running along its back, and a hairless, canine-like creature with leathery skin. Both forms share the characteristic of feeding exclusively on blood.",
    abilities: [
      "Silent, rapid movement",
      "Bloodsucking fangs",
      "Extreme nocturnal agility",
      "Pack hunting (rare)",
    ],
    evidence:
      "Hundreds of livestock deaths across Puerto Rico in 1995. Hair and tissue samples collected but remain inconclusive. Hairless canines captured in Texas tested as coyote-hybrid with mange.",
    color: "#6B1A1A",
    icon: "🩸",
  },
  {
    id: "jersey-devil",
    name: "Jersey Devil",
    nickname: "The Leeds Devil",
    region: "Pine Barrens, New Jersey",
    firstSighted: "1735",
    category: "Aerial",
    dangerLevel: 3,
    description:
      "A terrifying creature with the head of a horse, the body of a kangaroo, bat wings, cloven hooves, and a forked tail. It emits a blood-curdling scream that can be heard for miles. The Pine Barrens — 1.1 million acres of dense, swampy forest — provide ample hiding ground. Sightings spike during harsh winters when prey is scarce.",
    abilities: [
      "Eerie, paralyzing scream",
      "Flight at high speeds",
      "Destruction of property",
      "Electromagnetic disruption",
    ],
    evidence:
      "Reported since colonial times. The 1909 mass sightings over several days included hundreds of witnesses across New Jersey and Delaware. Cloven hoof prints discovered in snow.",
    color: "#2A4A1A",
    icon: "👹",
  },
  {
    id: "wendigo",
    name: "Wendigo",
    nickname: "The Cannibal Spirit",
    region: "Great Lakes, Northern Canada",
    firstSighted: "Pre-colonial",
    category: "Humanoid",
    dangerLevel: 5,
    description:
      "A malevolent supernatural entity from Algonquian folklore — a giant, gaunt humanoid with an emaciated frame, rotting skin stretched tight over bones, and a perpetual hunger that can never be satisfied. The Wendigo is associated with winter, famine, and cannibalism. It is said to possess humans driven to eat human flesh, transforming them into Wendigo themselves.",
    abilities: [
      "Possession of humans",
      "Shapeshifting",
      "Superhuman speed",
      "Psychic terror induction",
      "Immortality",
    ],
    evidence:
      "Deep roots in Algonquian, Ojibwe, and Cree traditions spanning centuries. Wendigo psychosis (clinical term) recognized in medical literature. Reports of extremely tall, thin figures persist in remote Canadian wilderness.",
    color: "#1A2A3A",
    icon: "❄️",
  },
  {
    id: "thunderbird",
    name: "Thunderbird",
    nickname: "Sky Behemoth",
    region: "Great Plains, Alaska, Mexico",
    firstSighted: "Pre-colonial",
    category: "Aerial",
    dangerLevel: 3,
    description:
      "A massive bird of legendary proportions, reportedly with a wingspan of 15–36 feet. Native American traditions describe the Thunderbird as a supernatural being that causes thunder with its wings. Modern witnesses have reported seeing pterodactyl-like birds capable of lifting livestock and, in extreme cases, humans. Sightings cluster in remote mountain and plains regions.",
    abilities: [
      "Immense wingspan and lift power",
      "Storm generation",
      "Lightning projection (historical accounts)",
      "Altitude mastery",
    ],
    evidence:
      "Pictographs across the Americas. A 1977 Illinois incident involved three witnesses who saw a bird with a 10-foot wingspan attempt to carry a child. Fossil evidence of Argentavis (largest known flying bird) confirms giant birds existed.",
    color: "#4A3A1A",
    icon: "⚡",
  },
  {
    id: "skinwalker",
    name: "Skinwalker",
    nickname: "Yee Naaldlooshii",
    region: "Four Corners, American Southwest",
    firstSighted: "Pre-colonial",
    category: "Unknown",
    dangerLevel: 5,
    description:
      "Among the most feared entities in Navajo tradition — a witch who has gained the power to transform into any animal or human. Skinwalkers wear the skin of their animal form to transform. They are fast, possess supernatural strength, and can mimic human voices to lure victims. Skinwalker Ranch in Utah has become a global hotspot for unexplained phenomena.",
    abilities: [
      "Perfect shapeshifting",
      "Voice mimicry",
      "Supernatural speed",
      "Illness projection",
      "Telekinesis",
    ],
    evidence:
      "Deeply embedded in Navajo oral history. Skinwalker Ranch documented by NIDS and later the Secret of Skinwalker Ranch TV series — numerous unexplained UAP, cattle mutilation, and physical phenomena recorded.",
    color: "#2A1A3A",
    icon: "🐺",
  },
];

export type SightingCategory = Cryptid["category"];

export const CATEGORY_COLORS: Record<SightingCategory, string> = {
  Humanoid: "#8B6914",
  Aquatic: "#1A4A6B",
  Aerial: "#4A1A6B",
  Feline: "#6B4A1A",
  Canine: "#6B1A1A",
  Reptilian: "#1A6B1A",
  Unknown: "#2A1A3A",
};

export const DANGER_LABELS: Record<number, string> = {
  1: "Minimal",
  2: "Low",
  3: "Moderate",
  4: "High",
  5: "Extreme",
};

export const DANGER_COLORS: Record<number, string> = {
  1: "#4ADE80",
  2: "#A3E635",
  3: "#FBBF24",
  4: "#F97316",
  5: "#F87171",
};
