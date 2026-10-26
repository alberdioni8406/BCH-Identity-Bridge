"use client";

import { useState } from "react";
import { fetchBindings, getDefaultRelays } from "@/lib/nostr/discovery";
import { verifyBinding } from "@/lib/identity/verify";

export default function DiscoverPage() {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"pubkey" | "bindingId">("pubkey");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState("");

  async function search() {
    setLoading(true);
    setError("");
    setResults([]);
    try {
      const events = await fetchBindings({
        pubkey: mode === "pubkey" ? query.trim() : undefined,
        bindingId: mode === "bindingId" ? query.trim() : undefined,
        relays: getDefaultRelays(),
      });
      // Locally verify each
      const enriched = [];
      for (const ev of events) {
        // We only have the Nostr event here; full binding verification needs the BCH proof
        // which is inside the event content in our protocol. For discovery we show the event
        // and note that full dual-proof verification happens when the full record is exported.
        enriched.push({
          event: ev,
          note: "Nostr event retrieved. Full dual-proof verification requires the complete binding record (including BCH signature).",
        });
      }
      setResults(enriched);
      if (enriched.length === 0) {
        setError(
          "No events found (or nostr-tools / relays unavailable). " +
            "Ensure dependencies are installed and relays are reachable."
        );
      }
    } catch (e: any) {
      setError(e.message || "Discovery failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-2 text-3xl font-bold">Discover</h1>
      <p className="mb-8 text-slate-400">
        Retrieve published identity bindings from Nostr relays. Every record is
        treated as untrusted until verified locally.
      </p>

      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setMode("pubkey")}
          className={`rounded-md px-3 py-1.5 text-sm ${
            mode === "pubkey" ? "bg-bch/20 text-bch" : "text-slate-400"
          }`}
        >
          By Nostr pubkey
        </button>
        <button
          onClick={() => setMode("bindingId")}
          className={`rounded-md px-3 py-1.5 text-sm ${
            mode === "bindingId" ? "bg-bch/20 text-bch" : "text-slate-400"
          }`}
        >
          By Binding ID
        </button>
      </div>

      <div className="mb-4 flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={
            mode === "pubkey" ? "64-char hex pubkey" : "64-char binding ID"
          }
          className="flex-1 rounded-lg border border-surface-elevated bg-surface-card px-4 py-2.5 font-mono text-sm focus:border-bch focus:outline-none"
        />
        <button
          onClick={search}
          disabled={loading || !query.trim()}
          className="rounded-lg bg-bch px-5 py-2.5 font-medium text-surface hover:bg-bch-400 disabled:opacity-40"
        >
          {loading ? "Searching…" : "Search"}
        </button>
      </div>

      <p className="mb-6 text-xs text-slate-500">
        Default relays: {getDefaultRelays().join(", ")}
      </p>

      {error && (
        <div className="mb-6 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {results.map((r, i) => (
          <div
            key={i}
            className="rounded-xl border border-surface-elevated bg-surface-card p-4"
          >
            <div className="mb-2 font-mono text-xs text-bch">
              {r.event?.id?.slice(0, 16)}…
            </div>
            <pre className="max-h-40 overflow-auto text-xs text-slate-400">
              {JSON.stringify(r.event, null, 2)}
            </pre>
            <p className="mt-2 text-xs text-slate-500">{r.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
