/**
 * Binding creation and management
 */

import {
  CanonicalBinding,
  IdentityBinding,
  BchProof,
  NostrProof,
  PROTOCOL_ID,
  PROTOCOL_VERSION,
  BchNetwork,
} from "../../types/identity";
import {
  computeBindingId,
  buildBchSigningPayload,
  buildNostrEventContent,
  assertCanonicalBinding,
  canonicalize,
} from "./canonicalize";

/** Generate a cryptographically secure 32-byte hex nonce */
export function generateNonce(): string {
  const bytes = new Uint8Array(32);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    // Node fallback
    const { randomBytes } = require("crypto");
    const buf = randomBytes(32);
    for (let i = 0; i < 32; i++) bytes[i] = buf[i];
  }
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export interface CreateBindingParams {
  bchAddress: string;
  bchNetwork: BchNetwork;
  nostrPubkey: string; // hex
  purpose?: string;
  expiresAt?: number;
}

/**
 * Create a new canonical binding record (unsigned).
 * Caller must then obtain BCH and Nostr signatures over the derived payloads.
 */
export async function createCanonicalBinding(
  params: CreateBindingParams
): Promise<CanonicalBinding> {
  const nonce = generateNonce();
  const createdAt = Math.floor(Date.now() / 1000);

  const partial = {
    bch: {
      network: params.bchNetwork,
      address: params.bchAddress,
    },
    nostr: {
      pubkey: params.nostrPubkey.toLowerCase().replace(/^0x/, ""),
    },
    createdAt,
    expiresAt: params.expiresAt,
    purpose: params.purpose || "identity-binding-v1",
    nonce,
  };

  const bindingId = await computeBindingId(partial);

  const binding: CanonicalBinding = {
    protocol: PROTOCOL_ID,
    version: PROTOCOL_VERSION,
    bindingId,
    ...partial,
  };

  assertCanonicalBinding(binding);
  return binding;
}

/**
 * Get the exact message a BCH wallet must sign for this binding.
 */
export function getBchSigningMessage(binding: CanonicalBinding): string {
  return buildBchSigningPayload(binding);
}

/**
 * Get the content and recommended tags for the Nostr binding event.
 */
export function getNostrEventTemplate(binding: CanonicalBinding) {
  return {
    kind: 31234,
    content: buildNostrEventContent(binding),
    tags: [
      ["d", binding.bindingId],
      ["bch", binding.bch.address, binding.bch.network],
      ["protocol", PROTOCOL_ID, PROTOCOL_VERSION],
      ["nonce", binding.nonce],
    ],
  };
}

/**
 * Assemble a full IdentityBinding once both proofs are available.
 */
export function assembleBinding(
  binding: CanonicalBinding,
  bchProof: BchProof,
  nostrProof: NostrProof
): IdentityBinding {
  return {
    binding,
    bchProof,
    nostrProof,
  };
}

/**
 * Export a binding as a portable JSON string (canonical).
 */
export function exportBinding(ib: IdentityBinding): string {
  return canonicalize(ib);
}

/**
 * Import and basic-parse a binding record.
 */
export function importBinding(json: string): IdentityBinding {
  const parsed = JSON.parse(json);
  if (!parsed.binding || !parsed.bchProof || !parsed.nostrProof) {
    throw new Error("Malformed binding record");
  }
  assertCanonicalBinding(parsed.binding);
  return parsed as IdentityBinding;
}
