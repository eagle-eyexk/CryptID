const Colors = {
  background: "#071716",
  surface: "#0D211F",
  surfaceElevated: "#122C29",
  surfaceHigh: "#193A35",
  border: "#28504A",
  borderLight: "#1A3934",

  // Primary – cyan / teal (summer)
  primary: "#67E1D2",
  primaryDim: "#40BDAE",
  primaryGlow: "rgba(103, 225, 210, 0.14)",
  primaryFaint: "rgba(103, 225, 210, 0.07)",

  // Accent – coral (summer)
  accent: "#FF897C",
  accentGlow: "rgba(255, 137, 124, 0.14)",

  // Success / DNA
  green: "#71DFA2",
  greenGlow: "rgba(113, 223, 162, 0.14)",

  // Warnings / burn
  danger: "#FF756B",
  dangerGlow: "rgba(255, 117, 107, 0.12)",

  warning: "#FFE66D",

  // Chat bubbles
  sent: "#17463F",
  sentBorder: "#31786B",
  received: "#122521",
  receivedBorder: "#28504A",

  // Text
  textPrimary: "#E9F5EF",
  textSecondary: "#B0C9BE",
  textMuted: "#8BA79A",

  tabIconDefault: "#8BA79A",
  tint: "#67E1D2",

  overlay: "rgba(7, 23, 22, 0.94)",

  // DNA summer palette
  dna: [
    ["#FF897C", "#FF9A63"],
    ["#67E1D2", "#37C6B7"],
    ["#FFE18A", "#FFA826"],
    ["#A8E6CF", "#71DFA2"],
    ["#FF9A9D", "#FF687F"],
    ["#C3B1E1", "#9370DB"],
    ["#85E89D", "#4D96FF"],
    ["#FFAAA5", "#FF91A4"],
  ] as [string, string][],

  // Legacy compat
  light: {
    text: "#E9F5EF",
    background: "#071716",
    tint: "#67E1D2",
    tabIconDefault: "#8BA79A",
    tabIconSelected: "#67E1D2",
  },
};

export default Colors;
