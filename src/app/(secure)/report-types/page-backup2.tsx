"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Edit2, Trash2, ArrowUpDown, ChevronLeft, ChevronRight, MoreHorizontal, FileText, Calendar, User, Users, ArrowRight, Filter, X, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
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
import { useAllReportTypes, useDeleteReportType, useInvalidateAllReportTypes } from "@/hooks/report-type-hook";
import ToastMessage from "./summary/summary-helper";
import { useReportTypeFormContext } from "@/contexts/report-type-form-context";
import { defaultReportType } from "@/helper/report-type/report-type-helper";
import { ReportType } from "@/components/model/report-type";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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

export default function ReportTypesPage() {
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReportType, setSelectedReportType] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [sortBy, setSortBy] = useState<"name" | "createdAt" | "updatedAt">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [existingReportTypes, setExistingReportTypes] = useState<ExistingReportType[]>([]);
  // List view states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {allReportTypeResponse}  = useAllReportTypes();
  const deleteReportType = useDeleteReportType();
  const [showDeleteToast, setShowDeleteToast] = useState(false);
  const {invalidateAllReportTypes} = useInvalidateAllReportTypes();
  const { setReportTypeId, setReportType } = useReportTypeFormContext();
  const router = useRouter();

  useEffect(() => {
    if (Array.isArray(allReportTypeResponse?.data)) {
      const transformed = allReportTypeResponse.data.map((item): ExistingReportType => ({
        id: item?.id || '',
        name: item?.label || item.name,
        description: item?.description || '',
        icon: '/file.svg',
        color: '#888888',
        createdAt:new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      setExistingReportTypes(transformed);
    }
  }, [allReportTypeResponse?.data]); // ✅ clean, no stringify

  useEffect(() => {
    if (isCreating) {
      setReportTypeId('');
      setReportType(defaultReportType);
    }
  }, [isCreating])
  
  
  const handleDelete = async (reportType: any) => {
    deleteReportType.mutate(
      { reportTypeId: reportType?.id as string },
      {
        onSuccess: () => {
          invalidateAllReportTypes();
          setShowDeleteToast(true);
          setTimeout(() => setShowDeleteToast(false), 3000);
        },
        onError: (error) => {
          console.error("Error during deletion:", error);
        },
      }
    );
  };

  const handleEdit = async (reportType: any) => {
    router.push(`/report-types/define-relationships/${reportType?.id}`);
  }

  const handleEditLayout = async (reportType: any) => {
    setReportTypeId(reportType?.id)
    router.push(`/report-types/summary/edit-layout`);
  }

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

  const colorMap = {
    "tabular": "bg-blue-50 text-blue-600 border-blue-200",
    "summary": "bg-green-50 text-green-600 border-green-200",
    "matrix": "bg-red-50 text-red-600 border-red-200",
    "joined": "bg-orange-50 text-orange-600 border-orange-200"
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Main Content */}
      <div className="flex-1 p-4 md:p-6">
        <div className="max-w-6xl mx-auto space-y-6">
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
                    <div key={report.id} className="group">
                      <Card
                        className={cn(
                          "cursor-pointer transition-all duration-200 ease-in-out hover:shadow-lg border overflow-hidden",
                          selectedReportType === report.id
                            ? "border-2 shadow-sm"
                            : "border-border hover:border-muted-foreground/50"
                        )}
                        style={{
                          borderColor: selectedReportType === report.id ? report.color : undefined,
                          backgroundColor: selectedReportType === report.id ? `${report.color}10` : ''
                        }}
                      >
                        <label htmlFor={`report-type-${report.id}`} className="block cursor-pointer p-5">
                          <div className="flex items-start gap-4">
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
                                  className="p-2 rounded-full flex items-center justify-center"
                                  style={{ backgroundColor: `${report.color}20` }}
                                >
                                  <Image
                                    src={report.icon}
                                    alt={`${report.name} icon`}
                                    width={22}
                                    height={22}
                                  />
                                </div>
                                <Badge 
                                  variant="outline" 
                                  className={cn(
                                    "text-xs font-medium",
                                    colorMap[report.id as keyof typeof colorMap] || "bg-slate-100 text-slate-600"
                                  )}
                                >
                                  {report.id.charAt(0).toUpperCase() + report.id.slice(1)}
                                </Badge>
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
              <div className="flex justify-end items-center gap-4 mt-8">
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
                    className={`px-8 transition-all duration-200 ease-in-out ${!selectedReportType ? "opacity-50 cursor-not-allowed" : "hover:opacity-90 hover:shadow-md"}`}
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
              {/* Enhanced Report Types List View */}
              <div className="bg-card rounded-xl shadow-sm border overflow-hidden">
                <div className="p-5 border-b">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h1 className="text-2xl font-semibold tracking-tight">Report Types</h1>
                      <p className="text-muted-foreground text-sm mt-1">
                        Manage and organize your report templates
                      </p>
                    </div>
                    <Button onClick={() => setIsCreating(true)} className="shadow-sm hover:shadow transition-shadow">
                      <Plus className="h-4 w-4 mr-2" />
                      New Report Type
                    </Button>
                  </div>
                </div>
                
                {showDeleteToast && (
                  <div className="px-5 py-3 animate-in fade-in slide-in-from-top duration-300">
                    <ToastMessage type="success" message="Report Type Deleted Successfully" />
                  </div>
                )}
                
                {/* Stats Section */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-5 bg-muted/10">
                  <div className="flex items-center gap-4 p-3 bg-card rounded-lg border shadow-sm">
                    <div className="p-3 rounded-full bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Total Report Types</p>
                      <div className="text-2xl font-bold">{allReportTypeResponse?.data?.length || 0}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-3 bg-card rounded-lg border shadow-sm">
                    <div className="p-3 rounded-full bg-orange-100">
                      <Calendar className="h-5 w-5 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Recently Updated</p>
                      <div className="text-2xl font-bold">
                        {existingReportTypes.length > 0
                          ? formatDate(
                            existingReportTypes
                              .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0]
                              .updatedAt
                          )
                          : 'N/A'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-3 bg-card rounded-lg border shadow-sm">
                    <div className="p-3 rounded-full bg-blue-100">
                      <Users className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Templates</p>
                      <div className="text-2xl font-bold">{reportTypes.length}</div>
                    </div>
                  </div>
                </div>

                {/* Search, Sort, Filters */}
                <div className="p-4 border-y bg-muted/20">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-[280px]">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-3.5 w-3.5" />
                        <Input
                          type="text"
                          placeholder="Search report types..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-9 h-9 text-sm w-full max-w-md"
                        />
                        {searchQuery && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 text-muted-foreground"
                            onClick={() => setSearchQuery("")}
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Select value={sortBy} onValueChange={(value) => handleSortChange(value as any)}>
                          <SelectTrigger className="w-[130px] h-9 text-xs">
                            <div className="flex items-center">
                              <Filter className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                              <SelectValue placeholder="Sort by" />
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="name">Name</SelectItem>
                            <SelectItem value="createdAt">Created Date</SelectItem>
                            <SelectItem value="updatedAt">Updated Date</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 text-xs"
                          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                        >
                          <ArrowUpDown className="h-3.5 w-3.5 mr-1.5" />
                          {sortOrder === "asc" ? "Asc" : "Desc"}
                        </Button>
                      </div>
                    </div>
                    <Select value={String(itemsPerPage)} onValueChange={handleItemsPerPageChange}>
                      <SelectTrigger className="w-[90px] h-9 text-xs">
                        <SelectValue placeholder="Per page" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 items</SelectItem>
                        <SelectItem value="10">10 items</SelectItem>
                        <SelectItem value="20">20 items</SelectItem>
                        <SelectItem value="50">50 items</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Report Items */}
                <div className="divide-y">
                  {currentItems.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="rounded-full bg-muted/30 p-3 inline-flex mx-auto mb-4">
                        <FileText className="h-8 w-8 text-muted-foreground/50" />
                      </div>
                      <h3 className="text-base font-medium">No report types found</h3>
                      <p className="text-sm text-muted-foreground mt-1 mb-4 max-w-md mx-auto">
                        {searchQuery ? "Try adjusting your search criteria" : "Create your first report type to get started"}
                      </p>
                      {!searchQuery && (
                        <Button size="sm" onClick={() => setIsCreating(true)}>
                          <Plus className="h-4 w-4 mr-1.5" />
                          Create Report Type
                        </Button>
                      )}
                    </div>
                  ) : (
                    currentItems.map((reportType) => (
                      <div 
                        key={reportType.id} 
                        className="group hover:bg-muted/10 transition-colors duration-150"
                      >
                        <div className="px-5 py-4">
                          <div className="flex items-start sm:items-center justify-between gap-4">
                            <div className="flex gap-4 flex-1 min-w-0">
                              <div
                                className="p-3 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors group-hover:bg-opacity-75"
                                style={{ backgroundColor: `${reportType.color}15` }}
                              >
                                <Image src={reportType.icon} alt={`${reportType.name} icon`} width={20} height={20} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3 className="text-base font-medium truncate group-hover:text-primary transition-colors">{reportType.name}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                                  {reportType.description}
                                </p>
                                <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2 text-xs text-muted-foreground">
                                  <div className="flex items-center gap-1.5">
                                    <Calendar className="h-3.5 w-3.5" />
                                    <span>Created: {formatDate(reportType.createdAt as string)}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <User className="h-3.5 w-3.5" />
                                    <span>Updated: {formatDate(reportType.updatedAt as string)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-muted-foreground hover:text-foreground hover:bg-muted/20"
                                onClick={() => handleEdit(reportType)}
                              >
                                <Edit2 className="h-4 w-4 mr-1.5" />
                                <span className="hidden sm:inline">Edit</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-muted-foreground hover:text-foreground hover:bg-muted/20"
                                onClick={() => handleEditLayout(reportType)}
                              >
                                <FileText className="h-4 w-4 mr-1.5" />
                                <span className="hidden sm:inline">Layout</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                                onClick={() => handleDelete(reportType)}
                              >
                                <Trash2 className="h-4 w-4 mr-1.5" />
                                <span className="hidden sm:inline">Delete</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-5 py-3 border-t bg-muted/20">
                    <p className="text-xs text-muted-foreground">
                      Showing <span className="font-medium">{startIndex + 1}</span> to <span className="font-medium">{Math.min(endIndex, totalItems)}</span> of <span className="font-medium">{totalItems}</span>
                    </p>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="h-7 w-7 text-xs"
                      >
                        <ChevronLeft className="h-3.5 w-3.5" />
                      </Button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(page => {
                          // Show first page, last page, current page, and pages adjacent to current
                          return (
                            page === 1 ||
                            page === totalPages ||
                            Math.abs(page - currentPage) <= 1
                          );
                        })
                        .map((page, index, array) => {
                          // Add ellipsis when there are gaps
                          if (index > 0 && array[index - 1] !== page - 1) {
                            return (
                              <span key={`ellipsis-${page}`} className="px-1 text-xs text-muted-foreground">...</span>
                            );
                          }
                          return (
                            <Button
                              key={page}
                              variant={currentPage === page ? "default" : "outline"}
                              size="icon"
                              className="h-7 w-7 text-xs"
                              onClick={() => handlePageChange(page)}
                            >
                              {page}
                            </Button>
                          );
                        })}
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="h-7 w-7 text-xs"
                      >
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
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