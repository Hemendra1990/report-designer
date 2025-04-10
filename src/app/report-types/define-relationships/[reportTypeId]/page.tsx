"use client";
import DefineRelationshipsForm from "@/components/report-type/define-relationship-form";

export default function SelectRelationshipPage({params}: {params: any}) {
  return <DefineRelationshipsForm reportTypeId={params.reportTypeId} ></DefineRelationshipsForm>
}