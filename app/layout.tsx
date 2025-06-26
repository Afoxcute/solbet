import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "react-hot-toast";
import PrivyAuth from "@/components/PrivyAuth";

export const metadata: Metadata = {
  title: "90+: The Future of Live Football Engagement",
  description: "Step into the Comment Hub, where fans from all over the world connect to debate, celebrate, and Interact in real-time.",
  icons: {
    icon: '/logo.png'
  }
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <body className="font-inter">
        <Providers>
          <PrivyAuth>
            <Toaster />
            {children}
          </PrivyAuth>
        </Providers>
      </body>
    </html>
  );
}
