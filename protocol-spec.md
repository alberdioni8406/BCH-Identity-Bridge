# BCH Identity Bridge Protocol Specification v1.0.0

## 1. Overview

This protocol establishes a cryptographically verifiable association between a Bitcoin Cash address and a Nostr public key. The association is expressed as a **binding** that can be published on Nostr relays and independently verified by any party.

A valid binding proves that the same entity controlled both the BCH private key (at the time of signing) and the Nostr private key (at the time of signing), and that both signatures cover the same canonical binding identifier and purpose.

It does **not** prove legal identity, reputation, or ongoing control after key compromise.

## 2. Identifiers

- **Protocol ID**: `bch-identity-bridge`
- **Version**: `1.0.0`
- **Binding ID**: 32-byte SHA-256 hash (hex) of the canonical form of the binding fields excluding the ID itself.

## 3. Canonical Binding Record

```json
{
  "protocol": "bch-identity-bridge",
  "version": "1.0.0",
  "bindingId": "<64-char hex>",
  "bch": {
    "network": "mainnet" | "chipnet" | "testnet",
    "address": "<cashaddr or legacy>",
    "addressType": "p2pkh" | "p2sh"   // optional
  },
  "nostr": {
    "pubkey": "<64-char hex>"
  },
  "createdAt": <unix seconds>,
  "expiresAt": <unix seconds>,         // optional
  "purpose": "identity-binding-v1",
  "nonce": "<64-char hex random>"
}
```

Serialization for hashing and signing **must** use the deterministic `canonicalize` function (keys sorted recursively, no whitespace, no undefined values).

## 4. BCH Proof

Message to sign (exact string):

```
bch-identity-bridge/bch-proof/v1.0.0
{"bindingId":"...","bchAddress":"...","bchNetwork":"...","createdAt":...,"nonce":"...","nostrPubkey":"...","purpose":"..."}
```

(The JSON object is the canonicalized form.)

Signature format: Bitcoin-style signed message (base64), compatible with `verifymessage` and libraries such as `bitcoinjs-message` / mainnet.cash.

Verification recovers or checks that the signature corresponds to the claimed BCH address on the claimed network.

## 5. Nostr Proof

Custom addressable event kind: **31234** (chosen in the 30000–39999 range for application-specific addressable events).

Event structure:

- `kind`: 31234
- `pubkey`: the Nostr public key being bound
- `tags`:
  - `["d", "<bindingId>"]`  (makes it addressable)
  - `["bch", "<address>", "<network>"]`
  - `["protocol", "bch-identity-bridge", "1.0.0"]`
- `content`: canonical JSON of the binding (see `buildNostrEventContent`)
- Standard `id` and `sig` per NIP-01

Clients verify the event signature, that the author matches the bound pubkey, that the `d` tag and content bindingId match, and that the BCH address matches.

## 6. Combined Verification

A binding is **verified** only when:

1. Canonical record is well-formed and version is supported.
2. Binding ID matches the recomputed hash.
3. BCH signature is valid for the exact domain-separated message and the claimed address/network.
4. Nostr event is valid, signed by the claimed pubkey, and references the same binding ID and address.
5. Nonces and timestamps are consistent (no future dates beyond clock skew, not expired if `expiresAt` is set).
6. No revocation or supersession event is known for this bindingId (discovery-time check).

## 7. Authentication Challenges

A verifier issues:

```json
{
  "challengeId": "<uuid or random>",
  "nonce": "<32-byte hex>",
  "audience": "<origin or verifier id>",
  "action": "authenticate",
  "issuedAt": <unix>,
  "expiresAt": <unix + short lifetime, e.g. 5 min>
}
```

The user produces fresh signatures (or a fresh Nostr event) covering the challenge. The verifier checks audience, expiry, nonce uniqueness (anti-replay), and that the binding is still valid.

## 8. Revocation / Supersession

A later event of kind 31235 (or a tag on a new binding) can mark a previous bindingId as revoked or superseded. Verifiers that discover such an event treat the original as `revoked` or `superseded`.

## 9. Error Codes

See `IdentityErrorCode` in the TypeScript types.

## 10. Security Considerations

- Relays are untrusted; always re-verify locally.
- Domain separation prevents signature reuse across protocols.
- Short-lived challenges + unique nonces prevent replay.
- Never treat a published binding as proof of *current* control without a fresh challenge-response.
