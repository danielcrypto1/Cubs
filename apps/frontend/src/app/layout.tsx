import type { Metadata } from "next";
import { ThemeProvider } from "@/providers/theme-provider";
import { Web3Provider } from "@/providers/web3-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "CUBS Platform",
  description: "The CUBS NFT ecosystem on Ethereum",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeProvider>
          <Web3Provider>
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
                {children}
              </main>
              <Footer />
            </div>
          </Web3Provider>
        </ThemeProvider>
      </body>
    </html>
  );
}
