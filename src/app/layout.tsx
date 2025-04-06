import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import Background from "@/components/Background";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KdyVoda - Vodácký Plánovač Eventu",
  description: "Naplánuj si vodáckou akci s kámošema bez problémů",
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png', sizes: '32x32' },
      { url: '/apple-icon.png', type: 'image/png', sizes: '180x180' },
    ],
  },
  openGraph: {
    title: "KdyVoda - Vodácký Plánovač Eventu",
    description: "Naplánuj si vodáckou akci s kámošema bez streamů",
    images: [
      {
        url: '/api/og',
        width: 1200,
        height: 630,
        alt: 'KdyVoda - Vodácký Plánovač Eventu',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "KdyVoda - Vodácký Plánovač Eventu",
    description: "Naplánuj si vodáckou akci s kámošema bez streamů",
    images: ['/api/og'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="cs" className="h-full bg-slate-50">
      <body className={`${inter.className} h-full`}>
        <Background />
        <div className="min-h-full">
          <nav className="bg-white shadow-sm">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 justify-between">
                <div className="flex">
                  <Link
                    href="/"
                    className="flex items-center px-2 text-lg font-semibold text-slate-900"
                  >
                    KdyVoda
                  </Link>
                </div>
              </div>
            </div>
          </nav>

          <main>
            <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>

          <footer className="bg-white mt-auto border-t border-slate-200">
            <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
              <p className="text-center text-sm text-slate-500">
                &copy; {new Date().getFullYear()} KdyVoda. Všechna práva v klídku.
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
