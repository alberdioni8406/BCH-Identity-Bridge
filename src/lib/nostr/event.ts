/**
 * Nostr event helpers and verification for binding proofs.
 */

import type { NostrProof, CanonicalBinding } from "../../types/identity";
import { getNostrEventTemplate } from "../identity/binding";

export const BINDING_KIND = 31234;
export const REVOCATION_KIND = 31235;

/**
 * Validate structural correctness of a Nostr binding event
 * (tags, kind, pubkey match) without cryptographic verification.
 */
export function validateNostrBindingEventStructure(
  event: NostrProof["event"],
  expectedBinding: CanonicalBinding
): { ok: boolean; errors: string[] } {
  const errors: string[] = [];

  if (event.kind !== BINDING_KIND) {
    errors.push(`Expected kind ${BINDING_KIND}, got ${event.kind}`);
  }

  if (
    !event.pubkey ||
    event.pubkey.toLowerCase() !== expectedBinding.nostr.pubkey.toLowerCase()
  ) {
    errors.push("Event pubkey does not match binding Nostr pubkey");
  }

  const dTag = event.tags?.find((t) => t[0] === "d");
  if (!dTag || dTag[1] !== expectedBinding.bindingId) {
    errors.push("Missing or mismatched d-tag (bindingId)");
  }

  const bchTag = event.tags?.find((t) => t[0] === "bch");
  if (!bchTag || bchTag[1] !== expectedBinding.bch.address) {
    errors.push("Missing or mismatched bch tag");
  }

  const protocolTag = event.tags?.find((t) => t[0] === "protocol");
  if (!protocolTag || protocolTag[1] !== "bch-identity-bridge") {
    errors.push("Missing or incorrect protocol tag");
  }

  if (!event.id || event.id.length !== 64) {
    errors.push("Invalid or missing event id");
  }

  if (!event.sig || event.sig.length < 128) {
    errors.push("Invalid or missing signature");
  }

  return { ok: errors.length === 0, errors };
}

/**
 * Cryptographically verify a Nostr event signature using nostr-tools when available.
 */
export async function verifyNostrEventSignature(
  event: NostrProof["event"]
): Promise<{ valid: boolean; error?: string }> {
  try {
    const nostrTools = await import("nostr-tools");
    // nostr-tools v2 exposes verifyEvent
    const valid = nostrTools.verifyEvent(event as any);
    return valid
      ? { valid: true }
      : { valid: false, error: "Event signature verification failed" };
  } catch (e: any) {
    // Library missing or other error
    if (e?.code === "MODULE_NOT_FOUND" || /Cannot find module/.test(String(e))) {
      return {
        valid: false,
        error:
          "nostr-tools is not installed. Run `npm install nostr-tools` " +
          "to enable full Nostr event signature verification.",
      };
    }
    return {
      valid: false,
      error: `Nostr verification error: ${e?.message || String(e)}`,
    };
  }
}

/**
 * Create the unsigned event template that a NIP-07 signer (or other) should sign.
 */
export function createUnsignedBindingEvent(binding: CanonicalBinding) {
  const tmpl = getNostrEventTemplate(binding);
  return {
    kind: tmpl.kind,
    created_at: Math.floor(Date.now() / 1000),
    tags: tmpl.tags,
    content: tmpl.content,
  };
}

/**
 * Detect NIP-07 provider in the browser.
 */
export function getNip07(): any | null {
  if (typeof window === "undefined") return null;
  return (window as any).nostr || null;
}
