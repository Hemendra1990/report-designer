"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Edit2, Trash2, ArrowUpDown, ChevronLeft, ChevronRight, MoreHorizontal, FileText, Calendar, User, Users } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";

// Report Types with additional details
interface BaseReportType {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ReportTypeTemplate extends BaseReportType { }

interface ExistingReportType extends BaseReportType {
  createdAt: string;
  updatedAt: string;
}

const reportTypes: ReportTypeTemplate[] = [
  {
    id: "tabular",
    name: "Tabular",
    description: "Simple list of records with optional grouping. Best for creating a straightforward list of records.",
    icon: "/file.svg",
    color: "#1E88E5" // Blue
  },
  {
    id: "summary",
    name: "Summary",
    description: "Grouped report records with subtotals and grand totals. Perfect for analyzing data across different categories.",
    icon: "/file.svg",
    color: "#43A047" // Green
  },
  {
    id: "matrix",
    name: "Matrix",
    description: "Show data in rows and columns with grand summaries. Ideal for comparing related data points in a grid layout.",
    icon: "/file.svg",
    color: "#E53935" // Red
  },
  {
    id: "joined",
    name: "Joined",
    description: "Combine data from multiple related objects. Great for creating reports that span across different data entities.",
    icon: "/file.svg",
    color: "#FB8C00" // Orange
  }
];

// Mock data for existing report types
const existingReportTypes: ExistingReportType[] = [
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

export default function ReportTypesPage() {
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReportType, setSelectedReportType] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [sortBy, setSortBy] = useState<"name" | "createdAt" | "updatedAt">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // List view states
  const [loading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async (reportType: any) => {
    if (window.confirm(`Are you sure you want to delete ${reportType.name}?`)) {
      try {
        // TODO: Implement actual API call
        // setReportTypes(reportTypes.filter(rt => rt.id !== reportType.id));
      } catch (error) {
        setError("Failed to delete report type");
      }
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

  // Enhanced sort and filter logic
  const sortedAndFilteredReportTypes = isCreating
    ? reportTypes.filter((report) =>
      report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : existingReportTypes
      .filter((report) =>
        report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
        if (sortBy === "name") {
          return sortOrder === "asc"
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name);
        }
        const dateA = new Date(a[sortBy]).getTime();
        const dateB = new Date(b[sortBy]).getTime();
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      });

  // Pagination logic
  const totalItems = sortedAndFilteredReportTypes.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = sortedAndFilteredReportTypes.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  const handleSortChange = (field: "name" | "createdAt" | "updatedAt") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  // Find the selected report object to access its color
  const selectedReport = isCreating
    ? reportTypes.find(r => r.id === selectedReportType)
    : existingReportTypes.find(r => r.id === selectedReportType);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-6">{error}</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Navigation Bar */}
      {/* <nav className="bg-primary text-primary-foreground py-4 px-6 shadow-md">
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
      </nav> */}

      {/* Main Content */}
      <div className="flex-1 p-6 md:p-10">
        <div className="max-w-6xl mx-auto space-y-10">
          {isCreating ? (
            <>
              <div className="text-center">
                <h1 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">Create Custom Report</h1>
                <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                  Select the type of report you want to create from the options below.
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search Report Types by name or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-11 text-base rounded-md border border-input focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>

              {/* Report Types as Cards with Radio Selection */}
              <RadioGroup value={selectedReportType} onValueChange={setSelectedReportType}>
                <div className="grid md:grid-cols-2 gap-6">
                  {sortedAndFilteredReportTypes.map((report) => (
                    <div key={report.id}>
                      <Card
                        className={`cursor-pointer transition-all duration-200 ease-in-out hover:shadow-lg border ${selectedReportType === report.id
                            ? `border-2`
                            : "border-border hover:border-muted-foreground/50"
                          }`}
                        style={{
                          borderColor: selectedReportType === report.id ? report.color : undefined,
                          backgroundColor: selectedReportType === report.id ? `${report.color}10` : ''
                        }}
                      >
                        <label htmlFor={`report-type-${report.id}`} className="block cursor-pointer p-6">
                          <div className="flex items-start gap-5">
                            <RadioGroupItem
                              value={report.id}
                              id={`report-type-${report.id}`}
                              className="mt-1 flex-shrink-0"
                              style={{
                                borderColor: selectedReportType === report.id ? report.color : undefined,
                              }}
                            />
                            <div className="flex-grow">
                              <div className="flex items-center gap-3 mb-3">
                                <div
                                  className="p-2 rounded-md flex items-center justify-center"
                                  style={{ backgroundColor: `${report.color}20` }}
                                >
                                  <Image
                                    src={report.icon}
                                    alt={`${report.name} icon`}
                                    width={24}
                                    height={24}
                                  />
                                </div>
                                <h3 className="font-semibold text-lg text-foreground">{report.name}</h3>
                              </div>
                              <p className="text-muted-foreground text-sm leading-relaxed">{report.description}</p>
                            </div>
                          </div>
                        </label>
                      </Card>
                    </div>
                  ))}
                </div>
              </RadioGroup>

              {/* Action Buttons */}
              <div className="flex justify-end items-center gap-4 mt-10">
                <Button
                  variant="outline"
                  size="lg"
                  className="px-6"
                  onClick={() => setIsCreating(false)}
                >
                  Cancel
                </Button>
                <Link
                  href={selectedReportType ? `/report-types/select-object?type=${selectedReportType}` : "#"}
                  aria-disabled={!selectedReportType}
                  tabIndex={!selectedReportType ? -1 : undefined}
                  className={`${!selectedReportType ? "cursor-not-allowed" : ""}`}
                >
                  <Button
                    disabled={!selectedReportType}
                    size="lg"
                    className={`px-8 transition-colors duration-200 ease-in-out ${!selectedReportType ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"}`}
                    style={{
                      backgroundColor: selectedReport?.color,
                      color: selectedReport ? getContrastYIQ(selectedReport.color) : undefined
                    }}
                  >
                    Next
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ml-2">
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight">Report Types</h1>
                  <p className="text-muted-foreground text-sm mt-1">
                    Manage and organize your report templates
                  </p>
                </div>
                <Button size="sm" onClick={() => setIsCreating(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Report Type
                </Button>
              </div>

              {/* Stats Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                <Card className="p-3">
                  <CardHeader className="flex flex-row items-center justify-between pb-1 space-y-0">
                    <CardTitle className="text-xs font-medium">Total Report Types</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent className="pt-1">
                    <div className="text-xl font-semibold">{totalItems}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {totalItems === 1 ? '1 report type' : `${totalItems} report types`} available
                    </p>
                  </CardContent>
                </Card>

                <Card className="p-3">
                  <CardHeader className="flex flex-row items-center justify-between pb-1 space-y-0">
                    <CardTitle className="text-xs font-medium">Recently Updated</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent className="pt-1">
                    <div className="text-xl font-semibold">
                      {existingReportTypes.length > 0
                        ? formatDate(
                          existingReportTypes
                            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0]
                            .updatedAt
                        )
                        : 'N/A'}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Last update</p>
                  </CardContent>
                </Card>

                <Card className="p-3">
                  <CardHeader className="flex flex-row items-center justify-between pb-1 space-y-0">
                    <CardTitle className="text-xs font-medium">Templates</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent className="pt-1">
                    <div className="text-xl font-semibold">{reportTypes.length}</div>
                    <p className="text-xs text-muted-foreground mt-1">Available for use</p>
                  </CardContent>
                </Card>
              </div>

              {/* Search, Sort, Filters */}
              <div className="bg-card rounded-lg border shadow-sm">
                <div className="p-4 space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          type="text"
                          placeholder="Search..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-9 h-8 text-sm"
                        />
                      </div>
                      <Select value={sortBy} onValueChange={handleSortChange}>
                        <SelectTrigger className="w-[160px] h-8 text-sm">
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="name">Name</SelectItem>
                          <SelectItem value="createdAt">Created</SelectItem>
                          <SelectItem value="updatedAt">Updated</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                      >
                        <ArrowUpDown className="h-4 w-4" />
                      </Button>
                    </div>
                    <Select value={String(itemsPerPage)} onValueChange={handleItemsPerPageChange}>
                      <SelectTrigger className="w-[100px] h-8 text-sm">
                        <SelectValue placeholder="Per page" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Report Cards */}
                  <div className="space-y-3">
                    {currentItems.length === 0 ? (
                      <div className="text-center py-8">
                        <FileText className="mx-auto h-10 w-10 text-muted-foreground/50" />
                        <h3 className="mt-3 text-md font-semibold">No report types</h3>
                        <p className="text-sm text-muted-foreground">Create one to get started</p>
                      </div>
                    ) : (
                      currentItems.map((reportType) => (
                        <Card key={reportType.id} className="hover:shadow transition-shadow">
                          <CardHeader className="flex flex-row items-start justify-between py-4">
                            <div className="flex gap-4">
                              <div
                                className="p-2 rounded-md flex items-center justify-center"
                                style={{ backgroundColor: `${reportType.color}20` }}
                              >
                                <Image src={reportType.icon} alt={`${reportType.name} icon`} width={24} height={24} />
                              </div>
                              <div>
                                <CardTitle className="text-lg font-semibold">{reportType.name}</CardTitle>
                                <CardDescription className="text-sm line-clamp-2">
                                  {reportType.description}
                                </CardDescription>
                                <div className="flex gap-6 mt-2 text-xs text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {formatDate(reportType.createdAt as string)}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    {formatDate(reportType.updatedAt as string)}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/reports/create?type=${reportType.id}`}>Create</Link>
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem>
                                    <Edit2 className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => handleDelete(reportType)}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </CardHeader>
                        </Card>
                      ))
                    )}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-3 border-t">
                      <p className="text-xs text-muted-foreground">
                        Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems}
                      </p>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="h-7 w-7"
                        >
                          <ChevronLeft className="h-3 w-3" />
                        </Button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="icon"
                            className="h-7 w-7 text-xs"
                            onClick={() => handlePageChange(page)}
                          >
                            {page}
                          </Button>
                        ))}
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="h-7 w-7"
                        >
                          <ChevronRight className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>

          )}
        </div>
      </div>
    </div>
  );
}

// Helper function to determine text color (black/white) based on background hex color
function getContrastYIQ(hexcolor: string): string {
  hexcolor = hexcolor.replace("#", "");
  const r = parseInt(hexcolor.substring(0, 2), 16);
  const g = parseInt(hexcolor.substring(2, 4), 16);
  const b = parseInt(hexcolor.substring(4, 6), 16);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return (yiq >= 128) ? '#000000' : '#FFFFFF';
}