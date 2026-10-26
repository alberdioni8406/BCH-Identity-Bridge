/**
 * Deterministic canonical serialization for BCH Identity Bridge.
 */

import { CanonicalBinding, PROTOCOL_ID, PROTOCOL_VERSION } from "../../types/identity";

export function canonicalize(value: unknown): string {
  return JSON.stringify(sortKeys(value));
}

function sortKeys(value: unknown): unknown {
  if (value === null || typeof value !== "object") {
    if (typeof value === "number" && !Number.isFinite(value)) {
      throw new Error("Non-finite numbers are not allowed in canonical form");
    }
    return value;
  }
  if (Array.isArray(value)) {
    return value.map(sortKeys);
  }
  const obj = value as Record<string, unknown>;
  const sorted: Record<string, unknown> = {};
  for (const key of Object.keys(obj).sort()) {
    const v = obj[key];
    if (v !== undefined) {
      sorted[key] = sortKeys(v);
    }
  }
  return sorted;
}

export function buildBchSigningPayload(binding: CanonicalBinding): string {
  const domain = `${PROTOCOL_ID}/bch-proof/v${PROTOCOL_VERSION}`;
  const body = canonicalize({
    bindingId: binding.bindingId,
    bchAddress: binding.bch.address,
    bchNetwork: binding.bch.network,
    nostrPubkey: binding.nostr.pubkey,
    nonce: binding.nonce,
    purpose: binding.purpose,
    createdAt: binding.createdAt,
  });
  return `${domain}\n${body}`;
}

export function buildNostrEventContent(binding: CanonicalBinding): string {
  return canonicalize({
    protocol: PROTOCOL_ID,
    version: PROTOCOL_VERSION,
    bindingId: binding.bindingId,
    bch: binding.bch,
    purpose: binding.purpose,
    nonce: binding.nonce,
    createdAt: binding.createdAt,
  });
}

export async function computeBindingId(
  partial: Omit<CanonicalBinding, "bindingId" | "protocol" | "version">
): Promise<string> {
  const payload = canonicalize({
    protocol: PROTOCOL_ID,
    version: PROTOCOL_VERSION,
    ...partial,
  });
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const data = new TextEncoder().encode(payload);
    const hash = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
  const { createHash } = await import("crypto");
  return createHash("sha256").update(payload).digest("hex");
}

export function assertCanonicalBinding(obj: unknown): asserts obj is CanonicalBinding {
  if (!obj || typeof obj !== "object") throw new Error("Not an object");
  const b = obj as Record<string, unknown>;
  if (b.protocol !== PROTOCOL_ID) throw new Error("Wrong protocol");
  if (b.version !== PROTOCOL_VERSION) throw new Error("Unsupported version");
  if (typeof b.bindingId !== "string" || b.bindingId.length !== 64)
    throw new Error("Invalid bindingId");
  if (!b.bch || typeof b.bch !== "object") throw new Error("Missing bch");
  if (!b.nostr || typeof b.nostr !== "object") throw new Error("Missing nostr");
  if (typeof b.nonce !== "string" || b.nonce.length < 32) throw new Error("Invalid nonce");
  if (typeof b.createdAt !== "number") throw new Error("Invalid createdAt");
  if (typeof b.purpose !== "string") throw new Error("Invalid purpose");
}
