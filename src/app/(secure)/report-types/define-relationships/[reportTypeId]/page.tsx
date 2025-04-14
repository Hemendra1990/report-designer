import DefineRelationshipsForm from "@/components/report-type/define-relationship-form";

export default async function SelectRelationshipPage({ params }: { params: Promise<{ reportTypeId: string }> }) {

  const { reportTypeId } = await params
  if (!reportTypeId) {
    return <div>Loading...</div> // or handle gracefully
  }
  return <DefineRelationshipsForm reportTypeId={reportTypeId as string} ></DefineRelationshipsForm>
}