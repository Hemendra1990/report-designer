'use client';
import SelectObjectForm from "@/components/report-type/select-object-form";
import { Suspense } from "react";

export default function ReportTypeSelectionPage({ params }: { params: any }) {

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SelectObjectForm reportTypeId={params?.reportTypeId} ></SelectObjectForm>;
        </Suspense>
    );
}