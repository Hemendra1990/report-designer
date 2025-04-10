"use client";
import SelectRelationshipsForm from "@/components/report-type/select-relationship-form";

export default function SelectRelationshipPage({params}: {params: any}) {
  return <SelectRelationshipsForm reportTypeId={params.reportTypeId} ></SelectRelationshipsForm>
}