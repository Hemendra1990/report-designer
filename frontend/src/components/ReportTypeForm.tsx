import React, { useState } from 'react';
import { ReportType, createReportType, updateReportType } from '../services/reportTypeService';

interface ReportTypeFormProps {
  reportType?: ReportType;
  onSubmit: () => void;
  onCancel: () => void;
}

const ReportTypeForm: React.FC<ReportTypeFormProps> = ({ reportType, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: reportType?.name || '',
    description: reportType?.description || '',
    queryTemplate: reportType?.queryTemplate || '',
    parametersSchema: reportType?.parametersSchema || '',
    isPublic: reportType?.isPublic || false,
    dataSource: reportType?.dataSource || '',
    visualizationOptions: reportType?.visualizationOptions || '',
    active: reportType?.active || true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (reportType) {
        await updateReportType(reportType.id, formData);
      } else {
        await createReportType(formData);
      }
      onSubmit();
    } catch (err) {
      setError('Failed to save report type');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Name
        </label>
        <input
          type="text"
          name="name"
          id="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          name="description"
          id="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label htmlFor="queryTemplate" className="block text-sm font-medium text-gray-700">
          Query Template
        </label>
        <textarea
          name="queryTemplate"
          id="queryTemplate"
          value={formData.queryTemplate}
          onChange={handleChange}
          rows={5}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 font-mono"
        />
      </div>

      <div>
        <label htmlFor="parametersSchema" className="block text-sm font-medium text-gray-700">
          Parameters Schema
        </label>
        <textarea
          name="parametersSchema"
          id="parametersSchema"
          value={formData.parametersSchema}
          onChange={handleChange}
          rows={5}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 font-mono"
        />
      </div>

      <div>
        <label htmlFor="dataSource" className="block text-sm font-medium text-gray-700">
          Data Source
        </label>
        <input
          type="text"
          name="dataSource"
          id="dataSource"
          value={formData.dataSource}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label htmlFor="visualizationOptions" className="block text-sm font-medium text-gray-700">
          Visualization Options
        </label>
        <textarea
          name="visualizationOptions"
          id="visualizationOptions"
          value={formData.visualizationOptions}
          onChange={handleChange}
          rows={5}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 font-mono"
        />
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            name="isPublic"
            id="isPublic"
            checked={formData.isPublic}
            onChange={handleChange}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-900">
            Public
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="active"
            id="active"
            checked={formData.active}
            onChange={handleChange}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
            Active
          </label>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {loading ? 'Saving...' : reportType ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
};

export default ReportTypeForm; 