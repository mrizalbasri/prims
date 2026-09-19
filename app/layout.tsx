import type { Metadata } from "next";
import { Hanken_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'PRISM — President Readiness in English Skill Measurement',
  description: 'Platform placement test Bahasa Inggris + modul pembelajaran mandiri berbasis AI untuk mahasiswa.',
  keywords: [
    "PRISM",
    "placement test bahasa inggris",
    "tes kemampuan bahasa inggris online",
    "platform belajar bahasa inggris berbasis ai",
    "prism english placement test",
    "latihan writing feedback ai",
    "latihan speaking bahasa inggris ai",
    "vocabulary flashcard mahasiswa",
    "edtech kampus indonesia",
    "english skill measurement",
    "president university english test"
  ],
  authors: [{ name: "PRISM Team" }],
  applicationName: "PRISM",
  openGraph: {
    title: "PRISM — AI-Powered English Placement Test & Learning Platform",
    description: "Platform placement test Bahasa Inggris dan modul pembelajaran mandiri berbasis AI untuk mahasiswa.",
    siteName: "PRISM",
    locale: "id_ID",
    type: "website",
  },
  icons: { icon: '/favicon.ico', apple: '/logo.webp' },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body
        className={`${hankenGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
