import "supports-color";
import "./index.css";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import { type ReactNode } from "react";
import { Analytics } from "@vercel/analytics/next";
import dynamic from "next/dynamic";
import { headers } from "next/headers";

const Providers = dynamic(() => import("./providers"), { ssr: false });

const inter = Inter({ subsets: ["latin"] });

const satoshi = localFont({
  src: "./fonts/Satoshi.ttf",
  variable: "--font-satoshi",
  weight: "400 500 600 700 800 900",
});

export const metadata: Metadata = {
  title: "CCTP Bridge",
  description: "Move your USDC instantly with zero added fees.",
  openGraph: {
    title: "CCTP Bridge",
    description: "Move your USDC instantly with zero added fees.",
    images: "/images/preview.png",
  },
  twitter: {
    title: "CCTP Bridge",
    description: "Move your USDC instantly with zero added fees.",
    images: "/images/preview.png",
  },
};

export const viewport: Viewport = {
  initialScale: 1,
  minimumScale: 1, 
};

export default async function RootLayout(props: { children: ReactNode }) {
  const cookies = await headers().get("cookie");

  return (
    <html lang="en">
      <body
        className={`${inter.className} ${satoshi.variable} text-sm bg-lighter dark:bg-dark bg-cover text-darker dark:text-light font-satoshi overflow-x-hidden`}
      >
        <Analytics />
        <Providers cookies={cookies}>{props.children}</Providers>
      </body>
    </html>
  );
}
