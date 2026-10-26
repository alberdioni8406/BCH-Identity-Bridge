/**
 * Local (browser) storage for identity bindings.
 * Never stores private keys. Only public binding records.
 */

import type { IdentityBinding } from "../../types/identity";

const STORAGE_KEY = "bch-identity-bridge:bindings";

export function loadLocalBindings(): IdentityBinding[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveLocalBinding(binding: IdentityBinding): void {
  if (typeof window === "undefined") return;
  const existing = loadLocalBindings();
  const idx = existing.findIndex(
    (b) => b.binding.bindingId === binding.binding.bindingId
  );
  if (idx >= 0) {
    existing[idx] = binding;
  } else {
    existing.unshift(binding);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
}

export function removeLocalBinding(bindingId: string): void {
  if (typeof window === "undefined") return;
  const existing = loadLocalBindings().filter(
    (b) => b.binding.bindingId !== bindingId
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
}

export function clearLocalBindings(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
