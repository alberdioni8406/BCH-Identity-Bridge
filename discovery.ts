/**
 * Nostr relay discovery and publication helpers.
 * Relays are untrusted — every event is re-verified locally after fetch.
 */

import { BINDING_KIND } from "./event";
import type { IdentityBinding } from "../../types/identity";

const DEFAULT_RELAYS = [
  "wss://relay.damus.io",
  "wss://nos.lol",
  "wss://relay.nostr.band",
];

export function getDefaultRelays(): string[] {
  return [...DEFAULT_RELAYS];
}

/**
 * Publish a binding event to one or more relays.
 * Returns per-relay success/failure. Does not treat any relay as authoritative.
 */
export async function publishBindingEvent(
  event: IdentityBinding["nostrProof"]["event"],
  relays: string[] = DEFAULT_RELAYS
): Promise<{ relay: string; ok: boolean; error?: string }[]> {
  const results: { relay: string; ok: boolean; error?: string }[] = [];

  let SimplePool: any;
  try {
    const nt = await import("nostr-tools");
    SimplePool = nt.SimplePool;
  } catch {
    return relays.map((r) => ({
      relay: r,
      ok: false,
      error: "nostr-tools not installed",
    }));
  }

  const pool = new SimplePool();
  try {
    for (const url of relays) {
      try {
        await pool.publish([url], event);
        results.push({ relay: url, ok: true });
      } catch (e: any) {
        results.push({
          relay: url,
          ok: false,
          error: e?.message || String(e),
        });
      }
    }
  } finally {
    pool.close(relays);
  }
  return results;
}

/**
 * Query relays for binding events by Nostr pubkey or by bindingId (d-tag).
 */
export async function fetchBindings(params: {
  pubkey?: string;
  bindingId?: string;
  relays?: string[];
  timeoutMs?: number;
}): Promise<any[]> {
  const relays = params.relays || DEFAULT_RELAYS;
  let SimplePool: any;
  try {
    const nt = await import("nostr-tools");
    SimplePool = nt.SimplePool;
  } catch {
    return [];
  }

  const filter: any = { kinds: [BINDING_KIND], limit: 20 };
  if (params.pubkey) filter.authors = [params.pubkey];
  if (params.bindingId) filter["#d"] = [params.bindingId];

  const pool = new SimplePool();
  try {
    const events = await pool.querySync(relays, filter);
    return events || [];
  } catch {
    return [];
  } finally {
    pool.close(relays);
  }
}
