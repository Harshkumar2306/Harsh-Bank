import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Harsh Bank Admin",
  description: "Virtual Bank Central Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        // @ts-expect-error - Clerk types are mismatched with @clerk/themes in this version
        baseTheme: dark,
        variables: {
          colorPrimary: '#10b981',
          colorBackground: '#020817',
        },
        elements: {
          card: "bg-[#020817]/90 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-[2rem]",
          headerTitle: "text-white font-black text-2xl tracking-tighter",
          headerSubtitle: "text-gray-400",
          socialButtonsBlockButton: "bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-all rounded-xl",
          dividerLine: "bg-white/10",
          dividerText: "text-gray-500",
          formFieldLabel: "text-gray-300 font-semibold",
          formFieldInput: "bg-black/50 border border-white/10 text-white rounded-xl focus:border-emerald-500 transition-all",
          formButtonPrimary: "bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all",
          footerActionText: "text-gray-400",
          footerActionLink: "text-emerald-400 hover:text-emerald-300 font-bold",
        }
      }}
    >
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col bg-gray-900 text-white">{children}</body>
      </html>
    </ClerkProvider>
  );
}
