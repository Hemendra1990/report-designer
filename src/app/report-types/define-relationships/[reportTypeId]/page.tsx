"use client";
import DefineRelationshipsForm from "@/components/report-type/define-relationship-form";
import { useParams } from "next/navigation";

export default function SelectRelationshipPage() {

  const { reportTypeId } = useParams()
  
    if (!reportTypeId) {
      return <div>Loading...</div> // or handle gracefully
    }
  return <DefineRelationshipsForm reportTypeId={reportTypeId as string } ></DefineRelationshipsForm>
}