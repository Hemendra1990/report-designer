"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useReportTypeFormContext } from "@/contexts/report-type-form-context";
import { useDeleteReportType, useReportTypeById } from "@/hooks/report-type-hook";
import { useAllTableMetadata } from "@/hooks/metadata-hook";
import { ReportTypeConfig } from "@/components/model/report-type";
import ToastMessage from "@/app/(secure)/report-types/summary/summary-helper";
import { useRouter } from "next/navigation";

// Sample list of available objects for reference (same as in other pages)

// Define interface for related objects
interface RelatedObject {
  objectId: string;
  relationshipType: 'inner' | 'left' | 'right' | 'outer';
  parentId: string | null;
}

interface ReportTypeSummaryPageProps {
    reportTypeId: string
}

export default function ReportTypeSummaryPage(props: ReportTypeSummaryPageProps) {
  const { reportTypeId } = props;
  const { reportType,setReportType } =useReportTypeFormContext();
  const { data: availableObjects } = useAllTableMetadata();
  const deleteReportType = useDeleteReportType();
  const [showDeleteToast, setShowDeleteToast] = useState(false);
  const router = useRouter();
  const { reportTypeResponse } = useReportTypeById(reportTypeId);

  useEffect(() => {
    if (reportTypeResponse?.data?.layoutList) {
      setReportType((prev) => ({
        ...prev,
        layoutList: reportTypeResponse?.data?.layoutList || [],
      }));
    }
  }, [reportTypeResponse?.data?.layoutList]);
  
  // Get related object details with field counts
  const getObjectDetails = () => {
    const result = [];
    
    // Add primary object first
    if (reportType?.primaryTable) {
      result.push({
        id: reportType?.primaryTable,
        name: reportType?.name,
        color: '#5C6BC0',
        fieldCount: reportType?.layoutList?.filter(l => l.tableName === reportType?.primaryTable).length || 0,
        relationshipType: "primary"
      });
    }
    
    // Add related objects
    (reportType?.configList || []).forEach(relObj => {
      const objDetails = (availableObjects || []).find(obj => obj.tableName === relObj.joinTableName);
      if (!objDetails) return;
      
      const parentObject = (availableObjects || []).find(obj => obj.id === relObj.primaryTableName);
      
      const parentName = parentObject?.displayName || "Unknown";
      
      result.push({
        id: objDetails.id,
        name: objDetails.displayName,
        color: '#5C6BC0',
        fieldCount: reportType?.layoutList?.filter(l => l.tableName === objDetails.tableName).length || 0,
        relationshipType: relObj.joinType,
        parentName: parentName
      });
    });
    
    return result;
  };


  const handleDelete = () => {
    deleteReportType.mutate(
      { reportTypeId: reportType?.id as string },
      {
        onSuccess: () => {
          setShowDeleteToast(true);
          setTimeout(() => setShowDeleteToast(false), 3000);
        },
        onError: (error) => {
          console.error("Error during deletion:", error);
        },
      }
    );
  };

  const handleEdit = () => {
    router.push(`/report-types/define-relationships/${reportType?.id}`)
  }
  
  const relatedObjectsDetails = getObjectDetails();
  
  // Calculate total field count
  const totalFieldCount = relatedObjectsDetails.reduce((total, obj) => total + obj.fieldCount, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <main className="container mx-auto py-8 px-4">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{reportType?.name}</h1>
              <p className="text-muted-foreground">{reportType?.description}</p>
            </div>
            <div className="flex gap-3">
              <Link href="/report-types/summary/preview-layout">
                <Button variant="outline">Preview Layout</Button>
              </Link>
              <Link href="/report-types/summary/edit-layout">
                <Button>Edit Layout</Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Status Banner */}
        <div className="bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-900 text-green-800 dark:text-green-300 p-4 rounded-md mb-8">
          <div className="flex items-center gap-2">
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
            <span className="font-medium">Report Type Created Successfully</span>
          </div>
        </div>

        {showDeleteToast && (
          <ToastMessage type="success" message="Report Type Deleted Successfully" />
        )}

        <div className="grid md:grid-cols-[2fr_1fr] gap-8">
          {/* Main Information */}
          <div className="space-y-6">
            {/* Report Type Details */}
            <Card>
              <CardHeader>
                <CardTitle>Report Type Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Display Label</p>
                    <p>{reportType?.label}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Report Type ID</p>
                    <p>{reportType?.id}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">API Name</p>
                    <p>{reportType?.name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Created Date</p>
                    <p>{reportType?.createdOn}</p>
                  </div>
                  {/* <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Created By</p>
                    <p>Current User</p>
                  </div> */}
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-green-500"></span>
                      <span>Active</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm font-medium text-muted-foreground mb-2">Description</p>
                  <p className="text-sm">{reportType?.description}</p>
                </div>
              </CardContent>
            </Card>
            
            {/* Objects & Relationships */}
            <Card>
              <CardHeader>
                <CardTitle>Objects & Relationships</CardTitle>
              </CardHeader>
              <CardContent>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 font-medium">Object</th>
                      <th className="text-left py-2 font-medium">Relationship</th>
                      <th className="text-left py-2 font-medium">Related To</th>
                      <th className="text-right py-2 font-medium">Fields</th>
                    </tr>
                  </thead>
                  <tbody>
                    {relatedObjectsDetails.map((obj, index) => (
                      <tr key={obj.id} className="border-b border-muted">
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <div 
                              className="h-3 w-3 rounded-full" 
                              style={{ backgroundColor: obj.color }}
                            ></div>
                            <span>{obj.name}</span>
                            {index === 0 && 
                              <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">Primary</span>
                            }
                          </div>
                        </td>
                        <td className="py-3 capitalize">
                          {obj.relationshipType === "primary" ? "-" : obj.relationshipType + " join"}
                        </td>
                        <td className="py-3">
                          {obj.relationshipType === "primary" ? "-" : obj.name}
                        </td>
                        <td className="py-3 text-right">{obj.fieldCount}</td>
                      </tr>
                    ))}
                    
                    <tr className="bg-muted/30">
                      <td colSpan={3} className="py-3 font-medium">Total Fields</td>
                      <td className="py-3 text-right font-medium">{totalFieldCount}</td>
                    </tr>
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
          
          {/* Sidebar Information */}
          <div className="space-y-6">
            {/* Report Type Properties */}
            <Card>
              <CardHeader>
                <CardTitle>Properties</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Report Type Format</p>
                    <p className="capitalize">{reportType?.typeGroup}</p>
                  </div> */}
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Primary Object</p>
                    <p>{reportType?.primaryTableDisplayName || "Unknown"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Related Objects</p>
                    <p>{reportType?.usedTables?.length}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Total Fields Available</p>
                    <p>{reportType?.layoutList?.length}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Last Modified</p>
                    <p>{reportType?.updatedOn}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button className="w-full justify-start" variant="outline" onClick={handleEdit}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    Edit Report Type
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <line x1="8" y1="12" x2="16" y2="12" />
                    </svg>
                    Deactivate
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                      <polyline points="17 1 21 5 17 9" />
                      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                      <polyline points="7 23 3 19 7 15" />
                      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                    </svg>
                    Clone
                  </Button>
                  <Button className="w-full justify-start" variant="outline" onClick={handleDelete}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                      <path d="M3 6h18" />
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    </svg>
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Help Section */}
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Learn more about working with report types and how to create effective reports.
                </p>
                <div className="space-y-2">
                  <a href="#" className="text-sm text-primary block hover:underline">
                    Understanding Report Types
                  </a>
                  <a href="#" className="text-sm text-primary block hover:underline">
                    Best Practices for Reporting
                  </a>
                  <a href="#" className="text-sm text-primary block hover:underline">
                    Working with Field Layouts
                  </a>
                  <a href="#" className="text-sm text-primary block hover:underline">
                    Report Type Documentation
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Action Buttons at Bottom */}
        <div className="mt-8 flex justify-between items-center">
          <Button variant="outline" asChild>
            <Link href="/report-types/define-relationships">Back</Link>
          </Button>
          <div className="flex items-center gap-3">
            <Button variant="outline">Run Report</Button>
            <Button>Create Report</Button>
          </div>
        </div>
      </main>
    </div>
  );
}