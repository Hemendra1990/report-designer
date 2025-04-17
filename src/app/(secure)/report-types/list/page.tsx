import ReportTypesListPage from "@/components/report-type/list/report-type-list-page";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ReportTypesListPage />
    </Suspense>
  );
}