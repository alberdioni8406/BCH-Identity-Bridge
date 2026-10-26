export default function DeveloperPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 prose prose-invert">
      <h1 className="text-3xl font-bold mb-4">Developer</h1>
      <p className="text-slate-400 mb-8">
        Protocol specification, integration examples, and the reusable verification library.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Quick integration</h2>
      <pre className="rounded-lg bg-surface-card p-4 text-sm overflow-x-auto">{`
import { verifyBinding } from "@/lib/identity/verify";

const result = await verifyBinding(exportedJsonOrObject);
if (result.status === "verified") {
  // safe to trust the binding for the claimed purpose
}
`}</pre>

      <h2 className="text-xl font-semibold mt-8 mb-3">Key modules</h2>
      <ul className="list-disc pl-6 space-y-2 text-slate-300">
        <li><code>lib/identity/canonicalize.ts</code> — deterministic serialization & domain separation</li>
        <li><code>lib/identity/binding.ts</code> — create & export bindings</li>
        <li><code>lib/identity/verify.ts</code> — independent verifier (use this from other apps)</li>
        <li><code>lib/auth/challenge.ts</code> — challenge-response + replay protection</li>
        <li><code>lib/bch/verify-message.ts</code> — BCH signed-message interface</li>
        <li><code>lib/nostr/event.ts</code> — Nostr event structure helpers</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-3">Documentation</h2>
      <ul className="list-disc pl-6 space-y-1 text-slate-300">
        <li><a href="https://github.com" className="text-bch">docs/protocol-spec.md</a> — full protocol</li>
        <li>docs/security-model.md — threat model</li>
        <li>docs/bounty-demo.md — evaluator walkthrough</li>
      </ul>
    </div>
  );
}
