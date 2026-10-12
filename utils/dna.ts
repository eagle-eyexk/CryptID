import * as Crypto from "expo-crypto";
import { pbkdf2Async } from "@noble/hashes/pbkdf2.js";
import { sha256 } from "@noble/hashes/sha2.js";

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

export const CREDENTIAL_KDF = "PBKDF2-HMAC-SHA256" as const;
export const CREDENTIAL_KDF_ITERATIONS = 600_000;
const CREDENTIAL_SALT_BYTES = 16;

export type CredentialMaterial = {
  algorithm: typeof CREDENTIAL_KDF;
  iterations: typeof CREDENTIAL_KDF_ITERATIONS;
  salt: string;
  hash: string;
  dnaKey: DnaKey;
};

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function hexToSalt(hex: string): Uint8Array {
  if (!/^[\da-f]{32}$/i.test(hex)) {
    throw new Error("Invalid credential salt.");
  }

  const salt = new Uint8Array(CREDENTIAL_SALT_BYTES);
  for (let i = 0; i < salt.length; i++) {
    salt[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return salt;
}

async function deriveCredentialHash(passphrase: string, salt: Uint8Array): Promise<string> {
  const derivedKey = await pbkdf2Async(sha256, passphrase, salt, {
    c: CREDENTIAL_KDF_ITERATIONS,
    dkLen: 32,
    asyncTick: 8,
  });
  return bytesToHex(derivedKey);
}

export async function createCredentialMaterial(passphrase: string): Promise<CredentialMaterial> {
  const salt = await Crypto.getRandomBytesAsync(CREDENTIAL_SALT_BYTES);
  const hash = await deriveCredentialHash(passphrase, salt);
  return {
    algorithm: CREDENTIAL_KDF,
    iterations: CREDENTIAL_KDF_ITERATIONS,
    salt: bytesToHex(salt),
    hash,
    dnaKey: hashToDnaKey(hash),
  };
}

export async function computeCredentialHash(passphrase: string, saltHex: string): Promise<string> {
  return deriveCredentialHash(passphrase, hexToSalt(saltHex));
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

// ─── Default DNA (shown before login) ────────────────────────────────────────

export const DEFAULT_DNA_COLORS: [string, string][] = SUMMER_DNA_COLORS;
