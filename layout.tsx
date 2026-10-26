import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/Nav";

export const metadata: Metadata = {
  title: "BCH Identity Bridge",
  description:
    "One identity. Two sovereign keys. No central authority. Cryptographically link Bitcoin Cash and Nostr identities.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <div className="flex min-h-screen flex-col">
          <Nav />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-surface-elevated py-8 text-center text-sm text-slate-500">
            <p>
              BCH Identity Bridge · Independent project for the Paytaca BCH bounty ·{" "}
              <span className="text-bch">No private keys ever leave your wallet</span>
            </p>
          </footer>
        </div>
      </body>
    </html>
  );
}
