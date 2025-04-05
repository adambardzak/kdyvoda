import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KdyVoda - Event Scheduling",
  description: "Schedule your water rafting events with friends easily",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-slate-50">
      <body className={`${inter.className} h-full antialiased`}>
        <div className="min-h-full flex flex-col">
          <nav className="bg-white border-b border-slate-200">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 items-center justify-between">
                <div className="flex items-center">
                  <Link 
                    href="/" 
                    className="flex items-center group"
                  >
                    <svg
                      className="h-8 w-8 text-blue-600 group-hover:text-blue-700 transition-colors"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    <span className="ml-2.5 text-xl font-semibold text-slate-900">KdyVoda</span>
                  </Link>
                </div>
                <div className="flex items-center">
                  <Link
                    href="/"
                    className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-150"
                  >
                    Create Event
                  </Link>
                </div>
              </div>
            </div>
          </nav>

          <main className="flex-1 py-12 bg-slate-50">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>

          <footer className="bg-white border-t border-slate-200">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
              <p className="text-center text-sm text-slate-600">
                KdyVoda — Schedule your water rafting events with friends easily
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
