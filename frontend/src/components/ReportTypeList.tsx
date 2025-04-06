import React, { useEffect, useState } from 'react';
import { ReportType, getAllReportTypes, deleteReportType } from '../services/reportTypeService';
import ReportTypeForm from './ReportTypeForm';

const ReportTypeList: React.FC = () => {
  const [reportTypes, setReportTypes] = useState<ReportType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [selectedReportType, setSelectedReportType] = useState<ReportType | undefined>(undefined);

  const fetchReportTypes = async () => {
    try {
      setLoading(true);
      const data = await getAllReportTypes();
      setReportTypes(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch report types');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportTypes();
  }, []);

  const handleEdit = (reportType: ReportType) => {
    setSelectedReportType(reportType);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteReportType(id);
      await fetchReportTypes();
    } catch (err) {
      setError('Failed to delete report type');
      console.error(err);
    }
  };

  const handleFormSubmit = async () => {
    setShowForm(false);
    setSelectedReportType(undefined);
    await fetchReportTypes();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setSelectedReportType(undefined);
  };

  if (loading) {
    return <div>Loading report types...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (showForm) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">
          {selectedReportType ? 'Edit Report Type' : 'Create Report Type'}
        </h1>
        <ReportTypeForm
          reportType={selectedReportType}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Report Types</h1>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Create Report Type
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportTypes.map((reportType) => (
          <div key={reportType.id} className="border rounded-lg p-4 shadow-sm">
            <h2 className="text-xl font-semibold">{reportType.name}</h2>
            <p className="text-gray-600 mt-2">{reportType.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700">
                {reportType.dataSource}
              </span>
              {reportType.isPublic && (
                <span className="inline-block bg-green-200 rounded-full px-3 py-1 text-sm font-semibold text-green-700">
                  Public
                </span>
              )}
              {!reportType.active && (
                <span className="inline-block bg-red-200 rounded-full px-3 py-1 text-sm font-semibold text-red-700">
                  Inactive
                </span>
              )}
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => handleEdit(reportType)}
                className="px-3 py-1 text-sm text-indigo-600 hover:text-indigo-900 focus:outline-none"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(reportType.id)}
                className="px-3 py-1 text-sm text-red-600 hover:text-red-900 focus:outline-none"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReportTypeList; 