"use client";

import { useState, useEffect } from "react";
import {
  createCanonicalBinding,
  getBchSigningMessage,
  getNostrEventTemplate,
  assembleBinding,
  exportBinding,
} from "@/lib/identity/binding";
import { saveLocalBinding } from "@/lib/identity/storage";
import { getNip07, createUnsignedBindingEvent } from "@/lib/nostr/event";
import type { CanonicalBinding, IdentityBinding, BchNetwork } from "@/types/identity";

export default function LinkPage() {
  const [step, setStep] = useState(1);
  const [bchAddress, setBchAddress] = useState("");
  const [bchNetwork, setBchNetwork] = useState<BchNetwork>("mainnet");
  const [nostrPubkey, setNostrPubkey] = useState("");
  const [hasNip07, setHasNip07] = useState(false);
  const [binding, setBinding] = useState<CanonicalBinding | null>(null);
  const [bchSig, setBchSig] = useState("");
  const [nostrEventJson, setNostrEventJson] = useState("");
  const [finalBinding, setFinalBinding] = useState<IdentityBinding | null>(null);
  const [error, setError] = useState("");
  const [signing, setSigning] = useState(false);

  useEffect(() => {
    setHasNip07(!!getNip07());
  }, []);

  async function connectNostr() {
    setError("");
    const nip07 = getNip07();
    if (!nip07) {
      setError("No NIP-07 extension detected. Install Alby, nos2x, or similar.");
      return;
    }
    try {
      const pk = await nip07.getPublicKey();
      setNostrPubkey(pk);
    } catch (e: any) {
      setError(e.message || "User rejected or NIP-07 error");
    }
  }

  async function createBinding() {
    setError("");
    try {
      if (!bchAddress.trim() || !nostrPubkey.trim()) {
        setError("Both BCH address and Nostr pubkey are required");
        return;
      }
      const b = await createCanonicalBinding({
        bchAddress: bchAddress.trim(),
        bchNetwork,
        nostrPubkey: nostrPubkey.trim(),
      });
      setBinding(b);
      setStep(2);
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function signWithNip07() {
    if (!binding) return;
    setSigning(true);
    setError("");
    try {
      const nip07 = getNip07();
      if (!nip07) throw new Error("NIP-07 not available");
      const unsigned = createUnsignedBindingEvent(binding);
      const signed = await nip07.signEvent(unsigned);
      setNostrEventJson(JSON.stringify(signed, null, 2));
    } catch (e: any) {
      setError(e.message || "Signing failed or was rejected");
    } finally {
      setSigning(false);
    }
  }

  function assemble() {
    setError("");
    if (!binding) return;
    try {
      let nostrEvent;
      try {
        nostrEvent = JSON.parse(nostrEventJson);
      } catch {
        setError("Nostr event must be valid JSON");
        return;
      }
      const ib = assembleBinding(
        binding,
        {
          message: getBchSigningMessage(binding),
          signature: bchSig.trim(),
          address: binding.bch.address,
          network: binding.bch.network,
        },
        { event: nostrEvent }
      );
      setFinalBinding(ib);
      saveLocalBinding(ib);
      setStep(4);
    } catch (e: any) {
      setError(e.message);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-2 text-3xl font-bold">Link Identity</h1>
      <p className="mb-8 text-slate-400">
        Create a cryptographic binding between a BCH address and a Nostr public
        key. Each key signs separately. Private keys never enter this application.
      </p>

      <div className="mb-8 flex gap-2">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full transition ${
              s <= step ? "bg-bch" : "bg-surface-elevated"
            }`}
          />
        ))}
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {step === 1 && (
        <div className="space-y-6">
          <div>
            <label className="mb-1.5 block text-sm font-medium">BCH Address</label>
            <input
              value={bchAddress}
              onChange={(e) => setBchAddress(e.target.value)}
              placeholder="bitcoincash:q... or legacy address"
              className="w-full rounded-lg border border-surface-elevated bg-surface-card px-4 py-2.5 font-mono text-sm focus:border-bch focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Network</label>
            <select
              value={bchNetwork}
              onChange={(e) => setBchNetwork(e.target.value as BchNetwork)}
              className="w-full rounded-lg border border-surface-elevated bg-surface-card px-4 py-2.5 text-sm focus:border-bch focus:outline-none"
            >
              <option value="mainnet">Mainnet</option>
              <option value="chipnet">Chipnet</option>
              <option value="testnet">Testnet</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Nostr Public Key (hex)
            </label>
            <div className="flex gap-2">
              <input
                value={nostrPubkey}
                onChange={(e) => setNostrPubkey(e.target.value)}
                placeholder="64-character hex pubkey"
                className="flex-1 rounded-lg border border-surface-elevated bg-surface-card px-4 py-2.5 font-mono text-sm focus:border-bch focus:outline-none"
              />
              {hasNip07 && (
                <button
                  type="button"
                  onClick={connectNostr}
                  className="rounded-lg border border-bch/40 bg-bch/10 px-4 py-2 text-sm font-medium text-bch hover:bg-bch/20"
                >
                  Connect NIP-07
                </button>
              )}
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {hasNip07
                ? "NIP-07 extension detected. Click Connect to use it."
                : "No NIP-07 extension detected. You can still paste a hex pubkey and sign later."}
              {" "}Never paste your nsec or private key.
            </p>
          </div>
          <button
            onClick={createBinding}
            className="rounded-lg bg-bch px-6 py-2.5 font-medium text-surface hover:bg-bch-400"
          >
            Create Binding Record
          </button>
        </div>
      )}

      {step === 2 && binding && (
        <div className="space-y-6">
          <div className="rounded-lg border border-surface-elevated bg-surface-card p-4">
            <div className="mb-1 text-xs text-slate-500">Binding ID</div>
            <div className="break-all font-mono text-sm text-bch">
              {binding.bindingId}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Sign this exact message with your BCH wallet
            </label>
            <pre className="mb-3 max-h-40 overflow-auto rounded-lg bg-surface p-4 font-mono text-xs text-slate-300 whitespace-pre-wrap">
              {getBchSigningMessage(binding)}
            </pre>
            <input
              value={bchSig}
              onChange={(e) => setBchSig(e.target.value)}
              placeholder="Paste base64 signature from your wallet"
              className="w-full rounded-lg border border-surface-elevated bg-surface-card px-4 py-2.5 font-mono text-sm focus:border-bch focus:outline-none"
            />
            <p className="mt-1 text-xs text-slate-500">
              Use Electron Cash (Tools → Sign/Verify Message), mainnet.cash, or any
              wallet that supports Bitcoin-style message signing. Do not send any BCH.
            </p>
          </div>

          <button
            onClick={() => setStep(3)}
            disabled={!bchSig.trim()}
            className="rounded-lg bg-bch px-6 py-2.5 font-medium text-surface hover:bg-bch-400 disabled:opacity-40"
          >
            Continue to Nostr Proof
          </button>
        </div>
      )}

      {step === 3 && binding && (
        <div className="space-y-6">
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Sign a Nostr event (kind 31234)
            </label>
            <pre className="mb-3 max-h-48 overflow-auto rounded-lg bg-surface p-4 font-mono text-xs text-slate-300">
              {JSON.stringify(getNostrEventTemplate(binding), null, 2)}
            </pre>

            {hasNip07 && (
              <button
                type="button"
                onClick={signWithNip07}
                disabled={signing}
                className="mb-3 rounded-lg border border-bch/40 bg-bch/10 px-4 py-2 text-sm font-medium text-bch hover:bg-bch/20 disabled:opacity-50"
              >
                {signing ? "Waiting for extension…" : "Sign with NIP-07 Extension"}
              </button>
            )}

            <textarea
              value={nostrEventJson}
              onChange={(e) => setNostrEventJson(e.target.value)}
              rows={8}
              placeholder="Paste the full signed Nostr event JSON, or use the NIP-07 button above"
              className="w-full rounded-lg border border-surface-elevated bg-surface-card px-4 py-2.5 font-mono text-sm focus:border-bch focus:outline-none"
            />
          </div>
          <button
            onClick={assemble}
            disabled={!nostrEventJson.trim()}
            className="rounded-lg bg-bch px-6 py-2.5 font-medium text-surface hover:bg-bch-400 disabled:opacity-40"
          >
            Assemble Binding
          </button>
        </div>
      )}

      {step === 4 && finalBinding && (
        <div className="space-y-6">
          <div className="rounded-lg border border-bch/40 bg-bch/10 p-4 text-bch">
            Binding assembled and saved locally. Export it and open the Verifier
            to confirm both proofs cryptographically.
          </div>
          <pre className="max-h-80 overflow-auto rounded-lg bg-surface p-4 font-mono text-xs text-slate-300">
            {exportBinding(finalBinding)}
          </pre>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                navigator.clipboard.writeText(exportBinding(finalBinding));
              }}
              className="rounded-lg bg-bch px-6 py-2.5 font-medium text-surface hover:bg-bch-400"
            >
              Copy to Clipboard
            </button>
            <a
              href="/verify"
              className="rounded-lg border border-surface-elevated bg-surface-card px-6 py-2.5 font-medium hover:border-bch/40"
            >
              Open Verifier
            </a>
            <a
              href="/identity"
              className="rounded-lg border border-surface-elevated bg-surface-card px-6 py-2.5 font-medium hover:border-bch/40"
            >
              My Identity
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
