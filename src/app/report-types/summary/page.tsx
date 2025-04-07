"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Sample list of available objects for reference (same as in other pages)
const availableObjects = [
  {
    id: "account",
    name: "Account",
    letter: "A",
    description: "Represents a customer, prospect, or other organization",
    icon: "/icons/account.svg",
    color: "#1E88E5", // Blue
    fields: [
      { name: "Name", type: "Text", label: "Account Name" },
      { name: "Site", type: "Text", label: "Account Site" },
      { name: "Type", type: "Picklist", label: "Account Type" },
      { name: "Industry", type: "Picklist", label: "Industry" },
      { name: "AnnualRevenue", type: "Currency", label: "Annual Revenue" },
      { name: "Phone", type: "Phone", label: "Phone" },
      { name: "Website", type: "URL", label: "Website" },
      { name: "BillingAddress", type: "Address", label: "Billing Address" },
      { name: "ShippingAddress", type: "Address", label: "Shipping Address" },
      { name: "Description", type: "Text Area", label: "Description" },
    ]
  },
  {
    id: "contact",
    name: "Contact",
    letter: "B",
    description: "Represents a person associated with an account",
    icon: "/icons/contact.svg",
    color: "#43A047", // Green
    fields: [
      { name: "FirstName", type: "Text", label: "First Name" },
      { name: "LastName", type: "Text", label: "Last Name" },
      { name: "Email", type: "Email", label: "Email" },
      { name: "Phone", type: "Phone", label: "Phone" },
      { name: "Title", type: "Text", label: "Title" },
      { name: "Department", type: "Text", label: "Department" },
      { name: "MailingAddress", type: "Address", label: "Mailing Address" },
      { name: "LeadSource", type: "Picklist", label: "Lead Source" },
      { name: "Birthdate", type: "Date", label: "Birthdate" },
      { name: "ReportsTo", type: "Lookup", label: "Reports To" },
      { name: "AccountId", type: "Lookup", label: "Account ID" },
    ]
  },
  {
    id: "opportunity",
    name: "Opportunity",
    letter: "C",
    description: "Represents a potential sale or deal",
    icon: "/icons/opportunity.svg",
    color: "#E53935", // Red
    fields: [
      { name: "Name", type: "Text", label: "Opportunity Name" },
      { name: "Amount", type: "Currency", label: "Amount" },
      { name: "CloseDate", type: "Date", label: "Close Date" },
      { name: "Stage", type: "Picklist", label: "Stage" },
      { name: "Type", type: "Picklist", label: "Type" },
      { name: "LeadSource", type: "Picklist", label: "Lead Source" },
      { name: "ExpectedRevenue", type: "Currency", label: "Expected Revenue" },
      { name: "Probability", type: "Percent", label: "Probability" },
      { name: "CampaignId", type: "Lookup", label: "Campaign ID" },
      { name: "AccountId", type: "Lookup", label: "Account ID" }
    ]
  },
  {
    id: "case",
    name: "Case",
    letter: "D",
    description: "Represents a customer issue or question",
    icon: "/icons/account.svg",
    color: "#FB8C00", // Orange
    fields: [
      { name: "CaseNumber", type: "Auto Number", label: "Case Number" },
      { name: "Subject", type: "Text", label: "Subject" },
      { name: "Status", type: "Picklist", label: "Status" },
      { name: "Priority", type: "Picklist", label: "Priority" },
      { name: "Description", type: "Text Area", label: "Description" },
      { name: "Origin", type: "Picklist", label: "Case Origin" },
      { name: "Type", type: "Picklist", label: "Case Type" },
      { name: "Reason", type: "Picklist", label: "Case Reason" },
      { name: "ContactId", type: "Lookup", label: "Contact ID" },
      { name: "AccountId", type: "Lookup", label: "Account ID" }
    ]
  },
  {
    id: "campaign",
    name: "Campaign",
    letter: "E",
    description: "Represents a marketing campaign",
    icon: "/icons/account.svg", 
    color: "#8E24AA", // Purple
    fields: [
      { name: "Name", type: "Text", label: "Campaign Name" },
      { name: "Type", type: "Picklist", label: "Type" },
      { name: "Status", type: "Picklist", label: "Status" },
      { name: "StartDate", type: "Date", label: "Start Date" },
      { name: "EndDate", type: "Date", label: "End Date" },
      { name: "ExpectedRevenue", type: "Currency", label: "Expected Revenue" },
      { name: "BudgetedCost", type: "Currency", label: "Budgeted Cost" },
      { name: "ActualCost", type: "Currency", label: "Actual Cost" },
      { name: "Description", type: "Text Area", label: "Description" },
      { name: "ParentId", type: "Lookup", label: "Parent Campaign" }
    ]
  },
  {
    id: "lead",
    name: "Lead",
    letter: "F",
    description: "Represents a potential customer",
    icon: "/icons/account.svg",
    color: "#00ACC1", // Cyan
    fields: [
      { name: "FirstName", type: "Text", label: "First Name" },
      { name: "LastName", type: "Text", label: "Last Name" },
      { name: "Company", type: "Text", label: "Company" },
      { name: "Email", type: "Email", label: "Email" },
      { name: "Phone", type: "Phone", label: "Phone" },
      { name: "Status", type: "Picklist", label: "Lead Status" },
      { name: "Industry", type: "Picklist", label: "Industry" },
      { name: "Rating", type: "Picklist", label: "Rating" },
      { name: "Address", type: "Address", label: "Address" },
      { name: "LeadSource", type: "Picklist", label: "Lead Source" }
    ]
  },
  {
    id: "product",
    name: "Product",
    letter: "G",
    description: "Represents items sold by your company",
    icon: "/icons/account.svg",
    color: "#F9A825", // Yellow
    fields: [
      { name: "Name", type: "Text", label: "Product Name" },
      { name: "ProductCode", type: "Text", label: "Product Code" },
      { name: "Description", type: "Text Area", label: "Product Description" },
      { name: "IsActive", type: "Checkbox", label: "Active" },
      { name: "Family", type: "Picklist", label: "Product Family" },
      { name: "StockKeepingUnit", type: "Text", label: "Stock Keeping Unit" },
      { name: "QuantityUnitOfMeasure", type: "Picklist", label: "Quantity Unit of Measure" },
      { name: "DisplayUrl", type: "URL", label: "Display URL" },
      { name: "ExternalId", type: "Text", label: "External ID" },
      { name: "ExternalDataSourceId", type: "Lookup", label: "External Data Source" }
    ]
  },
  {
    id: "order",
    name: "Order",
    letter: "H",
    description: "Represents a purchase made by a customer",
    icon: "/icons/account.svg",
    color: "#5E35B1", // Deep Purple
    fields: [
      { name: "OrderNumber", type: "Auto Number", label: "Order Number" },
      { name: "Status", type: "Picklist", label: "Status" },
      { name: "EffectiveDate", type: "Date", label: "Effective Date" },
      { name: "Type", type: "Picklist", label: "Order Type" },
      { name: "EndDate", type: "Date", label: "End Date" },
      { name: "TotalAmount", type: "Currency", label: "Order Amount" },
      { name: "ShippingAddress", type: "Address", label: "Shipping Address" },
      { name: "BillingAddress", type: "Address", label: "Billing Address" },
      { name: "AccountId", type: "Lookup", label: "Account ID" },
      { name: "OpportunityId", type: "Lookup", label: "Opportunity ID" }
    ]
  }
];

