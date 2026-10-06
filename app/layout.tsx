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


export const metadata = {
  metadataBase: new URL("https://happy-bd-2026.vercel.app"),

  title: "A Little Birthday Gift For You ♡",

  description:
    "Có một món quà nhỏ anh đã chuẩn bị dành riêng cho em... ♡",

  openGraph: {
    title: "Happy Birthday, My Love ♡",

    description:
      "Một món quà nhỏ dành cho người đặc biệt nhất của anh.",

    url: "https://happy-bd-2026.vercel.app",

    siteName: "Happy Birthday ♡",

    images: [
      {
        url: "/images/birthday-preview.png",
        width: 1200,
        height: 630,
        alt: "Happy Birthday ♡",
      },
    ],

    locale: "vi_VN",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "Happy Birthday, My Love ♡",

    description:
      "Một món quà nhỏ dành cho người đặc biệt nhất của anh.",

    images: ["/images/birthday-preview.png"],
  },

  icons: {
    icon: "/favicon.ico",
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
