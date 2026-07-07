import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import "./globals.css";
import AppLayout from "@/components/layout/AppLayout";
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: "EventSphere",
  description: "Create. Manage. Attend.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
<html
  lang="en"
  suppressHydrationWarning
  className={`${inter.variable} ${playfair.variable} h-full antialiased`}
>
     <body className="min-h-screen flex flex-col bg-background">
  <ThemeProvider>
    <AppLayout>
  {children}
</AppLayout>

    <Toaster
      richColors
      position="top-right"
    />
  </ThemeProvider>
</body>
    </html>
  );
}
