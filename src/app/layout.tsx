import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { AppStateProvider } from "@/lib/providers/state-provider";
import { SupabaseUserProvider } from "@/lib/providers/supabase-user-provider";
import { SubscriptionModalProvider } from "@/lib/providers/subscription-modal-provider";
import { getActiveProductsWithPrice } from "@/lib/supabase/queries";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cypress | Notion Clone",
  description:
    "A collaborative workspace where better, faster work happens. Your all-in-one workspace.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { data: products } = await getActiveProductsWithPrice();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <AppStateProvider>
            <SupabaseUserProvider>
              <SubscriptionModalProvider products={products ?? []}>
                {children}
                <Toaster />
              </SubscriptionModalProvider>
            </SupabaseUserProvider>
          </AppStateProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
