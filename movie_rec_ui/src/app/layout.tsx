import type { Metadata } from "next";
import StoreProvider from "./redux/StoreProvider";
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

export const metadata: Metadata = {
  title: "Movie-nn",
  description: "Movie neural network recommendation sevice",
  verification: {
    google: "57pFdPPhd6mY0-iBjFC5ttjcnqzmDY_41rkSo7I5qXU"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        { /* Provide the redux store to the application */}
        <StoreProvider>
            {children}
        </StoreProvider>
      </body>
    </html>
  );
}
