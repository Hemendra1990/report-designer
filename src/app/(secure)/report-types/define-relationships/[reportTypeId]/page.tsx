'use client';
import DefineRelationshipsForm from "@/components/report-type/define-relationship-form";
import { Suspense, use } from "react";

export default function DefineRelationshipsFormWrapper({ params }: { params: Promise<any> }) {
  const resolvedParams = use(params);
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DefineRelationshipsForm reportTypeId={resolvedParams.reportTypeId}  />
    </Suspense>
  );
}