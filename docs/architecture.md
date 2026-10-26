# Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        UI (Next.js App Router)               │
│  Overview · Link · Identity · Discover · Verify · Auth · …  │
└────────────────────────────┬────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────┐
│                     Application Services                     │
│  storage.ts (localStorage) · discovery (relays) · session   │
└────────────────────────────┬────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────┐
│                     Protocol Core (pure)                     │
│  canonicalize · binding · verify · auth/challenge            │
│  No private keys · deterministic · versioned                 │
└──────────────┬─────────────────────────────┬────────────────┘
               │                             │
┌──────────────▼──────────────┐ ┌────────────▼────────────────┐
│     BCH Proof Layer         │ │     Nostr Proof Layer        │
│  verify-message.ts          │ │  event.ts (kind 31234)       │
│  bitcoinjs-message          │ │  nostr-tools verifyEvent     │
└─────────────────────────────┘ └─────────────────────────────┘
```

## Design principles

1. **Verification is pure and local** — the `verify` module has no knowledge of relays, wallets, or the UI.
2. **Domain separation** — every signed payload is prefixed with a protocol-specific string.
3. **Canonicalization** — signing and binding-ID computation use the same deterministic serializer.
4. **No custodial path** — the app never accepts private keys or seed phrases.
5. **Graceful degradation** — if optional libraries are missing, verification returns a clear error instead of silently succeeding.

## Key files

| Path | Responsibility |
|------|----------------|
| `src/types/identity.ts` | Shared types, protocol constants, status enums |
| `src/lib/identity/canonicalize.ts` | Deterministic JSON + domain payloads + bindingId |
| `src/lib/identity/binding.ts` | Create / assemble / export bindings |
| `src/lib/identity/verify.ts` | Independent verifier (the reusable library) |
| `src/lib/identity/storage.ts` | Browser-only local binding store |
| `src/lib/auth/challenge.ts` | Challenge issuance + replay-protected response check |
| `src/lib/bch/verify-message.ts` | BCH signed-message verification |
| `src/lib/nostr/event.ts` | Event structure, NIP-07 helper, signature verify |

## Deployment

Static-friendly Next.js app. Deploy to Vercel with zero server-side secrets. All crypto runs client-side (or in Node for the test suite / future CLI).
