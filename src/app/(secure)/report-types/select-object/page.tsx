'use client';
import SelectObjectForm from "@/components/report-type/select-object-form";
import { Suspense } from "react";

export default function ReportTypeSelectionPage() {
  return <Suspense fallback={<div>Loading...</div>}>
    <SelectObjectForm reportTypeId="" ></SelectObjectForm>
  </Suspense>
}