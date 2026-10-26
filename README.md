# BCH Identity Bridge

**One identity. Two sovereign keys. No central authority.**

Cryptographically link a Bitcoin Cash address to a Nostr public key with independently verifiable proofs. Publish the binding on Nostr relays, authenticate across applications, and remain in full control of your keys.

> Built from scratch for the Paytaca-sponsored BCH + Nostr identity bounty.

---

## Live Demo

**https://bch-id-bridge.vercel.app/**

| Resource | Link |
|----------|------|
| Live application | [bch-id-bridge.vercel.app](https://bch-id-bridge.vercel.app/) |
| Source code | [github.com/alberdioni8406/BCH-Identity-Bridge](https://github.com/alberdioni8406/BCH-Identity-Bridge) |
| **Bounty evaluator walkthrough** | [docs/bounty-demo.md](https://github.com/alberdioni8406/BCH-Identity-Bridge/blob/main/docs/bounty-demo.md) |
| Protocol specification | [docs/protocol-spec.md](https://github.com/alberdioni8406/BCH-Identity-Bridge/blob/main/docs/protocol-spec.md) |
| Security model | [docs/security-model.md](https://github.com/alberdioni8406/BCH-Identity-Bridge/blob/main/docs/security-model.md) |
| Architecture | [docs/architecture.md](https://github.com/alberdioni8406/BCH-Identity-Bridge/blob/main/docs/architecture.md) |

---

## For Bounty Evaluators

Start here:

1. Open the live app → [https://bch-id-bridge.vercel.app/](https://bch-id-bridge.vercel.app/)
2. Follow the guided walkthrough → **[docs/bounty-demo.md](https://github.com/alberdioni8406/BCH-Identity-Bridge/blob/main/docs/bounty-demo.md)**

The walkthrough covers:
- Connecting identities and creating a binding
- Independent cryptographic verification
- Challenge-response authentication
- Deliberate tampering detection
- Replay rejection
- Export for third-party use

---

## Overview

BCH Identity Bridge is a self-sovereign identity protocol that cryptographically binds a Bitcoin Cash (BCH) address to a Nostr public key. The binding is:

- **Independently verifiable** — any third party can validate the proofs without trusting this application
- **Decentralized** — published and discovered via Nostr relays
- **Non-custodial** — private keys never leave the user’s wallet or signer
- **Replay-resistant** — challenges, nonces, domain separation, and expiry protect against common attacks

A valid binding proves only that the same party controlled both keys at the time of signing. It does **not** prove legal identity, reputation, or ongoing control after key compromise.

---

## Core Features

- Connect BCH address (Bitcoin-style signed message) and Nostr identity (NIP-07 / event signature)
- Canonical binding record with deterministic serialization
- Dual cryptographic proofs (BCH signed message + Nostr event kind 31234)
- Publish / discover bindings on configurable Nostr relays
- Independent verifier that rejects tampering, replay, expiry, and mismatched identities
- Challenge-response authentication flow with anti-replay protection
- Exportable, portable binding records
- Local binding storage (My Identity)
- Developer-friendly verification library (`src/lib/identity`)
- Polished dark UI with Bitcoin Cash green design system

---

## Quick Start (local)

```bash
git clone https://github.com/alberdioni8406/BCH-Identity-Bridge.git
cd BCH-Identity-Bridge
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm test          # unit tests
npm run build     # production build
```

---

## How it works

1. User provides a BCH address + Nostr public key.
2. App creates a **canonical binding** (deterministic JSON + `bindingId` = SHA-256 of the fields).
3. User signs a domain-separated message with their BCH wallet.
4. User signs a Nostr event (kind `31234`) with their Nostr key (preferably via NIP-07).
5. Both proofs are assembled into a portable `IdentityBinding` record.
6. The record can be stored locally, exported as JSON, published to relays, or independently verified by anyone.

Third parties never need to trust this application — only the public binding record and the open protocol rules.

---

## Protocol Summary (v1.0.0)

- **Protocol ID:** `bch-identity-bridge`
- **Nostr event kind:** `31234` (addressable)
- **Canonical serialization:** keys sorted recursively, no whitespace
- **BCH proof:** Bitcoin-style signed message with explicit domain-separation prefix
- **Binding ID:** SHA-256 of the canonical fields (hex)
- **Authentication:** short-lived challenge with nonce, audience, action, and expiry

Full specification: [docs/protocol-spec.md](https://github.com/alberdioni8406/BCH-Identity-Bridge/blob/main/docs/protocol-spec.md)

---

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Overview
│   ├── link/               # Create binding flow
│   ├── identity/           # Local bindings
│   ├── discover/           # Relay search
│   ├── verify/             # Independent verifier
│   ├── authenticate/       # Challenge-response demo
│   ├── developer/          # Integration notes
│   └── settings/           # Relays & privacy
├── lib/
│   ├── identity/           # Core protocol (canonicalize, binding, verify)
│   ├── auth/               # Challenge + replay protection
│   ├── bch/                # BCH message verification
│   └── nostr/              # Event helpers + relay discovery
├── types/                  # Shared TypeScript schema
docs/                       # Protocol, security, architecture, demo script
tests/                      # Vitest unit & adversarial tests
```

---

## Security Model (summary)

| Threat | Mitigation |
|--------|------------|
| Signature forgery | Standard ECDSA verification (BCH message + Nostr event) |
| Payload tampering | Binding ID = hash of canonical fields; both proofs cover it |
| Cross-protocol reuse | Explicit domain-separation strings |
| Replay attacks | Unique challenge IDs + nonces + short TTL + seen-set |
| Malicious relays | All records re-verified locally; cache is never trusted |
| Wrong network | Network is part of the canonical record and BCH proof |
| Key leakage | Application never accepts or stores private keys / seeds |

See [docs/security-model.md](https://github.com/alberdioni8406/BCH-Identity-Bridge/blob/main/docs/security-model.md).

---

## Supported Signing

| Identity | Method | Notes |
|----------|--------|-------|
| Nostr | NIP-07 browser extension | Preferred (Alby, nos2x, etc.). One-click connect & sign. |
| BCH | Bitcoin-style signed message | Sign the exact message in Electron Cash, mainnet.cash, or compatible wallet, then paste the signature. |

**Important:** The application never asks for private keys or recovery phrases.

---

## Known Limitations

- Not every BCH wallet exposes arbitrary message signing in the browser; the path is “sign in wallet → paste signature”.
- No formal third-party security audit has been performed.
- Relays may be unavailable; the UI distinguishes “cryptographically valid” from “currently discoverable”.
- Publicly linking a BCH address to a Nostr key increases linkability of financial activity — users are informed.

---

## License

MIT

---

## Credits

Built as an independent project for the Paytaca-sponsored Bitcoin Cash + Nostr identity bounty.  
Inspired by the self-sovereignty principles of both Bitcoin Cash and Nostr.

**Not an official Paytaca or ParyonUSD product.**
