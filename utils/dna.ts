import * as Crypto from "expo-crypto";

// ─── Summer DNA Color Palette ─────────────────────────────────────────────────
// 8 pairs [leftStrand, rightStrand] — bright summer colors on dark backgrounds

export const SUMMER_DNA_COLORS: [string, string][] = [
  ["#FF6B6B", "#FF8E53"], // Coral / Orange
  ["#4ECDC4", "#26D0CE"], // Cyan / Teal
  ["#FFE66D", "#FFA826"], // Yellow / Amber
  ["#A8E6CF", "#56CF90"], // Mint / Emerald
  ["#FF8B94", "#FF5E7D"], // Rose / Hot Pink
  ["#C3B1E1", "#9370DB"], // Lavender / Purple
  ["#85E89D", "#4D96FF"], // Lime / Blue
  ["#FFAAA5", "#FF91A4"], // Peach / Blush
];

export type DnaKey = {
  colorPairs: [string, string][];
  bases: string[];       // A, T, G, C sequence (visual label)
  fingerprint: string;   // short readable hash fragment
};

// ─── Generate DNA key from credentials ───────────────────────────────────────

export async function computeCredentialHash(username: string, passphrase: string): Promise<string> {
  const payload = `${username.toLowerCase()}||${passphrase}||cryptid_v1`;
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, payload);
}

export function hashToDnaKey(hashHex: string): DnaKey {
  const colorPairs: [string, string][] = [];
  const bases: string[] = [];
  const BASE_LABELS = ["A", "T", "G", "C"];

  for (let i = 0; i < 8; i++) {
    const byte1 = parseInt(hashHex.substring(i * 4, i * 4 + 2), 16);
    const byte2 = parseInt(hashHex.substring(i * 4 + 2, i * 4 + 4), 16);

    // Deterministic but varied: xor bytes with position to spread colours
    const idx1 = (byte1 ^ (i * 37)) % SUMMER_DNA_COLORS.length;
    const idx2 = (byte2 ^ (i * 73)) % SUMMER_DNA_COLORS.length;

    colorPairs.push([SUMMER_DNA_COLORS[idx1][0], SUMMER_DNA_COLORS[idx2][1]]);

    const b1 = BASE_LABELS[byte1 % 4];
    const b2 = BASE_LABELS[byte2 % 4];
    bases.push(`${b1}${b2}`);
  }

  return {
    colorPairs,
    bases,
    fingerprint: hashHex.slice(0, 12).toUpperCase().match(/.{4}/g)?.join("-") ?? hashHex.slice(0, 12),
  };
}

export async function generateDnaKey(username: string, passphrase: string): Promise<DnaKey> {
  const hash = await computeCredentialHash(username, passphrase);
  return hashToDnaKey(hash);
}

// ─── Default DNA (shown before login) ────────────────────────────────────────

export const DEFAULT_DNA_COLORS: [string, string][] = SUMMER_DNA_COLORS;
