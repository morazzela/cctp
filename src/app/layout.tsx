import "supports-color";
import "./styles/index.scss";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import { headers } from "next/headers";
import { type ReactNode } from "react";
import { cookieToInitialState } from "wagmi";
import { Analytics } from "@vercel/analytics/next"
import { getConfig } from "../wagmi";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

const satoshi = localFont({
  src: "./fonts/Satoshi.ttf",
  variable: "--font-satoshi",
  weight: "400 500 600 700 800 900",
});

export const metadata: Metadata = {
  title: "CCTP Bridge",
  description: "Bridge your USDC using Circle's CCTP bridge directly without any fees.",
};

export default function RootLayout(props: { children: ReactNode }) {
  const initialState = cookieToInitialState(
    getConfig(),
    headers().get("cookie"),
  );
  return (
    <html lang="en">
      <body className={`${inter.className} ${satoshi.className}`}>
        <Analytics/>
        <Providers initialState={initialState}>{props.children}</Providers>
      </body>
    </html>
  );
}
