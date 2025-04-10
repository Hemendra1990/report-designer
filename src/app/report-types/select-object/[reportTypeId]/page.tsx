import SelectObjectForm from "@/components/report-type/select-object-form";

export default function ReportTypeSelectionPage({ params }: { params: any }) {
    console.log("Edit report type page ------------------------");
    return <SelectObjectForm reportTypeId={params?.reportTypeId} ></SelectObjectForm>;
}