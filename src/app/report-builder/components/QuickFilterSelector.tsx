import React from 'react';
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field, FieldType } from "../model/Field";

interface QuickFilterSelectorProps {
  accountFields: Array<{
    id: string;
    name: string;
    type: string;
    category: string;
    icon: string;
  }>;
  addFilter: (field: Field) => void;
  onOpenFullSelector: () => void;
}

const QuickFilterSelector: React.FC<QuickFilterSelectorProps> = ({
  accountFields,
  addFilter,
  onOpenFullSelector
}) => {
  return (
    <div className="mt-8 border border-dashed border-gray-300 rounded-md p-4 bg-gray-50">
      <h4 className="text-sm font-medium mb-3">Add Another Filter</h4>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="filter-field" className="text-xs mb-1 block">Field</Label>
          <Select onValueChange={(value) => {
            const field = accountFields.find(f => f.id === value);
            if (field) {
              // Convert the field to the correct type
              const typedField: Field = {
                id: field.id,
                name: field.name,
                type: field.type as FieldType,
                category: field.category,
                icon: field.icon
              };
              addFilter(typedField);
            }
          }}>
            <SelectTrigger id="filter-field" className="w-full">
              <SelectValue placeholder="Select field" />
            </SelectTrigger>
            <SelectContent>
              {accountFields.map(field => (
                <SelectItem key={field.id} value={field.id}>
                  {field.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end">
          <Button className="w-full" onClick={onOpenFullSelector}>
            Add Filter
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuickFilterSelector; 