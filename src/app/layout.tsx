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
        variables: {
          colorPrimary: '#10b981',
          colorBackground: '#0f172a',
          colorText: 'white',
          colorDanger: '#ef4444',
          colorSuccess: '#22c55e',
        },
        elements: {
          card: "bg-slate-900 border border-slate-800 shadow-2xl",
          headerTitle: "text-white font-bold",
          headerSubtitle: "text-slate-400",
          socialButtonsBlockButton: "text-white border border-slate-700 hover:bg-slate-800 transition-all",
          socialButtonsBlockButtonText: "text-white font-semibold",
          dividerLine: "bg-slate-700",
          dividerText: "text-slate-400",
          formFieldLabel: "text-slate-300",
          formFieldInput: "bg-slate-800 border-slate-700 text-white focus:ring-emerald-500 focus:border-emerald-500 transition-all",
          formButtonPrimary: "bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-bold transition-all",
          footerActionText: "text-slate-400",
          footerActionLink: "text-emerald-500 hover:text-emerald-400 font-semibold",
          identityPreviewText: "text-white",
          formFieldAction: "text-emerald-500 hover:text-emerald-400"
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
