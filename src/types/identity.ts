/**
 * BCH Identity Bridge - Core Types
 * Protocol version 1.0.0
 */

export const PROTOCOL_ID = "bch-identity-bridge";
export const PROTOCOL_VERSION = "1.0.0";

/** Supported BCH networks */
export type BchNetwork = "mainnet" | "chipnet" | "testnet";

/** Status returned by the verifier */
export type VerificationStatus =
  | "verified"
  | "invalid_proof"
  | "incomplete_proof"
  | "expired_challenge"
  | "revoked"
  | "superseded"
  | "unsupported_format"
  | "verification_unavailable"
  | "replay_detected"
  | "audience_mismatch"
  | "nonce_mismatch"
  | "network_mismatch";

/** Canonical binding record (before proofs) */
export interface CanonicalBinding {
  protocol: typeof PROTOCOL_ID;
  version: typeof PROTOCOL_VERSION;
  bindingId: string; // deterministic hash of the rest of the fields + creation intent
  bch: {
    network: BchNetwork;
    address: string; // cashaddr preferred
    addressType?: "p2pkh" | "p2sh";
  };
  nostr: {
    pubkey: string; // hex, 64 chars
  };
  createdAt: number; // unix seconds
  expiresAt?: number; // optional binding lifetime
  purpose: string; // e.g. "identity-binding-v1"
  nonce: string; // 32-byte hex random
}

/** BCH signed-message proof */
export interface BchProof {
  message: string; // exact payload that was signed
  signature: string; // base64
  address: string;
  network: BchNetwork;
}

/** Nostr event proof (simplified; full event is stored) */
export interface NostrProof {
  event: {
    id: string;
    pubkey: string;
    created_at: number;
    kind: number;
    tags: string[][];
    content: string;
    sig: string;
  };
}

/** Complete binding with both proofs */
export interface IdentityBinding {
  binding: CanonicalBinding;
  bchProof: BchProof;
  nostrProof: NostrProof;
  publishedAt?: number;
  eventId?: string; // Nostr event id of the published binding
  revoked?: boolean;
  supersededBy?: string;
}

/** Challenge for authentication */
export interface AuthChallenge {
  challengeId: string;
  nonce: string;
  audience: string; // origin or verifier id
  action: string;
  issuedAt: number;
  expiresAt: number;
  bindingId?: string; // optional pre-selected binding
}

/** Signed response to a challenge */
export interface AuthResponse {
  challengeId: string;
  bindingId: string;
  bchSignature?: string;
  nostrEvent?: NostrProof["event"];
  respondedAt: number;
}

/** Result of independent verification */
export interface VerificationResult {
  status: VerificationStatus;
  binding?: IdentityBinding;
  details: string[];
  verifiedAt: number;
  bchValid: boolean;
  nostrValid: boolean;
  bindingMatch: boolean;
}

/** Error codes for structured handling */
export enum IdentityErrorCode {
  INVALID_CANONICAL = "INVALID_CANONICAL",
  INVALID_BCH_SIGNATURE = "INVALID_BCH_SIGNATURE",
  INVALID_NOSTR_SIGNATURE = "INVALID_NOSTR_SIGNATURE",
  BINDING_ID_MISMATCH = "BINDING_ID_MISMATCH",
  NONCE_MISMATCH = "NONCE_MISMATCH",
  EXPIRED = "EXPIRED",
  REPLAY = "REPLAY",
  WRONG_NETWORK = "WRONG_NETWORK",
  UNSUPPORTED_VERSION = "UNSUPPORTED_VERSION",
  MALFORMED = "MALFORMED",
  RELAY_ERROR = "RELAY_ERROR",
}
