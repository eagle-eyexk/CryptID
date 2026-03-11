const Colors = {
  background: "#07090F",
  surface: "#0E1220",
  surfaceElevated: "#141A2E",
  surfaceHigh: "#1C2440",
  border: "#1E2A40",
  borderLight: "#131C30",

  // Primary – cyan / teal (summer)
  primary: "#4ECDC4",
  primaryDim: "#35B5AC",
  primaryGlow: "rgba(78, 205, 196, 0.14)",
  primaryFaint: "rgba(78, 205, 196, 0.07)",

  // Accent – coral (summer)
  accent: "#FF6B6B",
  accentGlow: "rgba(255, 107, 107, 0.14)",

  // Success / DNA
  green: "#56CF90",
  greenGlow: "rgba(86, 207, 144, 0.14)",

  // Warnings / burn
  danger: "#FF4560",
  dangerGlow: "rgba(255, 69, 96, 0.12)",

  warning: "#FFE66D",

  // Chat bubbles
  sent: "#0D2E4A",
  sentBorder: "#0F4A72",
  received: "#131926",
  receivedBorder: "#1E2A40",

  // Text
  textPrimary: "#EEF2FF",
  textSecondary: "#7A8AAA",
  textMuted: "#374060",

  tabIconDefault: "#374060",
  tint: "#4ECDC4",

  overlay: "rgba(7, 9, 15, 0.92)",

  // DNA summer palette
  dna: [
    ["#FF6B6B", "#FF8E53"],
    ["#4ECDC4", "#26D0CE"],
    ["#FFE66D", "#FFA826"],
    ["#A8E6CF", "#56CF90"],
    ["#FF8B94", "#FF5E7D"],
    ["#C3B1E1", "#9370DB"],
    ["#85E89D", "#4D96FF"],
    ["#FFAAA5", "#FF91A4"],
  ] as [string, string][],

  // Legacy compat
  light: {
    text: "#EEF2FF",
    background: "#07090F",
    tint: "#4ECDC4",
    tabIconDefault: "#374060",
    tabIconSelected: "#4ECDC4",
  },
};

export default Colors;
