"use client";

import { useState } from "react";
import { verifyBinding } from "@/lib/identity/verify";
import type { VerificationResult } from "@/types/identity";

export default function VerifyPage() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleVerify() {
    setLoading(true);
    setResult(null);
    try {
      const res = await verifyBinding(input.trim());
      setResult(res);
    } catch (e: any) {
      setResult({
        status: "unsupported_format",
        details: [e.message || "Unexpected error"],
        verifiedAt: Math.floor(Date.now() / 1000),
        bchValid: false,
        nostrValid: false,
        bindingMatch: false,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-2 text-3xl font-bold">Independent Verifier</h1>
      <p className="mb-8 text-slate-400">
        Paste an exported binding record. Verification runs entirely in your
        browser using the documented protocol. No data is sent to any server.
      </p>

      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium text-slate-300">
          Binding record (JSON)
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={12}
          placeholder='{"binding":{...},"bchProof":{...},"nostrProof":{...}}'
          className="w-full rounded-lg border border-surface-elevated bg-surface-card px-4 py-3 font-mono text-sm text-slate-200 placeholder:text-slate-600 focus:border-bch focus:outline-none"
        />
      </div>

      <button
        onClick={handleVerify}
        disabled={loading || !input.trim()}
        className="rounded-lg bg-bch px-6 py-2.5 font-medium text-surface transition hover:bg-bch-400 disabled:opacity-40"
      >
        {loading ? "Verifying…" : "Verify Binding"}
      </button>

      {result && (
        <div className="mt-8 rounded-xl border border-surface-elevated bg-surface-card p-6">
          <div className="mb-4 flex items-center gap-3">
            <StatusBadge status={result.status} />
            <span className="text-sm text-slate-500">
              Checked at {new Date(result.verifiedAt * 1000).toLocaleString()}
            </span>
          </div>

          <div className="mb-4 grid grid-cols-3 gap-3 text-sm">
            <div className="rounded-lg bg-surface px-3 py-2">
              <div className="text-xs text-slate-500">BCH proof</div>
              <div className={result.bchValid ? "text-bch" : "text-red-400"}>
                {result.bchValid ? "Valid" : "Invalid / missing"}
              </div>
            </div>
            <div className="rounded-lg bg-surface px-3 py-2">
              <div className="text-xs text-slate-500">Nostr proof</div>
              <div className={result.nostrValid ? "text-bch" : "text-red-400"}>
                {result.nostrValid ? "Valid" : "Invalid / missing"}
              </div>
            </div>
            <div className="rounded-lg bg-surface px-3 py-2">
              <div className="text-xs text-slate-500">Binding match</div>
              <div className={result.bindingMatch ? "text-bch" : "text-red-400"}>
                {result.bindingMatch ? "Yes" : "No"}
              </div>
            </div>
          </div>

          <h3 className="mb-2 text-sm font-medium text-slate-300">Details</h3>
          <ul className="space-y-1 text-sm text-slate-400">
            {result.details.map((d, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-slate-600">•</span>
                {d}
              </li>
            ))}
          </ul>

          {result.binding && (
            <div className="mt-4 rounded-lg bg-surface p-3 font-mono text-xs text-slate-500">
              Binding ID: {result.binding.binding.bindingId}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    verified: "bg-bch/20 text-bch border-bch/40",
    invalid_proof: "bg-red-500/20 text-red-400 border-red-500/40",
    incomplete_proof: "bg-amber-500/20 text-amber-400 border-amber-500/40",
    expired_challenge: "bg-amber-500/20 text-amber-400 border-amber-500/40",
    revoked: "bg-red-500/20 text-red-400 border-red-500/40",
    superseded: "bg-amber-500/20 text-amber-400 border-amber-500/40",
    unsupported_format: "bg-slate-500/20 text-slate-400 border-slate-500/40",
    replay_detected: "bg-red-500/20 text-red-400 border-red-500/40",
  };
  const cls = styles[status] || styles.unsupported_format;
  return (
    <span className={`rounded-md border px-2.5 py-1 text-sm font-medium ${cls}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}
