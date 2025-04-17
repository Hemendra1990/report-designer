'use client';
import DefineRelationshipsForm from "@/components/report-type/define-relationship-form";
import { Suspense } from "react";

export default function SelectRelationshipPage() {

  return (
      <Suspense fallback={<div>Loading...</div>}>
        <DefineRelationshipsForm reportTypeId={""} ></DefineRelationshipsForm>
      </Suspense>
    );
}