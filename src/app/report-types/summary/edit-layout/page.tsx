"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// Sample objects with fields (same as in other pages)
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

// Define type for a field
interface Field {
  name: string;
  type: string;
  label: string;
  selected?: boolean;
  origin?: string;
  order?: number;
}

// Define type for related objects
interface RelatedObject {
  objectId: string;
  relationshipType: 'inner' | 'left' | 'right' | 'outer';
  parentId: string | null;
}

export default function EditLayout() {
  const searchParams = useSearchParams();
  const reportType = searchParams.get("type") || "tabular";
  const primaryObjectId = searchParams.get("object") || "account";
  const displayLabel = searchParams.get("label") || "Custom Report";
  
  const [relatedObjects, setRelatedObjects] = useState<RelatedObject[]>([]);
  const [primaryObject, setPrimaryObject] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedTab, setSelectedTab] = useState<string>("account");
  const [editableFields, setEditableFields] = useState<{[key: string]: Field[]}>({});
  const [showSuccessMessage, setShowSuccessMessage] = useState<boolean>(false);
  
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
    
    // Initialize editable fields
    const fields: {[key: string]: Field[]} = {};
    
    if (foundPrimary && foundPrimary.fields) {
      fields[foundPrimary.id] = foundPrimary.fields.map((field: Field, index: number) => ({
        ...field,
        selected: index < 5, // Select first 5 fields by default
        origin: 'default',
        order: index
      }));
    }
    
    // Add fields from related objects
    availableObjects.forEach(obj => {
      if (obj.id !== primaryObjectId && obj.fields) {
        fields[obj.id] = obj.fields.map((field: Field, index: number) => ({
          ...field,
          selected: ['Name', 'Email', 'Amount', 'Subject'].includes(field.name), // Select some common fields
          origin: 'default',
          order: index
        }));
      }
    });
    
    setEditableFields(fields);
    
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
  const filterFields = (fields: Field[]) => {
    if (!searchTerm) return fields;
    
    return fields.filter(field => 
      field.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      field.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      field.type.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };
  
  // Toggle field selection
  const toggleFieldSelection = (objectId: string, fieldName: string) => {
    setEditableFields(prev => {
      const objectFields = [...(prev[objectId] || [])];
      const fieldIndex = objectFields.findIndex(f => f.name === fieldName);
      
      if (fieldIndex >= 0) {
        objectFields[fieldIndex] = {
          ...objectFields[fieldIndex],
          selected: !objectFields[fieldIndex].selected
        };
      }
      
      return {
        ...prev,
        [objectId]: objectFields
      };
    });
  };
  
  // Move field up in order
  const moveFieldUp = (objectId: string, fieldName: string) => {
    setEditableFields(prev => {
      const objectFields = [...(prev[objectId] || [])];
      const fieldIndex = objectFields.findIndex(f => f.name === fieldName);
      
      if (fieldIndex > 0) {
        // Swap with previous item
        const temp = objectFields[fieldIndex];
        objectFields[fieldIndex] = objectFields[fieldIndex - 1];
        objectFields[fieldIndex - 1] = temp;
        
        // Update order properties
        objectFields[fieldIndex].order = fieldIndex;
        objectFields[fieldIndex - 1].order = fieldIndex - 1;
      }
      
      return {
        ...prev,
        [objectId]: objectFields
      };
    });
  };
  
  // Move field down in order
  const moveFieldDown = (objectId: string, fieldName: string) => {
    setEditableFields(prev => {
      const objectFields = [...(prev[objectId] || [])];
      const fieldIndex = objectFields.findIndex(f => f.name === fieldName);
      
      if (fieldIndex >= 0 && fieldIndex < objectFields.length - 1) {
        // Swap with next item
        const temp = objectFields[fieldIndex];
        objectFields[fieldIndex] = objectFields[fieldIndex + 1];
        objectFields[fieldIndex + 1] = temp;
        
        // Update order properties
        objectFields[fieldIndex].order = fieldIndex;
        objectFields[fieldIndex + 1].order = fieldIndex + 1;
      }
      
      return {
        ...prev,
        [objectId]: objectFields
      };
    });
  };
  
  // Get selected field count for an object
  const getSelectedFieldCount = (objectId: string) => {
    return (editableFields[objectId] || []).filter(f => f.selected).length;
  };
  
  // Handle save
  const handleSave = () => {
    // In a real app, this would save to backend
    // For demo purposes, just show success message
    setShowSuccessMessage(true);
    
    // Hide after 3 seconds
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 3000);
  };
  
  const allObjects = getAllObjects();
  const totalSelectedFields = Object.keys(editableFields).reduce((count, objId) => 
    count + editableFields[objId].filter(f => f.selected).length, 0
  );

  return (
    <div className="min-h-screen bg-muted/40">
      {/* Navigation Bar */}
      <nav className="bg-primary text-primary-foreground py-4 px-6 shadow-md">
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
      </nav>

      {/* Main Content */}
      <main className="container mx-auto py-8 px-4">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-muted-foreground mb-4">
            <Link href="/report-types/summary" className="hover:text-foreground">
              Report Type Summary
            </Link>
            <span>→</span>
            <span className="text-foreground font-medium">Edit Fields Layout</span>
          </div>
          
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Edit Field Layout</h1>
              <p className="text-muted-foreground">
                Customize which fields are available in {displayLabel} ({totalSelectedFields} fields selected)
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/report-types/summary">
                <Button variant="outline">Cancel</Button>
              </Link>
              <Button onClick={handleSave}>Save Layout</Button>
            </div>
          </div>
        </div>
        
        {/* Success Message */}
        {showSuccessMessage && (
          <div className="mb-6 bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-900 text-green-800 dark:text-green-300 p-4 rounded-md">
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
              <span className="font-medium">Layout saved successfully!</span>
            </div>
          </div>
        )}

        {/* Tabs and Fields Editor */}
        <div className="bg-background border rounded-lg overflow-hidden">
          <Tabs defaultValue={primaryObject?.id || "account"} onValueChange={setSelectedTab}>
            <div className="border-b px-4">
              <TabsList className="h-auto p-0 bg-transparent">
                {allObjects.map(obj => (
                  <TabsTrigger 
                    key={obj.id} 
                    value={obj.id}
                    className="relative h-12 px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-t-md data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-[3px] border border-b-0 data-[state=active]:border-background"
                    style={{ 
                      "--tw-text-opacity": selectedTab === obj.id ? "1" : "0.6",
                      "--tw-after-bg-opacity": "1",
                      "--tw-after-bg": obj.color,
                      borderColor: selectedTab === obj.id ? obj.color : "transparent",
                      borderTopColor: selectedTab === obj.id ? obj.color : "transparent", 
                      borderLeftColor: selectedTab === obj.id ? obj.color : "transparent",
                      borderRightColor: selectedTab === obj.id ? obj.color : "transparent",
                      borderBottomColor: selectedTab === obj.id ? "transparent" : "transparent"
                     } as any}
                  >
                    <div className="flex items-center gap-2">
                      <div 
                        className="h-6 w-6 rounded-full flex items-center justify-center"
                        style={{ 
                          backgroundColor: selectedTab === obj.id ? obj.color : `${obj.color}40`,
                          color: selectedTab === obj.id ? "white" : obj.color,
                          transition: "all 0.2s ease"
                        }}
                      >
                        <span className="font-bold text-xs">{obj.letter}</span>
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{obj.name}</span>
                        <span className="text-xs text-muted-foreground px-1.5 py-0.5 rounded-full bg-muted">
                          {getSelectedFieldCount(obj.id)} fields
                        </span>
                      </div>
                    </div>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            
            {/* Tab Content Areas */}
            <div className="p-4">
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
              
              {/* Select All / Deselect All Controls */}
              <div className="mb-2 flex justify-between items-center">
                <div className="text-sm font-medium">
                  {editableFields[selectedTab]?.filter(f => f.selected).length || 0} of {editableFields[selectedTab]?.length || 0} fields selected
                </div>
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setEditableFields(prev => {
                        const updatedFields = [...(prev[selectedTab] || [])].map(f => ({
                          ...f,
                          selected: true
                        }));
                        
                        return {
                          ...prev,
                          [selectedTab]: updatedFields
                        };
                      });
                    }}
                  >
                    Select All
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setEditableFields(prev => {
                        const updatedFields = [...(prev[selectedTab] || [])].map(f => ({
                          ...f,
                          selected: false
                        }));
                        
                        return {
                          ...prev,
                          [selectedTab]: updatedFields
                        };
                      });
                    }}
                  >
                    Deselect All
                  </Button>
                </div>
              </div>
              
              {allObjects.map(obj => (
                <TabsContent key={obj.id} value={obj.id} className="mt-0">
                  <div className="rounded-md border">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="w-[50px] p-3 text-left"></th>
                          <th className="p-3 text-left font-medium text-sm">Field Label</th>
                          <th className="p-3 text-left font-medium text-sm">API Name</th>
                          <th className="p-3 text-left font-medium text-sm">Type</th>
                          <th className="w-[120px] p-3 text-right font-medium text-sm">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {filterFields(editableFields[obj.id] || []).map((field, idx) => (
                          <tr key={field.name} className="hover:bg-muted/30">
                            <td className="p-3 text-center">
                              <Checkbox 
                                id={`${obj.id}-${field.name}`}
                                checked={field.selected}
                                onCheckedChange={() => toggleFieldSelection(obj.id, field.name)}
                              />
                            </td>
                            <td className="p-3">
                              <Label 
                                htmlFor={`${obj.id}-${field.name}`}
                                className="font-medium text-sm cursor-pointer"
                              >
                                {field.label}
                              </Label>
                            </td>
                            <td className="p-3 text-sm text-muted-foreground">{field.name}</td>
                            <td className="p-3">
                              <span className="text-xs px-2 py-1 rounded bg-muted">
                                {field.type}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              {field.selected ? (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-7 text-xs"
                                  onClick={() => toggleFieldSelection(obj.id, field.name)}
                                >
                                  <svg 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    width="14" 
                                    height="14" 
                                    viewBox="0 0 24 24" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    strokeWidth="2" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    className="mr-1 text-red-500"
                                  >
                                    <path d="M18 6 6 18" />
                                    <path d="m6 6 12 12" />
                                  </svg>
                                  Remove
                                </Button>
                              ) : (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-7 text-xs"
                                  onClick={() => toggleFieldSelection(obj.id, field.name)}
                                >
                                  <svg 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    width="14" 
                                    height="14" 
                                    viewBox="0 0 24 24" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    strokeWidth="2" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    className="mr-1 text-green-500"
                                  >
                                    <path d="M12 5v14" />
                                    <path d="M5 12h14" />
                                  </svg>
                                  Add
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                        
                        {/* Empty State */}
                        {filterFields(editableFields[obj.id] || []).length === 0 && (
                          <tr>
                            <td colSpan={5} className="p-8 text-center">
                              <div className="text-muted-foreground text-sm">
                                No fields match your search. Try a different search term or clear your search.
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>
              ))}
            </div>
          </Tabs>
        </div>
        
        {/* Action Buttons at Bottom */}
        <div className="mt-8 flex justify-between items-center">
          <Link href="/report-types/summary">
            <Button variant="outline">Cancel</Button>
          </Link>
          <div className="flex items-center gap-3">
            <Button onClick={handleSave}>Save Layout</Button>
          </div>
        </div>
      </main>
    </div>
  );
}