"use client";

import { useState } from 'react';
import { useReportType } from '@/contexts/ReportTypeContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Search, Plus, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Mock data for available objects
const availableObjects = [
  {
    name: 'Account',
    fields: ['Id', 'Name', 'Type', 'Industry', 'AnnualRevenue', 'CreatedDate'],
  },
  {
    name: 'Contact',
    fields: ['Id', 'FirstName', 'LastName', 'Email', 'Phone', 'AccountId'],
  },
  {
    name: 'Opportunity',
    fields: ['Id', 'Name', 'Amount', 'StageName', 'CloseDate', 'AccountId'],
  },
];

export default function SelectPrimaryObject() {
  const { state, dispatch } = useReportType();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedObject, setSelectedObject] = useState(state.reportType.primaryObject.name || '');
  const [selectedFields, setSelectedFields] = useState<string[]>(state.reportType.primaryObject.fields || []);

  const filteredObjects = availableObjects.filter(obj =>
    obj.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleObjectChange = (objectName: string) => {
    setSelectedObject(objectName);
    setSelectedFields([]);
    dispatch({
      type: 'SET_PRIMARY_OBJECT',
      payload: {
        name: objectName,
        fields: [],
      },
    });
  };

  const handleFieldToggle = (field: string) => {
    const newFields = selectedFields.includes(field)
      ? selectedFields.filter(f => f !== field)
      : [...selectedFields, field];
    
    setSelectedFields(newFields);
    dispatch({
      type: 'SET_PRIMARY_OBJECT',
      payload: {
        name: selectedObject,
        fields: newFields,
      },
    });
  };

  const selectedObjectData = availableObjects.find(obj => obj.name === selectedObject);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-2">Select Primary Object</h2>
        <p className="text-muted-foreground mb-4">
          Choose the main object for your report and select the fields you want to include.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label>Search Objects</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search objects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div>
          <Label>Primary Object</Label>
          <Select value={selectedObject} onValueChange={handleObjectChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select an object" />
            </SelectTrigger>
            <SelectContent>
              {filteredObjects.map((obj) => (
                <SelectItem key={obj.name} value={obj.name}>
                  {obj.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedObjectData && (
          <div>
            <Label>Select Fields</Label>
            <div className="mt-2 space-y-2">
              {selectedObjectData.fields.map((field) => (
                <Button
                  key={field}
                  variant={selectedFields.includes(field) ? "default" : "outline"}
                  className="mr-2 mb-2"
                  onClick={() => handleFieldToggle(field)}
                >
                  {field}
                  {selectedFields.includes(field) && (
                    <X className="ml-2 h-3 w-3" />
                  )}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 