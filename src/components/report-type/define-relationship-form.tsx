"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import VennDiagram from "@/components/VennDiagram";
import ObjectTree from "@/components/ObjectTree";
import { TableMetadata } from "@/services/databaseService";
import { useAllTableMetadata } from "@/hooks/metadata-hook";
import { getRelatedData } from "@/services/crm/metadata-service";
import { useReportTypeFormContext } from "@/contexts/report-type-form-context";
import { iTableMetaData } from "../model/table-metadata";
import { useReportTypeConfigGeneration } from "@/helper/report-type/report-type-helper";
import { useCreatereportType } from "@/hooks/report-type-hook";

// Define letters for objects
const letters = ["A", "B", "C", "D", "E", "F", "G", "H"];

// Define relationship types
export type RelationshipType = "inner" | "outer" | "left" | "right";

export interface RelatedObject {
  objectId: string;
  letter: string;
  relationshipType: RelationshipType;
  parentId: string | null; // ID of parent object, null for direct children of primary
}

interface AvailableObject {
  id: string;
  name: string;
  schema: string;
  letter: string;
  description: string;
  color: string;
  relatedTo: string[];
  icon: string;
}

interface ObjectData {
  id: string;
  name: string;
  letter: string;
  color: string;
  icon: string;
  schema: string;
}

interface DefineRelationshipsProps {
    reportTypeId: string;
}

/**
 * 
 * primaryObjectId means primary table id
 * 
 */
