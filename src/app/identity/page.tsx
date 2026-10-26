"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadLocalBindings, removeLocalBinding } from "@/lib/identity/storage";
import { exportBinding } from "@/lib/identity/binding";
import type { IdentityBinding } from "@/types/identity";

export default function IdentityPage() {
  const [bindings, setBindings] = useState<IdentityBinding[]>([]);

  useEffect(() => {
    setBindings(loadLocalBindings());
  }, []);

  function handleRemove(id: string) {
    removeLocalBinding(id);
    setBindings(loadLocalBindings());
  }

  function handleExport(ib: IdentityBinding) {
    navigator.clipboard.writeText(exportBinding(ib));
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Identity</h1>
          <p className="mt-1 text-slate-400">
            Bindings stored only in this browser. Export to use elsewhere.
          </p>
        </div>
        <Link
          href="/link"
          className="rounded-lg bg-bch px-4 py-2 text-sm font-medium text-surface hover:bg-bch-400"
        >
          + New Binding
        </Link>
      </div>

      {bindings.length === 0 ? (
        <div className="rounded-xl border border-dashed border-surface-elevated p-12 text-center text-slate-500">
          No local bindings yet.{" "}
          <Link href="/link" className="text-bch hover:underline">
            Create one
          </Link>
          .
        </div>
      ) : (
        <div className="space-y-4">
          {bindings.map((ib) => (
            <div
              key={ib.binding.bindingId}
              className="rounded-xl border border-surface-elevated bg-surface-card p-5"
            >
              <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="text-xs text-slate-500">Binding ID</div>
                  <div className="font-mono text-sm text-bch break-all">
                    {ib.binding.bindingId.slice(0, 16)}…{ib.binding.bindingId.slice(-8)}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleExport(ib)}
                    className="rounded-md border border-surface-elevated px-3 py-1 text-xs hover:border-bch/40"
                  >
                    Copy JSON
                  </button>
                  <button
                    onClick={() => handleRemove(ib.binding.bindingId)}
                    className="rounded-md border border-red-500/30 px-3 py-1 text-xs text-red-400 hover:bg-red-500/10"
                  >
                    Remove
                  </button>
                </div>
              </div>
              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <div className="text-xs text-slate-500">BCH</div>
                  <div className="font-mono text-slate-300 break-all">
                    {ib.binding.bch.address}
                  </div>
                  <div className="text-xs text-slate-500">{ib.binding.bch.network}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Nostr</div>
                  <div className="font-mono text-slate-300 break-all">
                    {ib.binding.nostr.pubkey.slice(0, 16)}…
                  </div>
                </div>
              </div>
              <div className="mt-3 text-xs text-slate-500">
                Created {new Date(ib.binding.createdAt * 1000).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
