import React, { useState } from 'react';
import { Field } from '../model/Field';
import { Filter } from '../model/Filter';
import { v4 as uuidv4 } from 'uuid';
import { FilterPanel } from './FilterPanel';
import FilterFieldSelector from './FilterFieldSelector';

// Sample fields for demonstration
const sampleFields: Field[] = [
  { id: 'firstName', name: 'First Name', type: 'text', category: 'Contact Information' },
  { id: 'lastName', name: 'Last Name', type: 'text', category: 'Contact Information' },
  { id: 'email', name: 'Email', type: 'email', category: 'Contact Information' },
  { id: 'phone', name: 'Phone', type: 'phone', category: 'Contact Information' },
  { id: 'company', name: 'Company', type: 'text', category: 'Organization' },
  { id: 'title', name: 'Title', type: 'text', category: 'Organization' },
  { id: 'department', name: 'Department', type: 'picklist', category: 'Organization' },
  { id: 'createdDate', name: 'Created Date', type: 'date', category: 'System Fields' },
  { id: 'lastModifiedDate', name: 'Last Modified Date', type: 'date', category: 'System Fields' },
  { id: 'amount', name: 'Amount', type: 'currency', category: 'Financial' },
  { id: 'quantity', name: 'Quantity', type: 'number', category: 'Financial' },
  { id: 'isActive', name: 'Is Active', type: 'checkbox', category: 'Status' },
];

// Group fields by category
const fieldsByCategory = sampleFields.reduce((acc, field) => {
  const category = field.category || 'Other';
  acc[category] = acc[category] || [];
  acc[category].push(field);
  return acc;
}, {} as Record<string, any[]>);

export function FilterExample() {
  // State for filters
  const [filters, setFilters] = useState<Filter[]>([
    {
      id: uuidv4(),
      field: sampleFields[0], // First Name
      operator: 'starts_with',
      value: 'A',
    }
  ]);
  
  // State for filter logic
  const [filterLogic, setFilterLogic] = useState<'and' | 'or' | 'custom'>('and');
  const [customFilterFormula, setCustomFilterFormula] = useState('');
  
  // State for field selector modal
  const [showFieldSelector, setShowFieldSelector] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    'Contact Information': true,
    'Organization': false,
    'System Fields': false,
    'Financial': false,
    'Status': false
  });
  const [filterSearchTerm, setFilterSearchTerm] = useState('');
  
  // Handle adding a new filter
  const handleAddFilter = (field: Field) => {
    const newFilter: Filter = {
      id: uuidv4(),
      field,
      operator: 'equals',
      value: '',
    };
    
    setFilters([...filters, newFilter]);
  };
  
  // Toggle category expansion
  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };
  
  // Convert Field[] to the expected type for FilterFieldSelector
  const fieldSelectorProps = sampleFields.map(field => ({
    id: field.id,
    name: field.name,
    type: field.type,
    category: field.category || 'Other', // Ensure category is never undefined
    icon: field.icon
  }));
  
  return (
    <div className="p-4 max-w-[900px] mx-auto">
      <h1 className="text-2xl font-bold mb-6">Filter Example</h1>
      
      <div className="flex gap-4">
        <div className="w-3/4">
          {/* Main filter panel */}
          <FilterPanel
            filters={filters}
            fields={sampleFields}
            onFiltersChange={setFilters}
            filterLogic={filterLogic}
            customFilterFormula={customFilterFormula}
            onFilterLogicChange={setFilterLogic}
            onCustomFormulaChange={setCustomFilterFormula}
            onClose={() => {}}
          />
          
          {/* Example of filtered data results */}
          <div className="bg-white shadow-sm border border-gray-200 rounded-md p-4 mt-6">
            <h2 className="text-lg font-semibold mb-3">Results</h2>
            <div className="text-sm text-gray-600">
              {filters.length > 0 ? (
                <p>Showing records where: First Name starts with "A"</p>
              ) : (
                <p>No filters applied. Showing all records.</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="w-1/4">
          {/* Example controls */}
          <div className="bg-white shadow-sm border border-gray-200 rounded-md p-4">
            <h2 className="text-sm font-semibold mb-3">Demo Controls</h2>
            <button 
              className="bg-blue-600 text-white rounded-md px-3 py-1.5 text-sm font-medium hover:bg-blue-700"
              onClick={() => setShowFieldSelector(true)}
            >
              Show Field Selector
            </button>
          </div>
          
          {/* Field selector (shown when adding a new filter) */}
          <FilterFieldSelector
            isOpen={showFieldSelector}
            onClose={() => setShowFieldSelector(false)}
            fieldsByCategory={fieldsByCategory}
            expandedCategories={expandedCategories}
            toggleCategory={toggleCategory}
            filterSearchTerm={filterSearchTerm}
            onFilterSearchTermChange={setFilterSearchTerm}
            addFilter={handleAddFilter}
            fields={fieldSelectorProps}
            onSelect={handleAddFilter}
          />
        </div>
      </div>
    </div>
  );
} 