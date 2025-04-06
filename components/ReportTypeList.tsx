import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Plus, Edit2, Trash2, ArrowUpDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ReportTypeForm } from "./ReportTypeForm";

interface ReportType {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

type SortField = "name" | "createdAt" | "active";
type SortOrder = "asc" | "desc";

export function ReportTypeList() {
  const [reportTypes, setReportTypes] = useState<ReportType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState<ReportType | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const { toast } = useToast();

  // Mock data for initial development
  useEffect(() => {
    const mockReportTypes: ReportType[] = [
      {
        id: "tabular",
        name: "Tabular",
        description: "Simple list of records with optional grouping.",
        icon: "/file.svg",
        color: "#1E88E5"
      },
      {
        id: "summary",
        name: "Summary",
        description: "Grouped report records with subtotals and grand totals.",
        icon: "/file.svg",
        color: "#43A047"
      },
      {
        id: "matrix",
        name: "Matrix",
        description: "Show data in rows and columns with grand summaries.",
        icon: "/file.svg",
        color: "#E53935"
      },
      {
        id: "joined",
        name: "Joined",
        description: "Combine data from multiple related objects.",
        icon: "/file.svg",
        color: "#FB8C00"
      }
    ];
    setReportTypes(mockReportTypes);
    setLoading(false);
  }, []);

  const handleCreate = () => {
    setSelectedReportType(null);
    setShowForm(true);
  };

  const handleEdit = (reportType: ReportType) => {
    setSelectedReportType(reportType);
    setShowForm(true);
  };

  const handleDelete = async (reportType: ReportType) => {
    if (window.confirm(`Are you sure you want to delete ${reportType.name}?`)) {
      try {
        // TODO: Implement actual API call
        setReportTypes(reportTypes.filter(rt => rt.id !== reportType.id));
        toast({
          title: "Success",
          description: `${reportType.name} has been deleted.`,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete report type.",
          variant: "destructive",
        });
      }
    }
  };

  const handleFormSubmit = async (formData: Omit<ReportType, "id">) => {
    try {
      if (selectedReportType) {
        // Update existing report type
        setReportTypes(reportTypes.map(rt => 
          rt.id === selectedReportType.id 
            ? { ...rt, ...formData }
            : rt
        ));
        toast({
          title: "Success",
          description: `${formData.name} has been updated.`,
        });
      } else {
        // Create new report type
        const newReportType: ReportType = {
          ...formData,
          id: Math.random().toString(36).substr(2, 9),
        };
        setReportTypes([...reportTypes, newReportType]);
        toast({
          title: "Success",
          description: `${formData.name} has been created.`,
        });
      }
      setShowForm(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save report type.",
        variant: "destructive",
      });
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const filteredAndSortedReportTypes = reportTypes
    .filter(reportType =>
      reportType.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reportType.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const multiplier = sortOrder === "asc" ? 1 : -1;
      if (sortField === "name") {
        return multiplier * a.name.localeCompare(b.name);
      }
      // Add more sort fields as needed
      return 0;
    });

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Search report types..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          New Report Type
        </Button>
      </div>

      {showForm && (
        <ReportTypeForm
          reportType={selectedReportType}
          onSubmit={handleFormSubmit}
          onCancel={() => setShowForm(false)}
        />
      )}

      <div className="grid gap-4">
        {filteredAndSortedReportTypes.map((reportType) => (
          <Card key={reportType.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">
                {reportType.name}
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(reportType)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(reportType)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {reportType.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 