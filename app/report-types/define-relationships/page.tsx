"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import VennDiagram from "@/components/VennDiagram";
import ObjectTree from "@/components/ObjectTree";

// Sample list of available objects for reference
const availableObjects = [
  {
    id: "account",
    name: "Account",
    letter: "A",
    description: "Represents a customer, prospect, or other organization",
    icon: "/icons/account.svg",
    color: "#1E88E5", // Blue
    relatedTo: ["contact", "opportunity", "case"] // Objects that can be children of account
  },
  {
    id: "contact",
    name: "Contact",
    letter: "B",
    description: "Represents a person associated with an account",
    icon: "/icons/contact.svg",
    color: "#43A047", // Green
    relatedTo: ["case", "opportunity"] // Objects that can be children of contact
  },
  {
    id: "opportunity",
    name: "Opportunity",
    letter: "C",
    description: "Represents a potential sale or deal",
    icon: "/icons/opportunity.svg",
    color: "#E53935", // Red
    relatedTo: ["product", "order"] // Objects that can be children of opportunity
  },
  {
    id: "case",
    name: "Case",
    letter: "D",
    description: "Represents a customer issue or question",
    icon: "/icons/account.svg",
    color: "#FB8C00", // Orange
    relatedTo: [] // No children allowed for case
  },
  {
    id: "campaign",
    name: "Campaign",
    letter: "E",
    description: "Represents a marketing campaign",
    icon: "/icons/account.svg", 
    color: "#8E24AA", // Purple
    relatedTo: ["lead", "opportunity"] // Objects that can be children of campaign
  },
  {
    id: "lead",
    name: "Lead",
    letter: "F",
    description: "Represents a potential customer",
    icon: "/icons/account.svg",
    color: "#00ACC1", // Cyan
    relatedTo: [] // No children allowed for lead
  },
  {
    id: "product",
    name: "Product",
    letter: "G",
    description: "Represents items sold by your company",
    icon: "/icons/account.svg",
    color: "#F9A825", // Yellow
    relatedTo: ["order"] // Objects that can be children of product
  },
  {
    id: "order",
    name: "Order",
    letter: "H",
    description: "Represents a purchase made by a customer",
    icon: "/icons/account.svg",
    color: "#5E35B1", // Deep Purple
    relatedTo: [] // No children allowed for order
  }
];

// Define letters for objects
const letters = ["A", "B", "C", "D", "E", "F", "G", "H"];

// Define relationship types
type RelationshipType = "inner" | "outer" | "left" | "right";

interface RelatedObject {
  objectId: string;
  letter: string;
  relationshipType: RelationshipType;
  parentId: string | null; // ID of parent object, null for direct children of primary
}

