import React, { useState, useEffect } from 'react';
import { ReportType } from '@/services/reportTypeService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

interface ReportTypeFormProps {
  reportType?: ReportType;
  onSubmit: (data: Partial<ReportType>) => void;
  onCancel: () => void;
}

interface FormData {
  name: string;
  description: string;
  queryTemplate: string;
  parametersSchema: string;
  visualizationOptions: string;
  active: boolean;
}

const ReportTypeForm: React.FC<ReportTypeFormProps> = ({
  reportType,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    queryTemplate: '',
    parametersSchema: '{}',
    visualizationOptions: '[]',
    active: true,
  });

  useEffect(() => {
    if (reportType) {
      setFormData({
        name: reportType.name,
        description: reportType.description,
        queryTemplate: reportType.queryTemplate,
        parametersSchema: JSON.stringify(reportType.parametersSchema, null, 2),
        visualizationOptions: JSON.stringify(reportType.visualizationOptions, null, 2),
        active: reportType.active,
      });
    }
  }, [reportType]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, active: checked }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data: Partial<ReportType> = {
        ...formData,
        parametersSchema: JSON.parse(formData.parametersSchema),
        visualizationOptions: JSON.parse(formData.visualizationOptions),
      };
      onSubmit(data);
    } catch (error) {
      console.error('Error parsing JSON:', error);
      alert('Invalid JSON in parameters schema or visualization options');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="queryTemplate">Query Template</Label>
          <Textarea
            id="queryTemplate"
            name="queryTemplate"
            value={formData.queryTemplate}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="parametersSchema">Parameters Schema (JSON)</Label>
          <Textarea
            id="parametersSchema"
            name="parametersSchema"
            value={formData.parametersSchema}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="visualizationOptions">Visualization Options (JSON)</Label>
          <Textarea
            id="visualizationOptions"
            name="visualizationOptions"
            value={formData.visualizationOptions}
            onChange={handleChange}
            required
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="active"
            checked={formData.active}
            onCheckedChange={handleCheckboxChange}
          />
          <Label htmlFor="active">Active</Label>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {reportType ? 'Update' : 'Create'} Report Type
        </Button>
      </div>
    </form>
  );
};

export default ReportTypeForm; 