// Define interface for related objects
interface RelatedObject {
  objectId: string;
  relationshipType: 'inner' | 'left' | 'right' | 'outer';
  parentId: string | null;
}

export default function ReportTypeSummary() {
  const searchParams = useSearchParams();
  const reportType = searchParams.get("type") || "tabular";
  const primaryObjectId = searchParams.get("object") || "account";
  const displayLabel = searchParams.get("label") || "Custom Report";
  const apiName = searchParams.get("api") || "Custom_Report__c";
  const description = searchParams.get("desc") || "Custom report type for data analysis";
  
  const [reportId, setReportId] = useState<string>("");
  const [createdDate, setCreatedDate] = useState<string>("");
  const [relatedObjects, setRelatedObjects] = useState<RelatedObject[]>([]);
  const [primaryObject, setPrimaryObject] = useState<any>(null);
  
  useEffect(() => {
    // Generate a unique report ID
    setReportId(`RT-${Math.floor(Math.random() * 100000)}`);
    
    // Set current date
    const now = new Date();
    setCreatedDate(now.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }));
    
    // Find primary object details
    const foundPrimary = availableObjects.find(obj => obj.id === primaryObjectId);
    if (foundPrimary) {
      setPrimaryObject(foundPrimary);
    }
    
    // In a real app, this would load related objects from storage or API
    // For demo purposes, let's create some sample related objects
    setRelatedObjects([
      {
        objectId: "contact",
        relationshipType: "inner",
        parentId: null
      },
      {
        objectId: "opportunity",
        relationshipType: "left",
        parentId: null
      },
      {
        objectId: "case",
        relationshipType: "left",
        parentId: "contact"
      }
    ]);
  }, [primaryObjectId]);
  
  // Get related object details with field counts
  const getObjectDetails = () => {
    const result = [];
    
    // Add primary object first
    if (primaryObject) {
      result.push({
        id: primaryObject.id,
        name: primaryObject.name,
        color: primaryObject.color,
        fieldCount: primaryObject.fields?.length || 0,
        relationshipType: "primary"
      });
    }
    
    // Add related objects
    relatedObjects.forEach(relObj => {
      const objDetails = availableObjects.find(obj => obj.id === relObj.objectId);
      if (!objDetails) return;
      
      const parentObject = relObj.parentId 
        ? availableObjects.find(obj => obj.id === relObj.parentId)
        : primaryObject;
      
      const parentName = parentObject?.name || "Unknown";
      
      result.push({
        id: objDetails.id,
        name: objDetails.name,
        color: objDetails.color,
        fieldCount: objDetails.fields?.length || 0,
        relationshipType: relObj.relationshipType,
        parentName: parentName
      });
    });
    
    return result;
  };
  
  const relatedObjectsDetails = getObjectDetails();
  
  // Calculate total field count
  const totalFieldCount = relatedObjectsDetails.reduce((total, obj) => total + obj.fieldCount, 0);

  return (
    <div className="min-h-screen bg-background">
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
            <Link href="/reports">
              <Button variant="ghost">Reports</Button>
            </Link>
          </div>
        </div>
      </nav> */}

      {/* Main Content */}
      <main className="container mx-auto py-8 px-4">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{displayLabel}</h1>
              <p className="text-muted-foreground">{description}</p>
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
                    <p>{displayLabel}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Report Type ID</p>
                    <p>{reportId}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">API Name</p>
                    <p>{apiName}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Created Date</p>
                    <p>{createdDate}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Created By</p>
                    <p>Current User</p>
                  </div>
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
                  <p className="text-sm">{description}</p>
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
                          {obj.relationshipType === "primary" ? "-" : obj.parentName}
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
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Report Type Format</p>
                    <p className="capitalize">{reportType}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Primary Object</p>
                    <p>{primaryObject?.name || "Unknown"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Related Objects</p>
                    <p>{relatedObjects.length}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Total Fields Available</p>
                    <p>{totalFieldCount}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Last Modified</p>
                    <p>{createdDate}</p>
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
                  <Button className="w-full justify-start" variant="outline">
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
                  <Button className="w-full justify-start" variant="outline">
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