# Security Model

## Assumptions

- Users control their own BCH and Nostr private keys.
- Browser extensions / wallets that perform signing are trusted by the user.
- Relays may be malicious, offline, or serve stale/malformed data.
- The verification code running in the verifier’s environment is authentic.

## Threats & Mitigations

| Threat | Mitigation |
|--------|------------|
| Signature forgery | Standard ECDSA verification (BCH message + Nostr event) |
| Payload tampering | Binding ID = SHA-256 of canonical fields; both proofs cover it |
| Cross-protocol reuse | Explicit domain separation strings in signing payloads |
| Replay of auth responses | Unique challenge IDs + nonces + short TTL + in-memory (or durable) seen set |
| Malicious relays | All records re-verified locally; cache never source of trust |
| Wrong network | Network field is part of canonical record and BCH proof |
| Stale / superseded bindings | Revocation / supersession events; status reported distinctly |
| Leakage of secrets | App never accepts or stores private keys / seeds |

## What a valid binding proves

Only that, at the time of signing, the same party controlled the BCH private key corresponding to the address and the Nostr private key corresponding to the pubkey, and both signatures cover the same binding identifier and purpose.

It does **not** prove ongoing control, legal identity, reputation, or trustworthiness.
