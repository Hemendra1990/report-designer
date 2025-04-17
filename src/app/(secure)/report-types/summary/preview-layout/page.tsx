"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

// Sample objects with fields (same as in summary page)
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
  }
];

// Define type for related objects
interface RelatedObject {
  objectId: string;
  relationshipType: 'inner' | 'left' | 'right' | 'outer';
  parentId: string | null;
}

export default function PreviewLayoutPage() {
  return <Suspense fallback={<div>Loading...</div>}>
    <PreviewLayout />
  </Suspense>
}


function PreviewLayout() {
  const searchParams = useSearchParams();
  const reportType = searchParams.get("type") || "tabular";
  const primaryObjectId = searchParams.get("object") || "account";
  const displayLabel = searchParams.get("label") || "Custom Report";
  
  const [relatedObjects, setRelatedObjects] = useState<RelatedObject[]>([]);
  const [primaryObject, setPrimaryObject] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  useEffect(() => {
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
  
  // Get all objects involved in this report type
  const getAllObjects = () => {
    const result = [];
    
    // Add primary object first
    if (primaryObject) {
      result.push(primaryObject);
    }
    
    // Add related objects
    relatedObjects.forEach(relObj => {
      const objDetails = availableObjects.find(obj => obj.id === relObj.objectId);
      if (objDetails) {
        result.push(objDetails);
      }
    });
    
    return result;
  };
  
  // Filter fields based on search term
  const filterFields = (fields: any[]) => {
    if (!searchTerm) return fields;
    
    return fields.filter(field => 
      field.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      field.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      field.type.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };
  
  const allObjects = getAllObjects();
  const totalFieldCount = allObjects.reduce((count, obj) => count + (obj.fields?.length || 0), 0);

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
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-muted-foreground mb-4">
            <Link href="/report-types/summary" className="hover:text-foreground">
              Report Type Summary
            </Link>
            <span>→</span>
            <span className="text-foreground font-medium">Preview Fields Layout</span>
          </div>
          
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Preview Field Layout</h1>
              <p className="text-muted-foreground">
                All fields available for {displayLabel} ({totalFieldCount} fields total)
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/report-types/summary">
                <Button variant="outline">Back to Summary</Button>
              </Link>
              <Link href="/report-types/summary/edit-layout">
                <Button>Edit Layout</Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
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
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <Input 
              className="pl-10" 
              placeholder="Search fields by name or type..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Fields Layout */}
        <div className="space-y-8">
          {allObjects.map((obj) => {
            const filteredFields = filterFields(obj.fields || []);
            
            if (filteredFields.length === 0) return null;
            
            return (
              <Card key={obj.id} className="overflow-hidden">
                <CardHeader className={`py-3`} style={{ backgroundColor: `${obj.color}10`, borderBottom: `1px solid ${obj.color}30` }}>
                  <div className="flex items-center gap-3">
                    <div 
                      className="h-8 w-8 rounded-md flex items-center justify-center"
                      style={{ backgroundColor: `${obj.color}20`, color: obj.color }}
                    >
                      <span className="font-bold">{obj.letter}</span>
                    </div>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {obj.name}
                        <span className="text-xs font-normal text-muted-foreground">
                          ({filteredFields.length} fields)
                        </span>
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {filteredFields.map((field, idx) => (
                      <div key={`${obj.id}-${field.name}`} className="flex items-center p-3 hover:bg-muted/40">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{field.label}</p>
                          <p className="text-xs text-muted-foreground">API: {field.name}</p>
                        </div>
                        <div className="text-xs px-2 py-1 rounded bg-muted">
                          {field.type}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
          
          {/* No Results State */}
          {searchTerm && !allObjects.some(obj => filterFields(obj.fields || []).length > 0) && (
            <div className="text-center py-12 bg-muted/40 rounded-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mx-auto text-muted-foreground mb-4"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <h3 className="text-lg font-medium mb-2">No matching fields found</h3>
              <p className="text-muted-foreground">
                Try a different search term or clear your search
              </p>
              <Button variant="outline" className="mt-4" onClick={() => setSearchTerm('')}>
                Clear Search
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}