export default function DefineRelationships() {
  const searchParams = useSearchParams();
  const reportType = searchParams.get("type") || "";
  const primaryObjectId = searchParams.get("object") || "account"; // Default to account if not provided
  const displayLabel = searchParams.get("label") || "";
  const apiName = searchParams.get("api") || "";
  const description = searchParams.get("desc") || "";
  
  const [primaryObject, setPrimaryObject] = useState<any>(null);
  const [relatedObjects, setRelatedObjects] = useState<RelatedObject[]>([]);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  // Initialize primary object from the URL parameter
  useEffect(() => {
    const foundObject = availableObjects.find(obj => obj.id === primaryObjectId);
    if (foundObject) {
      setPrimaryObject(foundObject);
    }
  }, [primaryObjectId]);

  // Function to add a related object
  const handleAddRelatedObject = (objectId: string, relationshipType: RelationshipType = "inner", parentId: string | null = null) => {
    const objectToAdd = availableObjects.find(obj => obj.id === objectId);
    if (!objectToAdd) return;
    
    // Check if object is already selected
    if (objectId === primaryObjectId || relatedObjects.some(obj => obj.objectId === objectId)) {
      return;
    }
    
    // Get next available letter
    const usedLetters = [primaryObject?.letter || "A", ...relatedObjects.map(obj => obj.letter)];
    const nextLetter = letters.find(letter => !usedLetters.includes(letter)) || "X";
    
    // Add to related objects
    setRelatedObjects([
      ...relatedObjects,
      {
        objectId,
        letter: nextLetter,
        relationshipType,
        parentId
      }
    ]);
  };

  // Function to remove a related object
  const handleRemoveRelatedObject = (index: number) => {
    const updatedObjects = [...relatedObjects];
    updatedObjects.splice(index, 1);
    setRelatedObjects(updatedObjects);
  };

  // Function to change relationship type
  const handleChangeRelationshipType = (index: number, type: RelationshipType) => {
    const updatedObjects = [...relatedObjects];
    updatedObjects[index].relationshipType = type;
    setRelatedObjects(updatedObjects);
  };

  // Handle form submission
  const handleSubmit = () => {
    // In a real app, this would submit to the server
    setShowSuccessMessage(true);
    
    // Navigate to summary page after a short delay
    setTimeout(() => {
      // Redirect to summary page with relevant params
      window.location.href = `/report-types/summary?type=${reportType}&object=${primaryObjectId}&label=${displayLabel}&api=${apiName}&desc=${description}`;
    }, 1500);
  };

  // Prepare data for VennDiagram component
  const vennRelatedObjects = relatedObjects.map(relObj => {
    const objectDetails = availableObjects.find(obj => obj.id === relObj.objectId);
    if (!objectDetails) {
      return {
        object: {
          id: relObj.objectId,
          label: "Unknown",
          letter: relObj.letter,
          color: "#999999"
        },
        relationshipType: relObj.relationshipType,
        parentId: relObj.parentId
      };
    }
    
    return {
      object: {
        id: objectDetails.id,
        label: objectDetails.name,
        letter: relObj.letter,
        color: objectDetails.color
      },
      relationshipType: relObj.relationshipType,
      parentId: relObj.parentId
    };
  });

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
        <div className="mb-8 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 text-muted-foreground mb-3">
              <Link href="/report-types" className="hover:text-foreground">
                Select Report Type
              </Link>
              <span>→</span>
              <Link 
                href={`/report-types/select-object?type=${reportType}`} 
                className="hover:text-foreground"
              >
                Select Primary Object
              </Link>
              <span>→</span>
              <span className="text-foreground font-medium">Define Report Records Set</span>
            </div>
            <h1 className="text-3xl font-bold mb-3">New Custom Report Type</h1>
            <div className="flex items-center gap-2 text-sm font-medium">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground">
                2
              </div>
              <span>Define Report Records Set</span>
            </div>
            <p className="mt-4 text-muted-foreground">
              Select related objects to define which records are included in reports using this report type.
            </p>
          </div>
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
              <span>Report type relationships defined successfully!</span>
            </p>
          </div>
        )}

        <div className="grid gap-8 md:grid-cols-[1fr_1fr]">
          {/* Left Side - Objects and Relationships */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Select Objects</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {primaryObject && (
                  <ObjectTree 
                    availableObjects={availableObjects}
                    primaryObject={primaryObject}
                    relatedObjects={relatedObjects}
                    onAddRelatedObject={handleAddRelatedObject}
                    onRemoveRelatedObject={handleRemoveRelatedObject}
                    onChangeRelationshipType={handleChangeRelationshipType}
                  />
                )}
              </CardContent>
            </Card>
            
            {/* Report Type Info */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-medium mb-4">Report Type Information</h3>
                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-[120px_1fr] gap-2">
                    <div className="font-medium text-muted-foreground">Label:</div>
                    <div>{displayLabel}</div>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] gap-2">
                    <div className="font-medium text-muted-foreground">API Name:</div>
                    <div>{apiName}</div>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] gap-2">
                    <div className="font-medium text-muted-foreground">Description:</div>
                    <div>{description}</div>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] gap-2">
                    <div className="font-medium text-muted-foreground">Report Type:</div>
                    <div className="capitalize">{reportType} Report</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Right Side - Relationship Visualization */}
          <div>
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Object Relationships Visualization</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center min-h-[400px]">
                  {primaryObject && (
                    <VennDiagram
                      primaryObject={{
                        id: primaryObject.id,
                        label: primaryObject.name,
                        letter: primaryObject.letter,
                        color: primaryObject.color
                      }}
                      relatedObjects={vennRelatedObjects}
                      width={500}
                      height={400}
                    />
                  )}
                  
                  <div className="mt-4 p-4 bg-muted/30 rounded-md w-full">
                    <h3 className="font-medium mb-2 text-sm">SQL Join Types Explained:</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex gap-2">
                        <span className="font-semibold text-foreground">INNER JOIN:</span> 
                        Only returns records that have matching values in both tables (intersection of sets).
                      </li>
                      <li className="flex gap-2">
                        <span className="font-semibold text-foreground">LEFT JOIN:</span> 
                        Returns all records from the left table (primary), and matched records from the right table.
                      </li>
                      <li className="flex gap-2">
                        <span className="font-semibold text-foreground">RIGHT JOIN:</span> 
                        Returns all records from the right table (related), and matched records from the left table.
                      </li>
                      <li className="flex gap-2">
                        <span className="font-semibold text-foreground">OUTER JOIN:</span> 
                        Returns all records when there is a match in either the left or right table.
                      </li>
                    </ul>
                  </div>
                  
                  <div className="mt-4 text-center text-sm text-muted-foreground">
                    <p>This Venn diagram visualization shows the SQL join relationships between your data objects.</p>
                    <p className="mt-1">The overlapping areas represent the records that will be included in the report.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
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
            <Button onClick={handleSubmit}>
              Save and Continue
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}