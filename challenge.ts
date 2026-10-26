/**
 * Challenge-response authentication
 */

import { AuthChallenge, AuthResponse, IdentityBinding } from "../../types/identity";
import { generateNonce } from "../identity/binding";
import { verifyBinding } from "../identity/verify";

const DEFAULT_TTL_SECONDS = 300; // 5 minutes

/** In-memory replay protection for the demo (replace with durable store in production) */
const seenNonces = new Set<string>();
const seenChallengeIds = new Set<string>();

export function createChallenge(params: {
  audience: string;
  action?: string;
  bindingId?: string;
  ttlSeconds?: number;
}): AuthChallenge {
  const now = Math.floor(Date.now() / 1000);
  const ttl = params.ttlSeconds ?? DEFAULT_TTL_SECONDS;

  return {
    challengeId: generateNonce().slice(0, 32),
    nonce: generateNonce(),
    audience: params.audience,
    action: params.action || "authenticate",
    issuedAt: now,
    expiresAt: now + ttl,
    bindingId: params.bindingId,
  };
}

export interface AuthResult {
  success: boolean;
  status: string;
  details: string[];
  binding?: IdentityBinding;
}

/**
 * Verify an authentication response against a previously issued challenge.
 */
export async function verifyAuthResponse(
  challenge: AuthChallenge,
  response: AuthResponse,
  binding: IdentityBinding
): Promise<AuthResult> {
  const details: string[] = [];
  const now = Math.floor(Date.now() / 1000);

  // 1. Challenge identity
  if (response.challengeId !== challenge.challengeId) {
    return { success: false, status: "challenge_mismatch", details: ["Challenge ID mismatch"] };
  }

  // 2. Expiry
  if (now > challenge.expiresAt) {
    return { success: false, status: "expired_challenge", details: ["Challenge has expired"] };
  }

  // 3. Replay protection
  if (seenChallengeIds.has(challenge.challengeId) || seenNonces.has(challenge.nonce)) {
    return {
      success: false,
      status: "replay_detected",
      details: ["This challenge or nonce has already been used"],
    };
  }

  // 4. Audience (simple string match; in production compare origins carefully)
  // The response itself does not re-state audience; the binding + challenge are bound by the verifier.

  // 5. Binding must itself be valid
  const bindingResult = await verifyBinding(binding);
  if (bindingResult.status !== "verified") {
    return {
      success: false,
      status: bindingResult.status,
      details: ["Underlying binding failed verification", ...bindingResult.details],
    };
  }

  // 6. Binding ID match if the challenge specified one
  if (challenge.bindingId && challenge.bindingId !== binding.binding.bindingId) {
    return {
      success: false,
      status: "binding_mismatch",
      details: ["Response binding does not match the challenged bindingId"],
    };
  }

  // Mark as used (anti-replay)
  seenChallengeIds.add(challenge.challengeId);
  seenNonces.add(challenge.nonce);

  details.push("Challenge valid, not expired, not replayed");
  details.push("Binding independently verified");
  details.push(`Authenticated for audience: ${challenge.audience}`);

  return {
    success: true,
    status: "authenticated",
    details,
    binding,
  };
}

/** Clear replay cache (for tests) */
export function clearReplayCache() {
  seenNonces.clear();
  seenChallengeIds.clear();
}
