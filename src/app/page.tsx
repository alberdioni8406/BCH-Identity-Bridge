import Link from "next/link";

export default function OverviewPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      {/* Hero */}
      <section className="mb-16 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-bch/30 bg-bch/10 px-4 py-1 text-sm text-bch">
          Self-sovereign · Verifiable · Decentralized
        </div>
        <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
          One identity.{" "}
          <span className="text-bch">Two sovereign keys.</span>
          <br />
          No central authority.
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-slate-400">
          Connect your Bitcoin Cash wallet and Nostr identity with independently
          verifiable cryptographic proofs. Publish your binding, authenticate
          across applications, and remain in control of your keys.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/link"
            className="rounded-lg bg-bch px-6 py-3 font-medium text-surface transition hover:bg-bch-400"
          >
            Link Identity
          </Link>
          <Link
            href="/verify"
            className="rounded-lg border border-surface-elevated bg-surface-card px-6 py-3 font-medium transition hover:border-bch/40"
          >
            Independent Verifier
          </Link>
          <Link
            href="/authenticate"
            className="rounded-lg border border-surface-elevated bg-surface-card px-6 py-3 font-medium transition hover:border-bch/40"
          >
            Try Authentication
          </Link>
        </div>
      </section>

      {/* Value props */}
      <section className="mb-16 grid gap-6 md:grid-cols-3">
        {[
          {
            title: "Self-sovereignty",
            body: "You control both keys. This application never sees private keys or seed phrases. Wallet-mediated signing only.",
          },
          {
            title: "Independent verifiability",
            body: "Any third party can validate a binding record using only public data and the documented protocol. No trust in this app required.",
          },
          {
            title: "Interoperability",
            body: "Bindings are published on Nostr relays and exportable as portable JSON. Other BCH or Nostr apps can adopt the same verification library.",
          },
        ].map((card) => (
          <div
            key={card.title}
            className="rounded-xl border border-surface-elevated bg-surface-card p-6"
          >
            <h3 className="mb-2 text-lg font-semibold text-bch">{card.title}</h3>
            <p className="text-sm leading-relaxed text-slate-400">{card.body}</p>
          </div>
        ))}
      </section>

      {/* Protocol status */}
      <section className="rounded-xl border border-surface-elevated bg-surface-card p-8">
        <h2 className="mb-4 text-xl font-semibold">Protocol Status</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatusItem label="Protocol version" value="1.0.0" />
          <StatusItem label="Canonical serialization" value="Deterministic" good />
          <StatusItem label="BCH proof" value="Signed message" />
          <StatusItem label="Nostr proof" value="Kind 31234" />
          <StatusItem label="Replay protection" value="Nonce + challenge ID" good />
          <StatusItem label="Domain separation" value="Enabled" good />
          <StatusItem label="Independent verifier" value="Local crypto only" good />
          <StatusItem label="Central identity provider" value="None" good />
        </div>
      </section>

      {/* Evaluator note */}
      <section className="mt-12 rounded-xl border border-bch/20 bg-bch/5 p-6 text-sm text-slate-300">
        <h3 className="mb-2 font-semibold text-bch">For bounty evaluators</h3>
        <p className="mb-3">
          A guided walkthrough is available in{" "}
          <code className="rounded bg-surface px-1.5 py-0.5 text-xs">docs/bounty-demo.md</code>.
          The independent verifier and authentication demo let you test real
          cryptographic checks, including deliberate tampering and replay rejection.
        </p>
        <p>
          This project proves only cryptographic control of the two keys at signing
          time. It does not claim to establish legal identity or reputation.
        </p>
      </section>
    </div>
  );
}

function StatusItem({
  label,
  value,
  good,
}: {
  label: string;
  value: string;
  good?: boolean;
}) {
  return (
    <div className="rounded-lg bg-surface px-4 py-3">
      <div className="text-xs text-slate-500">{label}</div>
      <div className={`font-medium ${good ? "text-bch" : "text-slate-200"}`}>
        {value}
      </div>
    </div>
  );
}
