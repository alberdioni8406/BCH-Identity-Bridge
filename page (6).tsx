"use client";
import { useState } from "react";

const DEFAULT_RELAYS = [
  "wss://relay.damus.io",
  "wss://nos.lol",
  "wss://relay.nostr.band",
];

export default function SettingsPage() {
  const [relays, setRelays] = useState(DEFAULT_RELAYS.join("\n"));
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Settings</h1>
      <p className="text-slate-400 mb-8">Relay configuration and privacy controls.</p>
      <label className="block text-sm font-medium mb-1.5">Nostr Relays (one per line)</label>
      <textarea
        value={relays}
        onChange={(e) => setRelays(e.target.value)}
        rows={6}
        className="w-full rounded-lg border border-surface-elevated bg-surface-card px-4 py-2.5 font-mono text-sm focus:border-bch focus:outline-none mb-4"
      />
      <p className="text-xs text-slate-500 mb-6">
        Relays are untrusted. Every retrieved record is verified locally.
      </p>
      <div className="rounded-lg border border-surface-elevated bg-surface-card p-4 text-sm text-slate-400">
        <strong className="text-slate-200">Privacy note:</strong> Publicly linking a BCH
        address to a Nostr key can make financial activity easier to associate with the
        same identity. Only publish bindings you are comfortable making public.
      </div>
    </div>
  );
}
