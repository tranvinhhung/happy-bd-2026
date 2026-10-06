import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://happy-bd-2026.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: "Happy Birthday ♡",

  description:
    "Một món quà nhỏ dành cho người đặc biệt nhất của anh.",

  openGraph: {
    title: "Happy Birthday, My Love ♡",

    description:
      "Một món quà nhỏ dành cho người đặc biệt nhất của anh.",

    url: SITE_URL,

    siteName: "Happy Birthday ♡",

    type: "website",

    locale: "vi_VN",

    images: [
      {
        url: `${SITE_URL}/images/birthday-preview.png`,
        width: 1200,
        height: 630,
        alt: "Happy Birthday, My Love ♡",
        type: "image/png",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",

    title: "Happy Birthday, My Love ♡",

    description:
      "Một món quà nhỏ dành cho người đặc biệt nhất của anh.",

    images: [
      `${SITE_URL}/images/birthday-preview.png`,
    ],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
