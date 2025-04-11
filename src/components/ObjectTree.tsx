import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { InputWithIcon } from '@/components/ui/input-with-icon';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { relatedObjectsService } from '@/services/relatedObjectsService';
import { getRelatedData } from '@/services/crm/metadata-service';
import { useReportTypeFormContext } from '@/contexts/report-type-form-context';
import { iTableMetaData } from './model/table-metadata';

interface TableColumn {
  name: string;
  dataType: string;
  nullable: boolean;
  primaryKey: boolean;
  foreignKey: boolean;
  referencedTable: string | null;
  referencedColumn: string | null;
}

interface TableMetadata {
  schema: string;
  tableName: string;
  columns: TableColumn[];
}

interface ObjectData {
  id: string;
  name: string;
  letter: string;
  description?: string;
  color: string;
  icon: string;
  schema: string;
  relatedTo?: string[]; // IDs of objects this object can relate to
  displayName?:string;
}

interface AvailableObject extends ObjectData {
  relatedTo: string[];
}

interface RelatedObject {
  objectId: string;
  letter: string;
  relationshipType: 'inner' | 'left' | 'right' | 'outer';
  parentId: string | null; // ID of parent object, null for direct children of primary
}

interface ObjectTreeProps {
  availableObjects: ObjectData[];
  primaryObject: ObjectData | AvailableObject | null;
  relatedObjects: RelatedObject[];
  onAddRelatedObject: (objectId: string, relationshipType: RelatedObject['relationshipType'], parentId: string | null, relatedTableInformationMap: Record<string, iTableMetaData[]>, relatedObjects: RelatedObject[]) => void;
  onRemoveRelatedObject: (index: number) => void;
  onChangeRelationshipType: (index: number, type: RelatedObject['relationshipType']) => void;
  onOpenObjectSelector?: (parentId: string | null) => void;
  isLoadingAvailableObjects?: boolean;
}

