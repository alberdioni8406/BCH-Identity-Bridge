/**
 * Public entry point for the reusable verification library.
 * Other applications can import from here.
 */

export * from "./canonicalize";
export * from "./binding";
export * from "./verify";
export * from "./storage";
export type {
  CanonicalBinding,
  IdentityBinding,
  VerificationResult,
  VerificationStatus,
  AuthChallenge,
  AuthResponse,
  BchNetwork,
} from "../../types/identity";
