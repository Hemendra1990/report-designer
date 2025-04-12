import Navbar from "@/components/Navbar";
import ClientQueryProviders from "@/contexts/query-client-provider";
import { ReportTypeFormProvider } from "@/contexts/report-type-form-context";
import ClientIdProviders from "@/contexts/client-id-provider";
import { AuthProvider } from "@/contexts/auth-provider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
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
  );
}
