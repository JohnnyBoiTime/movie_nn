import type { Metadata } from "next";
import StoreProvider from "./redux/StoreProvider";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://movie-nn.vercel.app"),
  title: "Movie-nn",
  robots: {index: true, follow: true},
  alternates: {canonical: "/"},
  description: "Movie neural network recommendation service. Uses a pre-trained neural network to recommend movies based on genres",
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
