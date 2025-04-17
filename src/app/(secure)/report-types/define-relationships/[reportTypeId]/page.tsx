'use client';
import DefineRelationshipsForm from "@/components/report-type/define-relationship-form";
import { Suspense } from "react";

export default function DefineRelationshipsFormWrapper({ params }: { params: any }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DefineRelationshipsForm reportTypeId={params?.reportTypeId} />
    </Suspense>
  );
}