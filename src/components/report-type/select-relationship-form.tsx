"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useReportTypeFormContext } from "@/contexts/report-type-form-context";
import { useAllTableMetadata } from "@/hooks/metadata-hook";


interface SelectRelationshipsFormProps {
    reportTypeId: string;
}

export default function SelectRelationshipsForm(props: SelectRelationshipsFormProps) {
  console.log("Create SelectRelationshipsForm page form------------------------");
  /* const searchParams = useSearchParams();
  const reportType = searchParams.get("type") || "";
  const primaryObject = searchParams.get("object") || "";
  const displayLabel = searchParams.get("label") || "";
  const apiName = searchParams.get("api") || "";
  const description = searchParams.get("desc") || ""; */
  const [relatedObjects, setRelatedObjects] = useState<string[]>([]);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const { reportType } = useReportTypeFormContext();
  const { data: allTableMetaData, isLoading } = useAllTableMetadata();

  // Get primary object details
  const primaryObjectDetails = allTableMetaData?.find(obj => obj.tableName === reportType.primaryTable);
  
  const handleSubmit = () => {
    // In a real app, this would submit to the server
    setShowSuccessMessage(true);
    
    // Reset after 3 seconds
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 3000);
  };

  useEffect(() => {
    if (reportType) {
        console.log(reportType);
    }
  }, [reportType])

  return (
    <div className="min-h-screen bg-muted/40">
      {/* Navigation Bar */}
      {/* <nav className="bg-primary text-primary-foreground py-4 px-6 shadow-md">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image 
              src="/next.svg" 
              alt="Report Designer Logo" 
              width={80} 
              height={20}
              className="dark:invert" 
            />
            <span className="font-bold text-lg">Report Designer</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost">Home</Button>
            </Link>
            <Link href="/report-types">
              <Button variant="ghost">Reports</Button>
            </Link>
          </div>
        </div>
      </nav> */}

      {/* Main Content */}
      <main className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Link href="/report-types" className="hover:text-foreground">Select Report Type</Link>
            <span>→</span>
            <Link href={`/report-types/select-object?type=${reportType}`} className="hover:text-foreground">
              Select Primary Object
            </Link>
            <span>→</span>
            <span className="text-foreground font-medium">Select Related Objects</span>
          </div>
          <h1 className="text-3xl font-bold mt-4 mb-2">Select Related Objects</h1>
          <p className="text-muted-foreground">
            Select related objects to define which records are included in reports using this report type.
          </p>
        </div>

        {/* Success Message */}
        {showSuccessMessage && (
          <div className="mb-8 bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-900 text-green-800 dark:text-green-300 p-4 rounded-md">
            <p className="flex items-center gap-2">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="text-green-600 dark:text-green-400"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span>Report type created successfully!</span>
            </p>
          </div>
        )}

        <div className="grid gap-8 md:grid-cols-[1fr_1fr]">
          {/* Left Side - Primary Object and Add Related */}
          <div className="space-y-6">
            <div className="p-6 border rounded-lg bg-background">
              <h2 className="text-xl font-bold mb-4">Select Objects</h2>
              
              {/* Primary Object */}
              <div className="mb-6">
                <div className="text-sm font-medium mb-2">Primary Object</div>
                <div className="flex items-center gap-4 p-4 border rounded-md">
                  <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-md">
                    {primaryObjectDetails && (
                      <Image 
                        src={''}
                        alt={primaryObjectDetails.displayName}
                        width={24}
                        height={24}
                        className="text-primary"
                      />
                    )}
                  </div>
                  <div>
                    <div className="font-medium">
                      {primaryObjectDetails?.displayName || "Selected Object"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Primary Object
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Add Related Object Button */}
              <button 
                className="w-full py-3 px-4 border border-dashed rounded-md text-center text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
                onClick={() => {
                  // This would open a modal in a real app
                  alert("In a real app, this would open a modal to select related objects");
                }}
              >
                (Click to relate another object)
              </button>
            </div>
            
            {/* Report Type Info */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-medium mb-4">Report Type Information</h3>
                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-[120px_1fr] gap-2">
                    <div className="font-medium text-muted-foreground">Label:</div>
                    <div>{reportType.label}</div>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] gap-2">
                    <div className="font-medium text-muted-foreground">API Name:</div>
                    <div>{reportType.name}</div>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] gap-2">
                    <div className="font-medium text-muted-foreground">Description:</div>
                    <div>{reportType.description}</div>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] gap-2">
                    <div className="font-medium text-muted-foreground">Report Type:</div>
                    <div className="capitalize">{reportType.typeGroup} Report</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Right Side - Relationship Diagram */}
          <div className="bg-white dark:bg-background border rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Object Relationships</h2>
            <div className="flex flex-col items-center justify-center h-[400px]">
              <div className="relative w-full max-w-xs">
                {/* Top circle - primary object */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border">
                  <div className="text-xl font-bold text-primary">
                    {primaryObjectDetails?.displayName.charAt(0) || "A"}
                  </div>
                </div>
                
                {/* Arrow connecting objects */}
                <div className="absolute top-16 left-1/2 -translate-x-1/2 h-32 w-0.5 bg-gray-300"></div>
                <div className="absolute top-[11.2rem] left-1/2 -translate-x-1/2 transform rotate-45 w-2 h-2 border-r-2 border-b-2 border-gray-300"></div>
                <div className="absolute top-[11.2rem] left-[calc(50%+2px)] -translate-x-1/2 transform -rotate-45 w-2 h-2 border-l-2 border-b-2 border-gray-300"></div>
                
                {/* Bottom box - report */}
                <div className="absolute top-48 left-1/2 -translate-x-1/2 w-32 h-20 bg-background border rounded-md flex flex-col items-center justify-center">
                  <div className="text-xl font-bold text-primary mb-1">
                    {primaryObjectDetails?.displayName.charAt(0) || "A"}
                  </div>
                  <div className="w-16 h-0.5 bg-gray-300"></div>
                  <div className="w-16 h-0.5 bg-gray-300 mt-2"></div>
                  <div className="w-16 h-0.5 bg-gray-300 mt-2"></div>
                </div>
              </div>
              
              <div className="text-center text-muted-foreground text-sm mt-80">
                This diagram shows how objects relate to each other in this report type
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-between">
          <Link href={`/report-types/select-object?type=${reportType}`}>
            <Button variant="outline">Back</Button>
          </Link>
          <div className="flex gap-4">
            <Link href="/report-types">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Link href={`/report-types/define-relationships?type=${reportType}&object=${reportType.primaryTable}&label=${encodeURIComponent(reportType.label || '')}&api=${encodeURIComponent(reportType.name || '')}&desc=${encodeURIComponent(reportType.description || '')}`}>
              <Button>Continue</Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}