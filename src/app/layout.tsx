import "supports-color";
import "./index.css";
import "@rainbow-me/rainbowkit/styles.css";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import { type ReactNode } from "react";
import { Analytics } from "@vercel/analytics/next";
import dynamic from "next/dynamic";

const Providers = dynamic(() => import("./providers"), { ssr: false });

const inter = Inter({ subsets: ["latin"] });

const satoshi = localFont({
  src: "./fonts/Satoshi.ttf",
  variable: "--font-satoshi",
  weight: "400 500 600 700 800 900",
});

export const metadata: Metadata = {
  title: "CCTP Bridge",
  description:
    "Bridge your USDC using Circle's CCTP bridge directly without any fees.",
};

export const viewport: Viewport = {
  initialScale: 1,
  minimumScale: 1,
};

export default function RootLayout(props: { children: ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} ${satoshi.variable} text-sm bg-lighter dark:bg-dark bg-cover text-darker dark:text-light font-satoshi overflow-x-hidden`}
      >
        <Analytics />
        <Providers>{props.children}</Providers>
      </body>
    </html>
  );
}