const ObjectTree: React.FC<ObjectTreeProps> = ({
  availableObjects,
  primaryObject,
  relatedObjects,
  onAddRelatedObject,
  onRemoveRelatedObject,
  onChangeRelationshipType,
  onOpenObjectSelector,
  isLoadingAvailableObjects = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSelector, setShowSelector] = useState(false);
  const [tempRelationshipType, setTempRelationshipType] = useState<RelatedObject['relationshipType']>('inner');
  const [expandedRelationships, setExpandedRelationships] = useState<string[]>([]);
  const [currentParentId, setCurrentParentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filteredObjects, setFilteredObjects] = useState<ObjectData[]>([]);
  const { reportType } = useReportTypeFormContext();
  const [relatedTableInformationMap, setRelatedTableInformationMap] = useState<Record<string, iTableMetaData[]>>({});
  
  // Fetch related objects when search term or parent changes
  useEffect(() => {
    const fetchRelatedObjects = async () => {
      if (!currentParentId && !primaryObject) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const parentObject = currentParentId 
          ? availableObjects.find(obj => obj.id === currentParentId)
          : primaryObject;
          
        if (!parentObject) return;
        
        /* const apiObjects = await relatedObjectsService.getRelatedObjects(
          parentObject.schema,
          parentObject.name
        ); */

        const apiObjects = (await getRelatedData(parentObject.name)).data.data;
        setRelatedTableInformationMap((prev) => {
          return {
            ...prev,
            [parentObject.name]: apiObjects
          }
        });
        // Map API objects to ObjectData format
        const mappedObjects: ObjectData[] = apiObjects.map((obj: any, index: number) => ({
          id: obj.tableName,
          name: obj.tableName,
          letter: obj.tableName.charAt(0).toUpperCase(),
          description: `Table in schema ${obj.schema} with ${obj.columns.length} columns`,
          color: getColorForIndex(index), // Helper function to generate colors
          icon: "/icons/database.svg",
          schema: obj.schema,
          relatedTo: obj.columns,
          displayName:obj.displayName
            // .filter(col => col.foreignKey)
            // .map(col => col.referencedTable || '')
            // .filter(table => table !== null)
        }));
        
        // Filter out already used objects
        const usedObjectIds = [
          primaryObject?.id,
          ...relatedObjects.map(obj => obj.objectId)
        ].filter(Boolean) as string[];
        
        const filtered = mappedObjects.filter(obj => {
          // Skip if object is null or undefined
          if (!obj) return false;
          
          // Check if object is already used
          if (usedObjectIds.includes(obj.id)) return false;
          
          // If no search term, include all objects
          if (!searchTerm) return true;
          
          // Check if name matches search term (with null check)
          const nameMatch = obj.name && obj.name.toLowerCase().includes(searchTerm.toLowerCase());
          
          // Check if description matches search term (with null check)
          const descMatch = obj.description && obj.description.toLowerCase().includes(searchTerm.toLowerCase());
          
          return nameMatch || descMatch;
        });
        
        setFilteredObjects(filtered);
      } catch (err) {
        setError('Failed to fetch related objects');
        console.error('Error fetching related objects:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRelatedObjects();
  }, [searchTerm, currentParentId, primaryObject, availableObjects, relatedObjects]);

  // Helper function to generate colors for tables
  const getColorForIndex = (index: number): string => {
    const colors = [
      '#1E88E5', // Blue
      '#43A047', // Green
      '#E53935', // Red
      '#FB8C00', // Orange
      '#8E24AA', // Purple
      '#00ACC1', // Cyan
      '#F9A825', // Yellow
      '#5E35B1', // Deep Purple
      '#3949AB', // Indigo
      '#00897B', // Teal
    ];
    return colors[index % colors.length];
  };

  // Toggle expansion of relationship details
  const toggleRelationshipExpansion = (objectId: string) => {
    setExpandedRelationships(prev => 
      prev.includes(objectId) 
        ? prev.filter(id => id !== objectId) 
        : [...prev, objectId]
    );
  };

  // Filter objects based on what can be related to the current parent
  const getFilteredObjects = () => {
    // Filter out objects that are already used in the tree
    const usedObjectIds = [
      primaryObject?.id,
      ...relatedObjects.map(obj => obj.objectId)
    ].filter(Boolean) as string[];

    return filteredObjects.filter(obj => !usedObjectIds.includes(obj.id));
  };

  // Helper to validate object relationships
  const validateObjectRelationship = (selectedObject: ObjectData, parentId: string | null): boolean => {
    // For primary object's direct children or any child object, allow the relationship
    return true;
  };

  // Build a hierarchical tree of objects
  const buildObjectTree = () => {
    if (!primaryObject) return [];
    
    // Recursive function to build tree
    const buildBranch = (parentId: string | null): React.ReactNode[] => {
      // Get direct children of this parent
      const directChildren = relatedObjects.filter(obj => obj.parentId === parentId);
      
      return directChildren.map((relObj, index) => {
        const objectDetails = availableObjects.find(obj => obj.id === relObj.objectId);
        if (!objectDetails) return null;
        
        const isExpanded = expandedRelationships.includes(relObj.objectId);
        
        // Find parent details to show the relationship
        const parentDetails = parentId 
          ? availableObjects.find(obj => obj.id === parentId) 
          : primaryObject;
        
        const parentLetter = parentDetails?.letter || 'A';
        
        return (
          <div 
            key={`obj-${relObj.objectId}-${index}`}
            className="mt-3"
          >
            <Card 
              className={`border-l-4 transition-all ${isExpanded ? 'bg-muted/20' : ''}`}
              style={{ borderLeftColor: objectDetails.color }}
              onClick={() => toggleRelationshipExpansion(relObj.objectId)}
            >
              <div className="p-3 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-md" 
                        style={{ backgroundColor: `${objectDetails.color}20`, color: objectDetails.color }}>
                      <span className="text-lg font-bold">{relObj.letter}</span>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">
                        {objectDetails.displayName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {parentLetter} → {relObj.letter} ({getJoinTypeLabel(relObj.relationshipType)})
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Show the children count if any */}
                    {relatedObjects.some(obj => obj.parentId === relObj.objectId) && (
                      <div className="text-xs px-1.5 py-0.5 bg-muted rounded-md">
                        {relatedObjects.filter(obj => obj.parentId === relObj.objectId).length}
                      </div>
                    )}
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 px-2 text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent card click
                        onRemoveRelatedObject(relatedObjects.indexOf(relObj));
                      }}
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
                      >
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      </svg>
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 w-7 p-0"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent card click
                        toggleRelationshipExpansion(relObj.objectId);
                      }}
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
                        className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Relationship details when expanded */}
              {isExpanded && (
                <div className="px-3 pb-3 pt-0">
                  <div className="border-t my-2"></div>
                  <RadioGroup
                    value={relObj.relationshipType}
                    onValueChange={(value) => {
                      onChangeRelationshipType(
                        relatedObjects.indexOf(relObj), 
                        value as RelatedObject['relationshipType']
                      );
                    }}
                    className="space-y-2"
                  >
                    <div className="flex items-start space-x-2">
                      <RadioGroupItem value="inner" id={`inner-${relObj.objectId}`} className="mt-1" />
                      <Label htmlFor={`inner-${relObj.objectId}`} className="font-normal text-sm">
                        <span className="font-medium">INNER JOIN:</span> Only matching records
                      </Label>
                    </div>
                    <div className="flex items-start space-x-2">
                      <RadioGroupItem value="left" id={`left-${relObj.objectId}`} className="mt-1" />
                      <Label htmlFor={`left-${relObj.objectId}`} className="font-normal text-sm">
                        <span className="font-medium">LEFT JOIN:</span> All {parentDetails?.displayName} records
                      </Label>
                    </div>
                    <div className="flex items-start space-x-2">
                      <RadioGroupItem value="right" id={`right-${relObj.objectId}`} className="mt-1" />
                      <Label htmlFor={`right-${relObj.objectId}`} className="font-normal text-sm">
                        <span className="font-medium">RIGHT JOIN:</span> All {objectDetails.displayName} records
                      </Label>
                    </div>
                    <div className="flex items-start space-x-2">
                      <RadioGroupItem value="outer" id={`outer-${relObj.objectId}`} className="mt-1" />
                      <Label htmlFor={`outer-${relObj.objectId}`} className="font-normal text-sm">
                        <span className="font-medium">OUTER JOIN:</span> All records from both
                      </Label>
                    </div>
                  </RadioGroup>
                  
                  {/* Add child button if this object doesn't already have a child */}
                  {!relatedObjects.some(obj => obj.parentId === relObj.objectId) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-3 text-xs h-7 border border-dashed border-muted-foreground/50"
                      onClick={async (e) => {
                        e.stopPropagation(); // Prevent card click
                        // First notify parent component to fetch available objects
                        if (onOpenObjectSelector) {
                          await onOpenObjectSelector(relObj.objectId);
                        }
                        // Then set the parent ID and show selector
                        setCurrentParentId(relObj.objectId);
                        setShowSelector(true);
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-1"
                      >
                        <path d="M12 5v14" />
                        <path d="M5 12h14" />
                      </svg>
                      Add child object
                    </Button>
                  )}
                </div>
              )}
            </Card>
            
            {/* Render children recursively with increased indentation */}
            <div className="pl-6 ml-4 border-l border-dashed border-muted">
              {buildBranch(relObj.objectId)}
            </div>
          </div>
        );
      });
    };
    
    return buildBranch(null);
  };

  // Helper to get a label for join type
  const getJoinTypeLabel = (type: RelatedObject['relationshipType']) => {
    switch(type) {
      case 'inner': return 'Inner Join';
      case 'left': return 'Left Join';
      case 'right': return 'Right Join';
      case 'outer': return 'Outer Join';
    }
  };

  return (
    <div className="object-tree space-y-4">
      {/* Primary Object */}
      {primaryObject && (
        <div className="primary-object">
          <h3 className="text-sm font-medium mb-2">Primary Object</h3>
          <Card className="border-l-4" style={{ borderLeftColor: primaryObject.color }}>
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-md" 
                    style={{ backgroundColor: `${primaryObject.color}20`, color: primaryObject.color }}>
                  <span className="text-xl font-bold">{primaryObject.letter}</span>
                </div>
                <div className="flex-1">
                  <div className="font-medium">
                    {primaryObject.displayName}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Primary Object (Root)
                  </div>
                </div>
              </div>
              
              {/* Add first level child button */}
              {relatedObjects.length < 5 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    setCurrentParentId(null); // Ethi reportType.primaryTable dele aau tree dekhauni.
                    setShowSelector(true);
                    if (onOpenObjectSelector) {
                      onOpenObjectSelector(null);
                    }
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-1"
                  >
                    <path d="M12 5v14" />
                    <path d="M5 12h14" />
                  </svg>
                  Add related object
                </Button>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Object Hierarchy Tree */}
      <div className="related-objects-tree pl-6 ml-4 border-l border-dashed border-muted">
        {buildObjectTree()}
      </div>

      {/* Object Selector Modal */}
      {showSelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background rounded-lg shadow-lg w-full max-w-md mx-4 p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">
                {currentParentId ? `Add Child Object to ${availableObjects.find(obj => obj.id === currentParentId)?.name}` : 'Add Related Object'}
              </h3>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 px-2"
                onClick={() => {
                  debugger
                  setShowSelector(false);
                  setSearchTerm('');
                }}
              >
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
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </Button>
            </div>
            
            <div className="mb-4">
              <InputWithIcon
                type="text"
                placeholder="Search objects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={
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
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                }
              />
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2">Select relationship type:</h4>
              <RadioGroup
                value={tempRelationshipType}
                onValueChange={(value) => setTempRelationshipType(value as RelatedObject['relationshipType'])}
                className="space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="inner" id="select-inner" />
                  <Label htmlFor="select-inner">INNER JOIN</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="left" id="select-left" />
                  <Label htmlFor="select-left">LEFT JOIN</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="right" id="select-right" />
                  <Label htmlFor="select-right">RIGHT JOIN</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="outer" id="select-outer" />
                  <Label htmlFor="select-outer">OUTER JOIN</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="max-h-64 overflow-y-auto space-y-2 mb-4">
              {isLoading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : getFilteredObjects().length === 0 ? (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  No available objects found
                </div>
              ) : (
                <div className="space-y-2">
                  {getFilteredObjects().map((obj, index) => (
                    <div
                      key={`filtered-obj-${obj.id}-${index}`}
                      className="flex items-center gap-3 p-3 rounded-md hover:bg-accent cursor-pointer"
                      onClick={async () => {
                        // First add the related object
                        onAddRelatedObject(obj.id, tempRelationshipType, currentParentId, relatedTableInformationMap, relatedObjects);
                        // Then notify parent component
                        if (onOpenObjectSelector) {
                          await onOpenObjectSelector(obj.id);
                        }
                        // Finally close the modal and reset search
                        setShowSelector(false);
                        setSearchTerm('');
                      }}
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-md" 
                           style={{ backgroundColor: `${obj.color}20`, color: obj.color }}>
                        <span className="text-lg font-bold">{obj.letter}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-sm">{obj?.displayName}</h3>
                        {obj.description && (
                          <p className="text-xs text-muted-foreground">{obj.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setShowSelector(false);
                  setSearchTerm('');
                }}
              >
                Cancel
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                onClick={async () => {
                  const filteredObjs = getFilteredObjects();
                  if (filteredObjs.length > 0) {
                    const obj = filteredObjs[0];
                    // First add the related object
                    onAddRelatedObject(obj.id, tempRelationshipType, currentParentId, relatedTableInformationMap, relatedObjects);
                    // Then notify parent component
                    if (onOpenObjectSelector) {
                      await onOpenObjectSelector(obj.id);
                    }
                    // Finally close the modal and reset search
                    setShowSelector(false);
                    setSearchTerm('');
                  }
                }}
                disabled={getFilteredObjects().length === 0}
              >
                Add
              </Button>
            </div>
          </div>
        </div>
      )}
      <>
      </>
    </div>
  );
};

export default ObjectTree;