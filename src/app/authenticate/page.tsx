"use client";

import { useState } from "react";
import { createChallenge, verifyAuthResponse, clearReplayCache } from "@/lib/auth/challenge";
import type { AuthChallenge, IdentityBinding } from "@/types/identity";

export default function AuthenticatePage() {
  const [challenge, setChallenge] = useState<AuthChallenge | null>(null);
  const [bindingJson, setBindingJson] = useState("");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  function issueChallenge() {
    clearReplayCache();
    const c = createChallenge({
      audience: typeof window !== "undefined" ? window.location.origin : "bch-identity-bridge",
      action: "demo-authenticate",
    });
    setChallenge(c);
    setResult(null);
    setError("");
  }

  async function submitResponse() {
    if (!challenge) return;
    setError("");
    try {
      const binding: IdentityBinding = JSON.parse(bindingJson);
      const res = await verifyAuthResponse(
        challenge,
        {
          challengeId: challenge.challengeId,
          bindingId: binding.binding.bindingId,
          respondedAt: Math.floor(Date.now() / 1000),
        },
        binding
      );
      setResult(res);
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function testReplay() {
    if (!challenge || !result?.success) return;
    // Re-submit the same response — should be rejected
    try {
      const binding: IdentityBinding = JSON.parse(bindingJson);
      const res = await verifyAuthResponse(
        challenge,
        {
          challengeId: challenge.challengeId,
          bindingId: binding.binding.bindingId,
          respondedAt: Math.floor(Date.now() / 1000),
        },
        binding
      );
      setResult(res);
    } catch (e: any) {
      setError(e.message);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-2 text-3xl font-bold">Authenticate</h1>
      <p className="mb-8 text-slate-400">
        Challenge-response demonstration. A verifier issues a short-lived
        challenge; the user presents a valid binding. Replay attempts are
        rejected.
      </p>

      <button
        onClick={issueChallenge}
        className="mb-6 rounded-lg bg-bch px-6 py-2.5 font-medium text-surface hover:bg-bch-400"
      >
        Issue Fresh Challenge
      </button>

      {challenge && (
        <div className="mb-6 rounded-lg border border-surface-elevated bg-surface-card p-4">
          <div className="mb-2 text-xs text-slate-500">Challenge</div>
          <pre className="overflow-x-auto font-mono text-xs text-slate-300">
            {JSON.stringify(challenge, null, 2)}
          </pre>
        </div>
      )}

      {challenge && (
        <>
          <label className="mb-1.5 block text-sm font-medium">
            Paste a previously created binding (JSON)
          </label>
          <textarea
            value={bindingJson}
            onChange={(e) => setBindingJson(e.target.value)}
            rows={6}
            className="mb-4 w-full rounded-lg border border-surface-elevated bg-surface-card px-4 py-2.5 font-mono text-sm focus:border-bch focus:outline-none"
          />
          <div className="flex gap-3">
            <button
              onClick={submitResponse}
              className="rounded-lg bg-bch px-6 py-2.5 font-medium text-surface hover:bg-bch-400"
            >
              Submit Response
            </button>
            {result?.success && (
              <button
                onClick={testReplay}
                className="rounded-lg border border-red-500/40 bg-red-500/10 px-6 py-2.5 font-medium text-red-300 hover:bg-red-500/20"
              >
                Test Replay (should fail)
              </button>
            )}
          </div>
        </>
      )}

      {error && (
        <div className="mt-6 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-6 rounded-lg border border-surface-elevated bg-surface-card p-4">
          <div
            className={`mb-2 font-medium ${
              result.success ? "text-bch" : "text-red-400"
            }`}
          >
            {result.status}
          </div>
          <ul className="space-y-1 text-sm text-slate-400">
            {result.details.map((d: string, i: number) => (
              <li key={i}>• {d}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
