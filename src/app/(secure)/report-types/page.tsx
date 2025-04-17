'use client';
import ReportTypesPage from "@/components/report-type/report-type-page";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ReportTypesPage />
    </Suspense>
  );
}