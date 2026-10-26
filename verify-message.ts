/**
 * BCH signed-message verification.
 *
 * Primary path: bitcoinjs-message (standard Bitcoin message format that BCH wallets use).
 * The classic prefix is "\x18Bitcoin Signed Message:\n".
 *
 * This module is written so the rest of the app never depends on the library
 * being present at import time — it is loaded dynamically.
 */

import type { BchNetwork } from "../../types/identity";

export interface VerifyBchMessageParams {
  message: string;
  address: string;
  signature: string; // base64
  network: BchNetwork;
}

export interface BchVerifyResult {
  valid: boolean;
  recoveredAddress?: string;
  error?: string;
}

let _bitcoinMessage: typeof import("bitcoinjs-message") | null = null;

async function loadBitcoinMessage() {
  if (_bitcoinMessage) return _bitcoinMessage;
  try {
    _bitcoinMessage = await import("bitcoinjs-message");
    return _bitcoinMessage;
  } catch {
    return null;
  }
}

/**
 * Verify a BCH signed message against the claimed address.
 */
export async function verifyBchSignedMessage(
  params: VerifyBchMessageParams
): Promise<BchVerifyResult> {
  const { message, address, signature } = params;

  if (!message || !address || !signature) {
    return { valid: false, error: "Missing required fields (message, address, or signature)" };
  }

  if (signature.length < 60) {
    return { valid: false, error: "Signature too short to be a valid base64 ECDSA signature" };
  }

  // Basic base64 sanity
  try {
    if (typeof Buffer !== "undefined") {
      Buffer.from(signature, "base64");
    } else if (typeof atob !== "undefined") {
      atob(signature);
    }
  } catch {
    return { valid: false, error: "Signature is not valid base64" };
  }

  const lib = await loadBitcoinMessage();
  if (!lib) {
    return {
      valid: false,
      error:
        "bitcoinjs-message is not installed. Run `npm install bitcoinjs-message` " +
        "to enable full BCH signature verification.",
    };
  }

  try {
    // bitcoinjs-message.verify returns boolean.
    // It handles the standard Bitcoin message prefix used by Electron Cash,
    // mainnet.cash, and most BCH wallets.
    const valid = lib.verify(message, address, signature);
    return valid
      ? { valid: true }
      : { valid: false, error: "Signature does not match the provided address and message" };
  } catch (e: any) {
    return {
      valid: false,
      error: `Verification error: ${e?.message || String(e)}`,
    };
  }
}

/**
 * Convenience for wallet UI: return the exact string the user must sign.
 */
export function prepareBchMessageForWallet(message: string): string {
  return message;
}
