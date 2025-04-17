"use client";
import SelectRelationshipsForm from "@/components/report-type/select-relationship-form";
import { Suspense } from "react";

export default function SelectRelationshipPage({ params }: { params: any }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SelectRelationshipsForm reportTypeId={params.reportTypeId} />
    </Suspense>
  );
}