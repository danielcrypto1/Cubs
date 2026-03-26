import type { Metadata } from "next";
import { Nunito, Lilita_One } from "next/font/google";
import { ThemeProvider } from "@/providers/theme-provider";
import { Web3Provider } from "@/providers/web3-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CustomCursor } from "@/components/shared/custom-cursor";
import { AnimatedPage } from "@/components/shared/animated-page";
import { ScrollToTop } from "@/components/shared/scroll-to-top";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
});

const lilitaOne = Lilita_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-lilita",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CUBS Platform",
  description: "The CUBS NFT ecosystem on Ethereum",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${nunito.variable} ${lilitaOne.variable} min-h-screen bg-background text-foreground antialiased`}>
        <ThemeProvider>
          <Web3Provider>
            <CustomCursor />
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="w-full flex-1 py-8">
                <AnimatedPage>{children}</AnimatedPage>
              </main>
              <Footer />
              <ScrollToTop />
            </div>
          </Web3Provider>
        </ThemeProvider>
      </body>
    </html>
  );
}
