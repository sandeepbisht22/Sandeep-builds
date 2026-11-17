import type { Metadata, Viewport } from "next";
import { Anybody, Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { Cursor } from "@/components/chrome/Cursor";
import { Grain } from "@/components/chrome/Grain";
import { site } from "@/content/site";
import "./globals.css";

const anybody = Anybody({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-anybody",
  display: "swap",
});

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${site.name} builds things`,
    template: `%s · ${site.name}`,
  },
  description: `${site.role} from ${site.city}. ${site.intro} ${site.tagline}`,
};

export const viewport: Viewport = {
  themeColor: "#0e1124",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${anybody.variable} ${hanken.variable} ${jetbrains.variable}`}>
      <body>
        <SmoothScroll />
        {children}
        <Cursor />
        <Grain />
      </body>
    </html>
  );
}
