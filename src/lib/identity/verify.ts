/**
 * Independent verification module.
 * Any third party can call verifyBinding with an exported record
 * and receive a structured, trustworthy result without trusting this app.
 */

import {
  IdentityBinding,
  VerificationResult,
  VerificationStatus,
  PROTOCOL_VERSION,
} from "../../types/identity";
import {
  assertCanonicalBinding,
  computeBindingId,
  buildBchSigningPayload,
} from "./canonicalize";
import { verifyBchSignedMessage } from "../bch/verify-message";
import {
  validateNostrBindingEventStructure,
  verifyNostrEventSignature,
} from "../nostr/event";

export async function verifyBinding(
  record: IdentityBinding | string
): Promise<VerificationResult> {
  const details: string[] = [];
  let binding: IdentityBinding;

  try {
    binding = typeof record === "string" ? JSON.parse(record) : record;
  } catch {
    return fail("unsupported_format", ["Could not parse binding record as JSON"], false, false, false);
  }

  // 1. Structural / version checks
  try {
    assertCanonicalBinding(binding.binding);
  } catch (e: any) {
    return fail("invalid_proof", [`Canonical binding invalid: ${e.message}`], false, false, false);
  }

  if (binding.binding.version !== PROTOCOL_VERSION) {
    return fail(
      "unsupported_format",
      [`Unsupported protocol version: ${binding.binding.version}`],
      false,
      false,
      false
    );
  }

  // 2. Recompute bindingId — catches any tampering of the canonical fields
  const recomputedId = await computeBindingId({
    bch: binding.binding.bch,
    nostr: binding.binding.nostr,
    createdAt: binding.binding.createdAt,
    expiresAt: binding.binding.expiresAt,
    purpose: binding.binding.purpose,
    nonce: binding.binding.nonce,
  });

  if (recomputedId !== binding.binding.bindingId) {
    details.push(
      "Binding ID does not match recomputed hash — the record has been altered"
    );
    return fail("invalid_proof", details, false, false, false);
  }
  details.push("Binding ID matches canonical hash");

  // 3. Expiry
  const now = Math.floor(Date.now() / 1000);
  if (binding.binding.expiresAt && binding.binding.expiresAt < now) {
    return fail("expired_challenge", ["Binding has expired"], false, false, true);
  }

  // 4. BCH proof
  let bchValid = false;
  if (!binding.bchProof?.signature) {
    details.push("Missing BCH proof");
  } else {
    const expectedMessage = buildBchSigningPayload(binding.binding);
    if (binding.bchProof.message !== expectedMessage) {
      details.push(
        "BCH signed message does not match the expected domain-separated payload"
      );
    } else if (binding.bchProof.address !== binding.binding.bch.address) {
      details.push("BCH proof address does not match binding address");
    } else {
      const bchResult = await verifyBchSignedMessage({
        message: binding.bchProof.message,
        address: binding.bchProof.address,
        signature: binding.bchProof.signature,
        network: binding.binding.bch.network,
      });
      if (bchResult.valid) {
        bchValid = true;
        details.push("BCH signature cryptographically valid");
      } else {
        details.push(`BCH signature invalid: ${bchResult.error || "verification failed"}`);
      }
    }
  }

  // 5. Nostr proof
  let nostrValid = false;
  if (!binding.nostrProof?.event) {
    details.push("Missing Nostr proof");
  } else {
    const struct = validateNostrBindingEventStructure(
      binding.nostrProof.event,
      binding.binding
    );
    if (!struct.ok) {
      details.push(...struct.errors);
    } else {
      const sigResult = await verifyNostrEventSignature(binding.nostrProof.event);
      if (sigResult.valid) {
        nostrValid = true;
        details.push("Nostr event signature cryptographically valid");
        details.push("Nostr event structure and binding references valid");
      } else {
        details.push(`Nostr signature invalid: ${sigResult.error || "verification failed"}`);
      }
    }
  }

  if (binding.revoked) {
    return {
      status: "revoked",
      binding,
      details: [...details, "Binding is marked revoked"],
      verifiedAt: now,
      bchValid,
      nostrValid,
      bindingMatch: false,
    };
  }

  if (binding.supersededBy) {
    return {
      status: "superseded",
      binding,
      details: [...details, `Superseded by ${binding.supersededBy}`],
      verifiedAt: now,
      bchValid,
      nostrValid,
      bindingMatch: false,
    };
  }

  if (bchValid && nostrValid) {
    return {
      status: "verified",
      binding,
      details: [
        ...details,
        "Both proofs valid and bound to the same canonical record",
      ],
      verifiedAt: now,
      bchValid: true,
      nostrValid: true,
      bindingMatch: true,
    };
  }

  if (!bchValid && !nostrValid) {
    return fail("incomplete_proof", details, false, false, false);
  }

  return fail("invalid_proof", details, bchValid, nostrValid, false);
}

function fail(
  status: VerificationStatus,
  details: string[],
  bchValid: boolean,
  nostrValid: boolean,
  bindingMatch: boolean
): VerificationResult {
  return {
    status,
    details,
    verifiedAt: Math.floor(Date.now() / 1000),
    bchValid,
    nostrValid,
    bindingMatch,
  };
}

export async function assertVerified(
  record: IdentityBinding | string
): Promise<IdentityBinding> {
  const result = await verifyBinding(record);
  if (result.status !== "verified" || !result.binding) {
    throw new Error(
      `Verification failed (${result.status}): ${result.details.join("; ")}`
    );
  }
  return result.binding;
}
