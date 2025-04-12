import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import Navbar from "@/components/Navbar";
import ClientQueryProviders from "@/contexts/query-client-provider";
import { ReportTypeFormProvider } from "@/contexts/report-type-form-context";
import ClientIdProviders from "@/contexts/client-id-provider";
import { AuthProvider } from "@/contexts/auth-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Report Designer - Create Powerful Reports",
  description: "Create customized reports with our powerful and intuitive report designer. Easily analyze and visualize your data with flexible report types.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="min-h-screen bg-gray-50">
          <ClientQueryProviders>
            <ClientIdProviders>
              <AuthProvider>
                <ReportTypeFormProvider>
                  <Navbar />
                  <main>{children}</main>
                </ReportTypeFormProvider>
              </AuthProvider>
            </ClientIdProviders>
          </ClientQueryProviders>
        </div>
      </body>
    </html>
  );
}
