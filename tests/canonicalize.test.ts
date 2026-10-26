import { describe, it, expect } from "vitest";
import { canonicalize, computeBindingId, buildBchSigningPayload } from "../src/lib/identity/canonicalize";
import { createCanonicalBinding } from "../src/lib/identity/binding";

describe("canonicalize", () => {
  it("produces deterministic key order", () => {
    const a = canonicalize({ b: 1, a: 2 });
    const b = canonicalize({ a: 2, b: 1 });
    expect(a).toBe(b);
    expect(a).toBe('{"a":2,"b":1}');
  });

  it("rejects non-finite numbers", () => {
    expect(() => canonicalize({ x: Infinity })).toThrow();
  });
});

describe("binding creation", () => {
  it("creates a binding with matching bindingId", async () => {
    const binding = await createCanonicalBinding({
      bchAddress: "bitcoincash:qpum6dwnqmmyscjxju4q23x5tg5qjgxlfal49a43ld",
      bchNetwork: "mainnet",
      nostrPubkey: "3bf0c63fcb8d0d8b6a8fcb3c7f5cb2a972f8a0b5a3d6d8790bb2d4e4f0d6b1c2",
    });
    expect(binding.protocol).toBe("bch-identity-bridge");
    expect(binding.version).toBe("1.0.0");
    expect(binding.bindingId).toHaveLength(64);
    expect(binding.nonce).toHaveLength(64);

    // Recompute must match
    const { computeBindingId } = await import("../src/lib/identity/canonicalize");
    const recomputed = await computeBindingId({
      bch: binding.bch,
      nostr: binding.nostr,
      createdAt: binding.createdAt,
      purpose: binding.purpose,
      nonce: binding.nonce,
    });
    expect(recomputed).toBe(binding.bindingId);
  });

  it("produces domain-separated BCH payload", async () => {
    const binding = await createCanonicalBinding({
      bchAddress: "bitcoincash:qpum6dwnqmmyscjxju4q23x5tg5qjgxlfal49a43ld",
      bchNetwork: "mainnet",
      nostrPubkey: "3bf0c63fcb8d0d8b6a8fcb3c7f5cb2a972f8a0b5a3d6d8790bb2d4e4f0d6b1c2",
    });
    const msg = buildBchSigningPayload(binding);
    expect(msg.startsWith("bch-identity-bridge/bch-proof/v1.0.0\n")).toBe(true);
    expect(msg).toContain(binding.bindingId);
  });
});
