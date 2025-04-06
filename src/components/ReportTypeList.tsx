import React, { useEffect, useState, useMemo } from 'react';
import { ReportType, reportTypeService } from '@/services/reportTypeService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Pencil, Trash2, Search, ArrowUpDown } from 'lucide-react';
import ReportTypeForm from './ReportTypeForm';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

type SortField = 'name' | 'createdAt' | 'active';
type SortOrder = 'asc' | 'desc';

export const ReportTypeList: React.FC = () => {
  const [reportTypes, setReportTypes] = useState<ReportType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState<ReportType | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const { toast } = useToast();

  const fetchReportTypes = async () => {
    try {
      setLoading(true);
      const data = await reportTypeService.getAll();
      setReportTypes(data);
      setError(null);
    } catch (err) {
      const errorMessage = 'Failed to fetch report types';
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
      console.error('Error fetching report types:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportTypes();
  }, []);

  const handleCreate = () => {
    setSelectedReportType(undefined);
    setShowForm(true);
  };

  const handleEdit = (reportType: ReportType) => {
    setSelectedReportType(reportType);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this report type?')) {
      try {
        await reportTypeService.delete(id);
        await fetchReportTypes();
        toast({
          title: "Success",
          description: "Report type deleted successfully",
        });
      } catch (err) {
        const errorMessage = 'Failed to delete report type';
        toast({
          variant: "destructive",
          title: "Error",
          description: errorMessage,
        });
        console.error('Error deleting report type:', err);
      }
    }
  };

  const handleFormSubmit = async (reportType: Partial<ReportType>) => {
    try {
      if (selectedReportType) {
        await reportTypeService.update(selectedReportType.id, reportType);
        toast({
          title: "Success",
          description: "Report type updated successfully",
        });
      } else {
        await reportTypeService.create(reportType);
        toast({
          title: "Success",
          description: "Report type created successfully",
        });
      }
      setShowForm(false);
      await fetchReportTypes();
    } catch (err) {
      const errorMessage = 'Failed to save report type';
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
      console.error('Error saving report type:', err);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setSelectedReportType(undefined);
  };

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const filteredAndSortedReportTypes = useMemo(() => {
    let result = [...reportTypes];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (rt) =>
          rt.name.toLowerCase().includes(query) ||
          rt.description.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'active':
          comparison = (a.active === b.active) ? 0 : a.active ? 1 : -1;
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [reportTypes, searchQuery, sortField, sortOrder]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (showForm) {
    return (
      <ReportTypeForm
        reportType={selectedReportType}
        onSubmit={handleFormSubmit}
        onCancel={handleFormCancel}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Report Types</h1>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Create Report Type
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search report types..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleSort('name')}
          className="flex items-center space-x-1"
        >
          <span>Name</span>
          <ArrowUpDown className="h-4 w-4" />
          {sortField === 'name' && (
            <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
          )}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleSort('createdAt')}
          className="flex items-center space-x-1"
        >
          <span>Created</span>
          <ArrowUpDown className="h-4 w-4" />
          {sortField === 'createdAt' && (
            <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
          )}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleSort('active')}
          className="flex items-center space-x-1"
        >
          <span>Status</span>
          <ArrowUpDown className="h-4 w-4" />
          {sortField === 'active' && (
            <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAndSortedReportTypes.map((reportType) => (
          <Card key={reportType.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{reportType.name}</span>
                <div className="space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(reportType)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(reportType.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">{reportType.description}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className={`text-xs px-2 py-1 rounded ${
                  reportType.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {reportType.active ? 'Active' : 'Inactive'}
                </span>
                <span className="text-xs text-gray-500">
                  Created: {new Date(reportType.createdAt).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}; 