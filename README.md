# BCH Identity Bridge

**One identity. Two sovereign keys. No central authority.**

Connect your Bitcoin Cash wallet and Nostr identity with independently verifiable cryptographic proofs. Publish your binding, authenticate across applications, and remain in control of your keys.

![BCH Identity Bridge](https://img.shields.io/badge/BCH-Identity%20Bridge-0AC18E?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)

## Overview

BCH Identity Bridge is a self-sovereign identity protocol that cryptographically binds a Bitcoin Cash (BCH) address to a Nostr public key. The binding is:

- **Independently verifiable** — any third party can validate the proofs without trusting this application
- **Decentralized** — published and discovered via Nostr relays
- **Non-custodial** — private keys never leave the user's wallet or signer
- **Replay-resistant** — challenges, nonces, domain separation, and expiry protect against common attacks

This project was built from scratch to meet the Paytaca-sponsored BCH bounty requirements for a complete, working proof-of-concept linking BCH and Nostr identities.

## Live Demo

Deployed on Vercel: *(add your deployment URL after `vercel deploy`)*

## Core Features

- Connect BCH address (message-signing proof) and Nostr identity (NIP-07 / event signature)
- Canonical binding record with deterministic serialization
- Dual cryptographic proofs (BCH signed message + Nostr event)
- Publish / discover bindings on configurable Nostr relays
- Independent verifier that rejects tampering, replay, expiry, and mismatched identities
- Challenge-response authentication flow
- Exportable, portable binding records
- Developer-friendly verification library and protocol specification
- Polished UI with BCH green + ParyonUSD / Paytaca-inspired design system

## Quick Start

```bash
# Clone
git clone https://github.com/YOUR_USER/bch-identity-bridge.git
cd bch-identity-bridge

# Install
npm install

# Development
npm run dev

# Tests
npm test

# Production build
npm run build
```

## Architecture

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Overview
│   ├── link/               # Link Identity flow
│   ├── identity/           # My Identity
│   ├── discover/           # Discover bindings
│   ├── verify/             # Independent verifier
│   ├── authenticate/       # Challenge-response demo
│   ├── developer/          # Protocol & integration docs
│   └── settings/           # Relays, network, privacy
├── components/             # UI components
├── lib/
│   ├── identity/           # Core protocol (canonical, binding, proofs, verify)
│   ├── auth/               # Challenge / response / session
│   ├── bch/                # BCH address & message verification
│   └── nostr/              # Nostr event helpers & relay client
├── types/                  # Shared TypeScript types
docs/                       # Protocol, security, architecture
tests/                      # Vitest unit & adversarial tests
```

## Protocol Summary (v1)

See full specification in [`docs/protocol-spec.md`](docs/protocol-spec.md).

A binding consists of:

1. **Canonical Binding Record** (deterministic JSON serialization)
2. **BCH Proof** — Bitcoin-style signed message over a domain-separated payload that includes the binding ID, nonce, and Nostr pubkey
3. **Nostr Proof** — a signed Nostr event (custom kind in the 30000+ addressable range) that references the same binding ID and BCH address

Verification rules reject:

- Invalid or mismatched signatures
- Altered payloads
- Wrong network / address derivation
- Expired or reused challenges
- Superseded / revoked records (when present)
- Unsupported protocol versions

## Security Model

Documented in [`docs/security-model.md`](docs/security-model.md).

Key protections:

- Canonical serialization (no ordinary `JSON.stringify`)
- Domain separation for signing payloads
- Cryptographically secure nonces + short-lived challenges
- Audience / origin binding on authentication challenges
- Local verification only — relays and caches are untrusted
- No private keys or seed phrases ever accepted by the application

## Supported Signing

| Identity | Method | Notes |
|----------|--------|-------|
| Nostr | NIP-07 browser extension | Preferred. NIP-46 remote signing investigated. |
| BCH | Signed message (Bitcoin-style) | User signs the exact challenge in a compatible wallet (Electron Cash, mainnet.cash, Paytaca where message signing is exposed) and pastes the signature. Direct wallet injection is used when available. |

**Important**: The application never asks for private keys or recovery phrases.

## Bounty Demonstration Walkthrough

See [`docs/bounty-demo.md`](docs/bounty-demo.md) for the exact evaluator script covering:

1. Connect identities
2. Create & publish binding
3. Independent verification
4. Challenge-response authentication
5. Tampering detection
6. Replay rejection
7. Export for third-party use

## Stretch Goals Implemented

- Identity-based BCH payment URI generation from a verified binding
- Revocation / supersession event structure
- Reusable verification module (`lib/identity/verify.ts`) usable by other applications
- Clear developer integration examples

## Branding

Primary accent: Bitcoin Cash green (`#0AC18E`). Complementary accents drawn from ParyonUSD (purple/gradient) and Paytaca visual language. Accurate official assets used where permitted; this is an independent project.

## Known Limitations

- Not all BCH wallets expose arbitrary message signing in the browser; fallback is manual sign + paste.
- No formal security audit has been performed.
- Relays may be unavailable; the UI clearly distinguishes “cryptographically valid” from “published & currently discoverable”.
- Linking a BCH address to a Nostr key makes future financial activity more linkable — users are informed.

## License

MIT

## Credits

Built for the Paytaca-sponsored BCH + Nostr identity bounty. Inspired by the self-sovereignty principles of both Bitcoin Cash and Nostr.

---

## Current Implementation Status (this session)

### Done
- Full protocol specification (canonical form, domain separation, event kinds, verification rules)
- Core TypeScript library: canonicalize, binding creation, independent verifier, challenge-response + replay protection
- BCH message verification interface (ready for bitcoinjs-message / mainnet.cash)
- Nostr event structure helpers (kind 31234)
- Complete App Router pages: Overview, Link Identity, My Identity, Discover, Verify, Authenticate, Developer, Settings
- Dark premium UI with BCH green design tokens
- Security model & bounty evaluator walkthrough docs
- Vitest unit tests for canonicalization and binding ID integrity

### Next steps for a production-ready bounty submission
1. `npm install` (clean environment recommended)
2. Wire real `bitcoinjs-message` verification into `lib/bch/verify-message.ts`
3. Wire `nostr-tools` `verifyEvent` into the Nostr proof path
4. Add relay publish/fetch in Discover using a SimplePool
5. Optional: NIP-07 auto-detect button on the Link page
6. Expand adversarial tests (tampered payloads, expired challenges, wrong network, etc.)
7. `npm run build` && deploy to Vercel

The cryptographic design and independent verifier are the strongest parts of the submission and are already in place.

### Session progress (continued)

- Real dynamic loading of `bitcoinjs-message` and `nostr-tools` for cryptographic verification
- NIP-07 detection + one-click connect/sign on Link Identity
- Local binding storage (My Identity page fully functional)
- Relay discovery & publish helpers (`lib/nostr/discovery.ts`)
- Architecture documentation
- Expanded unit tests (tamper detection, export/import, challenge uniqueness)
- Discover page wired to relay query (graceful when libs missing)

After a clean `npm install` the full dual-proof cryptographic path and relay features become active.
