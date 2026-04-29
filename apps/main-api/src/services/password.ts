import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

const SCRYPT_KEY_LEN = 64;
const SCRYPT_COST = 16384;
const SCRYPT_BLOCK_SIZE = 8;
const SCRYPT_PARALLELIZATION = 1;

function derive(password: string, salt: Buffer): Buffer {
  return scryptSync(password, salt, SCRYPT_KEY_LEN, {
    N: SCRYPT_COST,
    r: SCRYPT_BLOCK_SIZE,
    p: SCRYPT_PARALLELIZATION
  });
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const derived = derive(password, salt);
  return `scrypt$${SCRYPT_COST}$${SCRYPT_BLOCK_SIZE}$${SCRYPT_PARALLELIZATION}$${salt.toString("hex")}$${derived.toString("hex")}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") {
    return false;
  }

  const [, rawN, rawR, rawP, saltHex, digestHex] = parts;
  const salt = Buffer.from(saltHex, "hex");
  const digest = Buffer.from(digestHex, "hex");

  const derived = scryptSync(password, salt, digest.length, {
    N: Number(rawN),
    r: Number(rawR),
    p: Number(rawP)
  });

  return timingSafeEqual(derived, digest);
}

