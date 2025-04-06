"use client";

import { useState } from 'react';
import { useReportType } from '@/contexts/ReportTypeContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Plus, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

// Mock data for available objects
const availableObjects = [
  'Account',
  'Contact',
  'Opportunity',
  'Lead',
  'Case',
  'User',
];

const relationshipTypes = [
  { value: 'one-to-one', label: 'One-to-One' },
  { value: 'one-to-many', label: 'One-to-Many' },
  { value: 'many-to-many', label: 'Many-to-Many' },
] as const;

export default function DefineRelationships() {
  const { state, dispatch } = useReportType();
  const [fromObject, setFromObject] = useState('');
  const [toObject, setToObject] = useState('');
  const [relationType, setRelationType] = useState<'one-to-one' | 'one-to-many' | 'many-to-many'>('one-to-one');

  const handleAddRelationship = () => {
    if (fromObject && toObject && relationType) {
      dispatch({
        type: 'ADD_RELATIONSHIP',
        payload: {
          fromObject,
          toObject,
          type: relationType,
        },
      });
      // Reset form
      setFromObject('');
      setToObject('');
      setRelationType('one-to-one');
    }
  };

  const handleRemoveRelationship = (index: number) => {
    dispatch({
      type: 'REMOVE_RELATIONSHIP',
      payload: index,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-2">Define Relationships</h2>
        <p className="text-muted-foreground mb-4">
          Define relationships between objects to include related data in your report.
        </p>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Primary Object</CardTitle>
            <CardDescription>
              {state.reportType.primaryObject.name || 'No primary object selected'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Selected Fields: {state.reportType.primaryObject.fields.join(', ')}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label>From Object</Label>
            <Select value={fromObject} onValueChange={setFromObject}>
              <SelectTrigger>
                <SelectValue placeholder="Select object" />
              </SelectTrigger>
              <SelectContent>
                {availableObjects.map((obj) => (
                  <SelectItem key={obj} value={obj}>
                    {obj}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>To Object</Label>
            <Select value={toObject} onValueChange={setToObject}>
              <SelectTrigger>
                <SelectValue placeholder="Select object" />
              </SelectTrigger>
              <SelectContent>
                {availableObjects.map((obj) => (
                  <SelectItem key={obj} value={obj}>
                    {obj}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Relationship Type</Label>
            <Select 
              value={relationType} 
              onValueChange={(value: 'one-to-one' | 'one-to-many' | 'many-to-many') => setRelationType(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {relationshipTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          onClick={handleAddRelationship}
          disabled={!fromObject || !toObject || !relationType}
          className="w-full"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Relationship
        </Button>

        {state.reportType.relationships.length > 0 && (
          <div className="space-y-2">
            <Label>Defined Relationships</Label>
            {state.reportType.relationships.map((rel, index) => (
              <Card key={index}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{rel.fromObject}</span>
                    <span className="text-muted-foreground">→</span>
                    <span className="font-medium">{rel.toObject}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      ({rel.type})
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveRelationship(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 