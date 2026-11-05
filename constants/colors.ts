const Colors = {
  background: "#F4F0E8",
  surface: "#FBF9F4",
  surfaceElevated: "#E9E3D8",
  surfaceHigh: "#E4ECE5",
  border: "#D8D2C6",
  borderLight: "#E8E2D8",

  // Forest green with warm paper surfaces.
  primary: "#28544A",
  primaryDim: "#1F433B",
  primaryGlow: "rgba(40, 84, 74, 0.12)",
  primaryFaint: "rgba(40, 84, 74, 0.07)",

  // Terracotta accent.
  accent: "#B85842",
  accentGlow: "rgba(184, 88, 66, 0.12)",

  // Status colors.
  green: "#648771",
  greenGlow: "rgba(100, 135, 113, 0.14)",

  // Warnings / burn
  danger: "#AF533F",
  dangerGlow: "rgba(175, 83, 63, 0.12)",

  warning: "#A77A3E",

  // Chat bubbles
  sent: "#28544A",
  sentBorder: "#315C50",
  received: "#FBF9F4",
  receivedBorder: "#D8D2C6",

  // Text
  textPrimary: "#252A28",
  textSecondary: "#565D57",
  textMuted: "#80857E",

  tabIconDefault: "#8BA79A",
  tint: "#28544A",

  overlay: "rgba(37, 42, 40, 0.82)",

  // Legacy visual palette for the native identity preview.
  dna: [
    ["#B85842", "#D47B5F"],
    ["#28544A", "#4B8069"],
    ["#C49A5A", "#D8B779"],
    ["#648771", "#92AA91"],
    ["#A64D44", "#C47A65"],
    ["#7B7262", "#A89B86"],
    ["#477B75", "#77A79B"],
    ["#B77962", "#D19B7D"],
  ] as [string, string][],

  // Legacy compat
  light: {
    text: "#252A28",
    background: "#F4F0E8",
    tint: "#28544A",
    tabIconDefault: "#80857E",
    tabIconSelected: "#28544A",
  },
};

export default Colors;
