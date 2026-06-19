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
      appearance={({
        variables: {
          colorPrimary: '#10b981',
          colorBackground: '#1e293b',
          colorText: '#ffffff',
          colorDanger: '#ef4444',
          colorSuccess: '#22c55e',
        },
        elements: {
          card: "bg-slate-800 border border-slate-700 shadow-2xl",
          headerTitle: "!text-white font-black text-2xl",
          headerSubtitle: "!text-slate-200 font-medium",
          socialButtonsBlockButton: "!text-white border border-slate-600 hover:bg-slate-700 transition-all",
          socialButtonsBlockButtonText: "!text-white font-bold",
          dividerLine: "bg-slate-600",
          dividerText: "!text-slate-300",
          formFieldLabel: "!text-white font-bold",
          formFieldInput: "bg-slate-900 border-slate-600 !text-white focus:ring-emerald-500 focus:border-emerald-500 transition-all",
          formButtonPrimary: "bg-emerald-500 hover:bg-emerald-400 !text-slate-900 font-black transition-all",
          footerActionText: "!text-slate-300",
          footerActionLink: "text-emerald-400 hover:text-emerald-300 font-bold",
          identityPreviewText: "!text-white font-bold",
          formFieldAction: "text-emerald-500 hover:text-emerald-400"
        }
      }) as any}
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
