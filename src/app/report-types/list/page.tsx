"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Plus, Edit2, Trash2, ArrowUpDown } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface ReportType {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

type SortField = "name" | "createdAt" | "updatedAt";
type SortOrder = "asc" | "desc";

export default function ReportTypesListPage() {
  const [reportTypes, setReportTypes] = useState<ReportType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  // Mock data for initial development
  useEffect(() => {
    const mockReportTypes: ReportType[] = [
      {
        id: "1",
        name: "Sales Report",
        description: "Monthly sales report with regional breakdown",
        icon: "/file.svg",
        color: "#1E88E5",
        createdAt: "2023-01-15T10:30:00Z",
        updatedAt: "2023-02-20T14:45:00Z"
      },
      {
        id: "2",
        name: "Inventory Status",
        description: "Current inventory levels across warehouses",
        icon: "/file.svg",
        color: "#43A047",
        createdAt: "2023-03-05T09:15:00Z",
        updatedAt: "2023-03-10T11:30:00Z"
      },
      {
        id: "3",
        name: "Customer Analytics",
        description: "Customer behavior and purchase patterns",
        icon: "/file.svg",
        color: "#E53935",
        createdAt: "2023-04-12T16:20:00Z",
        updatedAt: "2023-05-01T10:15:00Z"
      }
    ];
    setReportTypes(mockReportTypes);
    setLoading(false);
  }, []);

  const handleDelete = async (reportType: ReportType) => {
    if (window.confirm(`Are you sure you want to delete ${reportType.name}?`)) {
      try {
        // TODO: Implement actual API call
        setReportTypes(reportTypes.filter(rt => rt.id !== reportType.id));
      } catch (error) {
        setError("Failed to delete report type");
      }
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
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
      } else if (sortField === "createdAt") {
        return multiplier * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      } else if (sortField === "updatedAt") {
        return multiplier * (new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());
      }
      return 0;
    });

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-6">{error}</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Navigation Bar */}
      <nav className="bg-primary text-primary-foreground py-4 px-6 shadow-md">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image 
              src="/next.svg" 
              alt="Report Designer Logo" 
              width={80} 
              height={20}
              className="dark:invert" 
            />
            <span className="font-bold text-lg">Report Designer</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost">Home</Button>
            </Link>
            <Link href="/reports">
              <Button variant="ghost">Reports</Button>
            </Link>
            <Link href="/report-builder">
              <Button variant="ghost">Report Builder</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 p-6 md:p-10">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">Your Report Types</h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Manage your existing report types or create new ones.
            </p>
          </div>
          
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
            <Link href="/report-types">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create New Report Type
              </Button>
            </Link>
          </div>

          <div className="grid gap-4">
            {filteredAndSortedReportTypes.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">No report types found. Create your first report type to get started.</p>
                </CardContent>
              </Card>
            ) : (
              filteredAndSortedReportTypes.map((reportType) => (
                <Card key={reportType.id}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex items-center gap-3">
                      <div 
                        className="p-2 rounded-md flex items-center justify-center" 
                        style={{ backgroundColor: `${reportType.color}20` }}
                      >
                        <Image
                          src={reportType.icon}
                          alt={`${reportType.name} icon`}
                          width={24}
                          height={24}
                        />
                      </div>
                      <CardTitle className="text-lg font-medium">
                        {reportType.name}
                      </CardTitle>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        asChild
                      >
                        <Link href={`/reports/create?type=${reportType.id}`}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 5v14M5 12h14"/>
                          </svg>
                        </Link>
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
                    <p className="text-sm text-muted-foreground mb-4">
                      {reportType.description}
                    </p>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <div>
                        <span className="font-medium">Created:</span> {formatDate(reportType.createdAt)}
                      </div>
                      <div>
                        <span className="font-medium">Updated:</span> {formatDate(reportType.updatedAt)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 