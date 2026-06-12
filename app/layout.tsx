import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MMS2026 - Mihajlo Stankovic softver za obradu slika",
  description: "Multimadijalni sistemi 2026 - Obrada slika",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sr" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-gray-100 text-gray-900">
        {children}
      </body>
    </html>
  );
}