export default function DefineRelationships(props: DefineRelationshipsProps) {
//   const searchParams = useSearchParams();
//   const reportType = searchParams.get("type") || "";
//   const primaryObjectId = searchParams.get("object") || "";
//   const primaryObjectSchema = searchParams.get("schema") || "";
//   const displayLabel = searchParams.get("label") || "";
//   const apiName = searchParams.get("api") || "";
//   const description = searchParams.get("desc") || "";

  const { reportType, setReportType } = useReportTypeFormContext();
  
  const [primaryObject, setPrimaryObject] = useState<AvailableObject | null>(null);
  const [relatedObjects, setRelatedObjects] = useState<RelatedObject[]>([]);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [availableObjects, setAvailableObjects] = useState<AvailableObject[]>([]);
  const [relatedTables, setRelatedTables] = useState<TableMetadata[]>([]);
  const [isLoadingRelated, setIsLoadingRelated] = useState(false);
  const [isLoadingAvailableObjects, setIsLoadingAvailableObjects] = useState(false);
  const { data: allTableMetaData, isLoading } = useAllTableMetadata();
  const { reportTypeConfigGeneration, handleObjectRemove } = useReportTypeConfigGeneration();
  const createReportTypeMutation = useCreatereportType();
  
  // Fetch available objects and initialize primary object
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = allTableMetaData || [];
        const mappedObjects = response?.map((table: TableMetadata) => ({
          id: table.tableName,
          name: table.tableName,
          displayName: table.displayName,
          schema: table.schema,
          letter: "A", // Will be assigned dynamically
          description: `Table in schema ${table.schema}`,
          color: "#1E88E5",
          relatedTo: [], // Will be populated based on foreign key relationships
          icon: "/icons/database.svg" // Default icon for all tables
        }));
        
        setAvailableObjects(mappedObjects);
        
        // Find the primary object
        const foundObject = mappedObjects.find((obj: AvailableObject) => 
          // obj.id === primaryObjectId && obj.schema === primaryObjectSchema
          obj.id === reportType?.primaryTable
        );
        
        if (foundObject) {
          setPrimaryObject(foundObject);
        }
      } catch (error) {
        console.error("Error fetching tables:", error);
      }
    };
    
    fetchData();
  }, [reportType?.primaryTable, reportType?.schema]);

  // Fetch related tables when primary object changes
  useEffect(() => {
    const fetchRelatedTables = async () => {
      if (primaryObject) {
        setIsLoadingRelated(true);
        try {
          const tables = (await getRelatedData(primaryObject.name)).data.data;
          setRelatedTables(tables);
        } catch (error) {
          console.error("Error fetching related tables:", error);
        } finally {
          setIsLoadingRelated(false);
        }
      } else {
        setRelatedTables([]);
      }
    };

    fetchRelatedTables();
  }, [primaryObject]);

  // Fetch available objects for a specific parent
  const fetchAvailableObjectsForParent = async (parentId: string | null) => {
    setIsLoadingAvailableObjects(true);
    try {
      // Find the parent object
      let parentObject: ObjectData | null = null;
      
      if (parentId) {
        // First try to find in available objects
        parentObject = availableObjects.find(obj => obj.id === parentId) || null;
        
        // If not found, try to find in related objects and then get its details
        if (!parentObject) {
          const relatedObj = relatedObjects.find(obj => obj.objectId === parentId);
          if (relatedObj) {
            parentObject = availableObjects.find(obj => obj.id === relatedObj.objectId) || null;
          }
        }
      } else {
        parentObject = primaryObject;
      }
      
      if (parentObject && parentObject.schema && parentObject.name) {
        const tables = (await getRelatedData(parentObject.name)).data.data;
        const mappedTables = tables.map((table: TableMetadata) => ({
          id: table.tableName,
          name: table.tableName,
          schema: table.schema,
          letter: table.tableName.charAt(0).toUpperCase(),
          description: `Table in schema ${table.schema}`,
          color: "#1E88E5",
          relatedTo: [],
          icon: "/icons/database.svg"
        }));

        // Keep existing objects and add new ones
        setAvailableObjects(prevObjects => {
          const existingIds = new Set(prevObjects.map(obj => obj.id));
          const newObjects = mappedTables.filter((obj: any) => !existingIds.has(obj.id));
          return [...prevObjects, ...newObjects];
        });
      }
    } catch (error) {
      console.error("Error fetching available objects:", error);
    } finally {
      setIsLoadingAvailableObjects(false);
    }
  };

  // Map TableMetadata to ObjectData
  const mapTableToObjectData = (table: TableMetadata): ObjectData => ({
    id: table.tableName,
    name: table.tableName,
    letter: table.tableName.charAt(0).toUpperCase(),
    color: "#1E88E5",
    icon: "/icons/database.svg",
    schema: table.schema
  });

  // Handle adding related object
  const handleAddRelatedObject = (objectId: string, relationshipType: RelationshipType, parentId: string | null, relatedTableInformationMap: Record<string, iTableMetaData[]>, relatedObjects: RelatedObject[]) => {
    const objectToAdd = availableObjects.find(obj => obj.id === objectId);
    if (!objectToAdd) return;
    
    // Check if object is already selected
    if (objectId === reportType?.primaryTable || relatedObjects.some(obj => obj.objectId === objectId)) {
      return;
    }
    
    // Get next available letter
    const usedLetters = [primaryObject?.letter || "A", ...relatedObjects.map(obj => obj.letter)];
    const nextLetter = letters.find(letter => !usedLetters.includes(letter)) || "X";

    const newObject: RelatedObject = {
        objectId,
        letter: nextLetter,
        relationshipType,
        parentId
      };
      
      // Prepare the updated array first
      const modifiedObjectTree: RelatedObject[] = [...relatedObjects, newObject];
      
      // Update both local variable and state
      setRelatedObjects(modifiedObjectTree);

    // Add ReportTypeConfig to report type payload
    reportTypeConfigGeneration(objectId, relationshipType, parentId || reportType.primaryTable, relatedTableInformationMap, modifiedObjectTree);
    
    // Fetch available objects for the newly added object
    fetchAvailableObjectsForParent(objectId);
  };

  // Handle removing related object
  const handleRemoveRelatedObject = (index: number) => {
    const updatedObjects = [...relatedObjects];
    handleObjectRemove(updatedObjects[index].objectId);
    updatedObjects.splice(index, 1);
    setRelatedObjects(updatedObjects);
  };

  // Handle changing relationship type
  const handleChangeRelationshipType = (index: number, type: RelationshipType) => {
    const updatedObjects = [...relatedObjects];
    updatedObjects[index].relationshipType = type;
    setRelatedObjects(updatedObjects);
  };

  // Handle opening the object selector
  const handleOpenObjectSelector = (parentId: string | null) => {
    fetchAvailableObjectsForParent(parentId);
  };

  const handleOnError = () => {}

  const handleOnSuccess = () => {
    setShowSuccessMessage(true);
    window.location.href = `/report-types/summary?type=${reportType}&object=${reportType?.primaryTable}&label=${reportType?.label}&api=${reportType?.name}&desc=${reportType?.description}`;
  }

  // Handle form submission
  const handleSubmit = () => {
    // use Save mutation here
    createReportTypeMutation.mutate({payload: reportType});
    // In a real app, this would submit to the server
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
          <div className="space-y-2">
            <Card>
              <CardHeader>
                <CardTitle>Select Objects</CardTitle>
              </CardHeader>
              <CardContent>
                {primaryObject && (
                  <ObjectTree 
                    availableObjects={availableObjects}
                    primaryObject={primaryObject}
                    relatedObjects={relatedObjects}
                    onAddRelatedObject={handleAddRelatedObject}
                    onRemoveRelatedObject={handleRemoveRelatedObject}
                    onChangeRelationshipType={handleChangeRelationshipType}
                    onOpenObjectSelector={handleOpenObjectSelector}
                    isLoadingAvailableObjects={isLoadingAvailableObjects}
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
                    <div>{reportType?.label}</div>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] gap-2">
                    <div className="font-medium text-muted-foreground">API Name:</div>
                    <div>{reportType?.name}</div>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] gap-2">
                    <div className="font-medium text-muted-foreground">Description:</div>
                    <div>{reportType?.description}</div>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] gap-2">
                    <div className="font-medium text-muted-foreground">Report Type:</div>
                    <div className="capitalize">{reportType?.typeGroup} Report</div>
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