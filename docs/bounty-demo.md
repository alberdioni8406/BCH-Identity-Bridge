# Bounty Evaluator Walkthrough

1. Open the application.
2. Read the Overview — product purpose and protocol status are immediately visible.
3. Go to **Link Identity**.
   - Enter a BCH address and a Nostr hex pubkey.
   - Create the binding record.
   - Copy the exact BCH message and sign it in a compatible wallet; paste the signature.
   - Create / sign the Nostr event (kind 31234) with a NIP-07 extension or other signer; paste the event.
   - Assemble and export the binding.
4. Go to **Verify**.
   - Paste the exported binding.
   - Observe structured verification result (BCH proof, Nostr proof, binding match).
5. Tamper with any field in the JSON (change an address, the bindingId, or a signature) and re-verify — status must become `invalid_proof` or similar.
6. Go to **Authenticate**.
   - Issue a fresh challenge.
   - Submit the valid binding as the response.
   - Click “Test Replay” — the second attempt must be rejected with `replay_detected`.
7. Review **Developer** for the integration surface and protocol pointers.
8. Review `docs/protocol-spec.md` and `docs/security-model.md`.

The independent verifier and the replay test are the strongest demonstrations that this is real cryptography, not a mock.
