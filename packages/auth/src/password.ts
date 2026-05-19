/**
 * Password hashing with Argon2id.
 *
 * Defaults are tuned for ~50ms on a modern server core. Adjust the cost
 * parameters if measured timing drifts on production hardware.
 */
import { hash, verify } from '@node-rs/argon2';

const argonOptions = {
  // OWASP 2024 recommended baseline for Argon2id.
  memoryCost: 19_456, // 19 MiB
  timeCost: 2,
  parallelism: 1,
  outputLen: 32,
} as const;

export async function hashPassword(plain: string): Promise<string> {
  return hash(plain, argonOptions);
}

export async function verifyPassword(plain: string, encoded: string): Promise<boolean> {
  try {
    return await verify(encoded, plain, argonOptions);
  } catch {
    return false;
  }
}
