"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAllColumnMetadataByTableName } from "@/hooks/metadata-hook";
import { useUpdateReportTypeLayoutStatus } from "@/hooks/report-type-hook";
import { ReportType, ReportTypeLayout } from "@/components/model/report-type";
import { useReportTypeFormContext } from "@/contexts/report-type-form-context";

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
  const primaryObjectId = searchParams.get("object") || "accounts";
  const displayLabel = searchParams.get("label") || "Custom Report";
  const { reportType } = useReportTypeFormContext();
  
  // Initialize selectedTab with a fallback value in case reportType is not immediately available
  const [selectedTab, setSelectedTab] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [relatedObjects, setRelatedObjects] = useState<RelatedObject[]>([]);
  const [primaryObject, setPrimaryObject] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [editableFields, setEditableFields] = useState<{[key: string]: Field[]}>({});
  const [showSuccessMessage, setShowSuccessMessage] = useState<boolean>(false);
  
  // Get column details for the selected tab
  const {data: columnDetails, isLoading: isColumnsLoading} = useAllColumnMetadataByTableName(selectedTab);
  const updateReportTypeLayoutStatus = useUpdateReportTypeLayoutStatus();

  // Initialize selectedTab once reportType is available
  useEffect(() => {
    if (reportType?.usedTables?.length) {
      setSelectedTab(reportType.usedTables[0]);
    } else if (primaryObjectId) {
      setSelectedTab(primaryObjectId);
    }
  }, [reportType, primaryObjectId]);

  // Debug logging to track state changes
  useEffect(() => {
    console.log("selectedTab:", selectedTab);
    console.log("columnDetails:", columnDetails);
    console.log("isColumnsLoading:", isColumnsLoading);
  }, [selectedTab, columnDetails, isColumnsLoading]);

  // Process column details when they become available
  useEffect(() => {
    if (selectedTab && columnDetails && columnDetails.columns?.length) {
      console.log("Processing column details for", selectedTab);
      setEditableFields(prev => {
        const updated = { ...prev };
        const matchingObject = availableObjects.find(obj => obj.id === selectedTab);

        if (matchingObject) {
          const updatedFields = columnDetails.columns.map((col) => {
            // Check if the field exists in layoutList and is active
            const isActive = reportType?.layoutList?.some(
              (field) =>
                field.tableName === matchingObject.id &&
                field.columnName === col.columnName &&
                field.active === true
            );

            return {
              name: col.columnName,
              type: col.dataType,
              label: col.headerName,
              selected: isActive ?? false
            };
          });

          updated[matchingObject.id] = updatedFields;
        }
        return updated;
      });
      
      // Data is loaded, we can remove loading state
      setIsLoading(false);
    }
  }, [columnDetails, selectedTab, reportType?.layoutList]);

  const availableObjects = useMemo(() => {
    if (!reportType) return [];
    const tableMap = new Map();
    // Collect unique table info
    const tables = [
      {
        id: reportType.primaryTableId,
        name: reportType.primaryTable,
        label: reportType.primaryTableDisplayName,
        sortOrder: 0
      },
      ...(reportType.configList ?? []).map((join, i) => ({
        id: join.joinTableId,
        name: join.joinTableName,
        label: join.joinTableDisplayName,
        sortOrder: join.sortOrder ?? i + 1
      }))
    ];

    // Group layout fields by table
    for (const table of tables) {
      tableMap.set(table.name, {
        id: table.name,
        name: table.label || table.name,
        letter: table.label?.[0]?.toUpperCase() || table.name?.[0]?.toUpperCase(),
        description: `Fields from ${table.label || table.name}`,
        icon: "/icons/default.svg",
        color: "#90CAF9",
        fields: []
      });
    }

    for (const field of reportType.layoutList ?? []) {
      const tableName = field.tableName;
      const object = tableMap.get(tableName);
      if (object) {
        object.fields.push({
          name: field.columnName,
          type: field.columnType,
          label: field.columnDisplayName
        });
      }
    }
    return Array.from(tableMap.values());
  }, [reportType]);
  
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
    
    if (Object.keys(fields).length > 0) {
      setEditableFields(prev => ({...prev, ...fields}));
    }
    
  }, [primaryObjectId, availableObjects]);
  
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
  
  // Get selected field count for an object
  const getSelectedFieldCount = (objectId: string) => {
    return (editableFields[objectId] || []).filter(f => f.selected).length;
  };
  
  // Handle save
  const handleSave = () => {
    const reportTypePyload: ReportTypeLayout[] = [
      // Implement your save logic here
    ];
    updateReportTypeLayoutStatus.mutate({ payload: reportTypePyload });
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

  // Handle tab change
  const handleTabChange = (value: string) => {
    setSelectedTab(value);
    // Request column details for the new tab if not already loaded
    if (!editableFields[value] || editableFields[value].length === 0) {
      setIsLoading(true);
    }
  };

  return (
    <div className="min-h-screen bg-muted/40">
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
          <Tabs 
            value={selectedTab} 
            onValueChange={handleTabChange}
            defaultValue={primaryObject?.id || "account"}
          >
            <div className="px-4">
              <TabsList className="mt-3 gap-3 bg-transparent p-0">
                {allObjects.map((obj) => (
                  <TabsTrigger
                    key={obj.id}
                    value={obj.id}
                    className={`
                      flex items-center gap-3 px-4 py-2
                      border rounded-full transition-all
                      shadow-sm text-sm font-medium
                      h-12
                      data-[state=active]:bg-white
                      data-[state=active]:border-[${obj.color}]
                      data-[state=active]:shadow-md
                      hover:bg-muted
                    `}
                    style={{
                      borderColor: selectedTab === obj.id ? obj.color : "transparent",
                    }}
                  >
                    {/* Colored circle with letter */}
                    <div
                      className="h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                      style={{
                        backgroundColor: selectedTab === obj.id
                          ? obj.color
                          : `${obj.color}40`,
                        color: selectedTab === obj.id ? "white" : obj.color,
                      }}
                    >
                      {obj.letter}
                    </div>

                    {/* Name + field count */}
                    <div className="flex flex-col items-start justify-center leading-tight">
                      <span className="font-medium text-sm">{obj.name}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        {getSelectedFieldCount(obj.id)} fields
                      </span>
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
                  {isLoading || isColumnsLoading ? (
                    <div className="rounded-md border p-8 text-center">
                      <div className="text-muted-foreground text-sm">Loading column data...</div>
                    </div>
                  ) : (
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
                          {(editableFields[obj.id] && filterFields(editableFields[obj.id]).length > 0) ? (
                            filterFields(editableFields[obj.id]).map((field, idx) => (
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
                            ))
                          ) : (
                            <tr>
                              <td colSpan={5} className="p-8 text-center">
                                <div className="text-muted-foreground text-sm">
                                  {searchTerm ? 
                                    "No fields match your search. Try a different search term or clear your search." :
                                    "No fields available for this table."
                                  }
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
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