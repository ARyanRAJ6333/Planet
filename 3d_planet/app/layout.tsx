import type { Metadata } from "next";
import localfont from "next/font/local";

import "../styles/main.css";

const inter = localfont({
  src: [
    {
      path: "../public/fonts/Inter/InterVariable.woff2",
      style: "normal",
      weight: "100 900",
    },
    {
      path: "../public/fonts/Inter/InterVariable-Italic.woff2",
      style: "italic",
      weight: "100 900",
    },
  ],
  display: "swap",
  variable: "--inter",
});

const appleGaramond = localfont({
  src: [
    {
      path: "../public/fonts/AppleGaramond/AppleGaramond.woff2",
      style: "normal",
      weight: "400",
    },
    {
      path: "../public/fonts/AppleGaramond/AppleGaramond-Italic.woff2",
      style: "italic",
      weight: "400",
    },
    {
      path: "../public/fonts/AppleGaramond/AppleGaramond-Light.woff2",
      style: "normal",
      weight: "300",
    },
    {
      path: "../public/fonts/AppleGaramond/AppleGaramond-LightItalic.woff2",
      style: "italic",
      weight: "300",
    },
    {
      path: "../public/fonts/AppleGaramond/AppleGaramond-Bold.woff2",
      style: "normal",
      weight: "700",
    },
    {
      path: "../public/fonts/AppleGaramond/AppleGaramond-BoldItalic.woff2",
      style: "italic",
      weight: "700",
    },
  ],
  variable: "--apple-garamond",
});

export const metadata: Metadata = {
  title: "Planet | 3D World Experience",
  description:
    "An immersive Three.js + React landing page with a cinematic 3D planet and smooth scroll animation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${appleGaramond.variable}`}>
        {children}
      </body>
    </html>
  );
}
