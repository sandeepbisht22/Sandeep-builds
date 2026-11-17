import type { Metadata, Viewport } from "next";
import { Archivo, Instrument_Sans, Space_Mono } from "next/font/google";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { Cursor } from "@/components/chrome/Cursor";
import { Grain } from "@/components/chrome/Grain";
import { site } from "@/content/site";
import "./globals.css";

// "Matchday" type: a scoreboard grotesk for display, a clean sans for reading, a retro mono for code.
// The CSS variables are named by role so canvas textures and globals.css don't care which face it is.
const display = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--face-display",
  display: "swap",
});

const body = Instrument_Sans({
  subsets: ["latin"],
  variable: "--face-body",
  display: "swap",
});

const code = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--face-code",
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
    <html lang="en" className={`${display.variable} ${body.variable} ${code.variable}`}>
      <body>
        <SmoothScroll />
        {children}
        <Cursor />
        <Grain />
      </body>
    </html>
  );
}
