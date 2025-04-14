"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { motion } from "framer-motion";
import { useAllReport, useDeleteReportById, useInvalidateAllReport } from "@/hooks/report-hook";
import ToastMessage from "../report-types/summary/summary-helper";
import { useRouter } from "next/navigation";

// Transform report data function remains the same
const transformReportData = (reportDataArray) => {
  const reportTypes = ["tabular", "summary", "matrix", "joined"];
  const statuses = ["active", "inactive"];

  return reportDataArray?.map(report => {
    const createdDate = new Date(report.createdOn);
    const modifiedDate = new Date(report.updatedOn);

    const createdDateStr = new Intl.DateTimeFormat('en-US', {
      month: 'long', day: 'numeric', year: 'numeric'
    }).format(createdDate);

    const modifiedDateStr = new Intl.DateTimeFormat('en-US', {
      month: 'long', day: 'numeric', year: 'numeric'
    }).format(modifiedDate);

    const primaryObject = report.primaryTable[0].toUpperCase() + report.primaryTable.slice(1); // Capitalize
    const relatedObjects = report.usedTables.filter(table => table.toLowerCase() !== report.primaryTable.toLowerCase());

    return {
      id: report.id || `RT-${Math.floor(10000 + Math.random() * 90000)}`,
      name: report.name || report.label || `${primaryObject} Report`,
      description: `Auto-generated report for ${primaryObject.toLowerCase()} and related data.`,
      primaryObject,
      relatedObjects,
      createdDate: createdDateStr,
      lastModified: modifiedDateStr,
      type: reportTypes[Math.floor(Math.random() * reportTypes.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      views: Math.floor(Math.random() * 1000),
      starred: Math.random() > 0.7
    };
  });
};

// Helper function to format the date
const formatDate = (dateString: string) => {
  return dateString;
};

// Type colors mapping
const typeColors: Record<string, string> = {
  tabular: "#1E88E5", // Blue
  summary: "#43A047", // Green
  matrix: "#E53935",  // Red
  joined: "#FB8C00"   // Orange
};

export default function ReportsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "tabular" | "summary" | "matrix" | "joined">("all");
  const [sortBy, setSortBy] = useState<"recent" | "name" | "popular">("recent");
  const [showDeleteToast, setShowDeleteToast] = useState(false);
  const [showStarredOnly, setShowStarredOnly] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  // State for delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<string | null>(null);
  const { allReportResponse } = useAllReport();
  let sampleReportTypes = transformReportData(allReportResponse?.data);
  const { invalidateAllReport } = useInvalidateAllReport();
  const [showErrorToast, setShowErrorToast] = useState<string>('');

  const deleteReportTypeById = useDeleteReportById();
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  // Use useEffect to mark when client-side rendering is active
  useEffect(() => {
    setIsClient(true);
    invalidateAllReport()
  }, []);

  // Filter report types based on all filters
  const filteredReportTypes = (sampleReportTypes || []).filter(reportType => {
    const name = reportType?.name?.toLowerCase() || '';
    const description = reportType?.description?.toLowerCase() || '';
    const primaryObject = reportType?.primaryObject?.toLowerCase() || '';
    const id = reportType?.id?.toLowerCase() || '';
    const status = reportType?.status || '';
    const type = reportType?.type || '';
    const starred = reportType?.starred ?? false;

    const search = searchTerm?.toLowerCase() || '';

    // Search filter
    const matchesSearch =
      name.includes(search) ||
      description.includes(search) ||
      primaryObject.includes(search) ||
      id.includes(search);

    // Status filter
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && status === "active") ||
      (statusFilter === "inactive" && status === "inactive");

    // Type filter
    const matchesType =
      typeFilter === "all" || type === typeFilter;

    // Starred filter
    const matchesStarred =
      !showStarredOnly || starred;

    return matchesSearch && matchesStatus && matchesType && matchesStarred;
  });

  // Sort reports
  const sortedReports = [...filteredReportTypes].sort((a, b) => {
    if (sortBy === "name") {
      return a.name.localeCompare(b.name);
    } else if (sortBy === "popular") {
      return b.views - a.views;
    } else { // recent
      // Convert string dates to Date objects for comparison
      const dateA = new Date(a.lastModified);
      const dateB = new Date(b.lastModified);
      return dateB.getTime() - dateA.getTime();
    }
  });

  // Calculate pagination
  const totalPages = Math.ceil(sortedReports.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedReports.slice(indexOfFirstItem, indexOfLastItem);

  // Page navigation
  const goToPage = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    // Scroll to top of results
    window.scrollTo({
      top: document.getElementById('results-top')?.offsetTop || 0,
      behavior: 'smooth'
    });
  };

  // When filters change, reset to first page
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, typeFilter, showStarredOnly, sortBy]);

  // Create array of page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      // Show all pages if there are few
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Show fewer pages with ellipsis
      if (currentPage <= 3) {
        // Near the start
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('ellipsis');
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Near the end
        pageNumbers.push(1);
        pageNumbers.push('ellipsis');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        // Middle
        pageNumbers.push(1);
        pageNumbers.push('ellipsis');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('ellipsis');
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
  };

  // Function to handle delete button click
  const handleDeleteClick = (reportId: string) => {
    setReportToDelete(reportId);
    setDeleteDialogOpen(true);
  };

  // Function to confirm deletion
  const confirmDelete = () => {
    if (reportToDelete) {
      deleteReportTypeById.mutate(
        { reportId: reportToDelete },
        {
          onSuccess: () => {
            invalidateAllReport();
            setShowDeleteToast(true);
            setTimeout(() => setShowDeleteToast(false), 3000);
          },
          onError: (error) => {
            setShowErrorToast(error?.message || 'Something went wrong. Please try again.');
            setTimeout(() => setShowErrorToast(''), 3000);
          },
        }
      );
    }
    setDeleteDialogOpen(false);
    setReportToDelete(null);
  };

  // Function to cancel deletion
  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setReportToDelete(null);
  };

  return (
    <div className="min-h-screen bg-muted/40">
      {/* Main Content */}
      <main className="container mx-auto py-8 px-4">
        {/* Page Header */}
        <div className="mb-2 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-xl font-bold mb-2">Reports</h1>
            <p className="text-muted-foreground">Manage and create custom report types</p>
          </div>
          <div>
            <Link href="/report-builder">
              <Button>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2"
                >
                  <path d="M12 5v14" />
                  <path d="M5 12h14" />
                </svg>
                Create New Report
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="mb-2 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <Input
              className="pl-10"
              placeholder="Search report types..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={statusFilter === "all" ? "default" : "outline"}
              onClick={() => setStatusFilter("all")}
              size="sm"
            >
              All
            </Button>
            <Button
              variant={statusFilter === "active" ? "default" : "outline"}
              onClick={() => setStatusFilter("active")}
              size="sm"
            >
              Active
            </Button>
            <Button
              variant={statusFilter === "inactive" ? "default" : "outline"}
              onClick={() => setStatusFilter("inactive")}
              size="sm"
            >
              Inactive
            </Button>
          </div>
        </div>

        {/* Enhanced Filters Bar */}
        <div id="results-top" className="bg-background rounded-lg shadow-sm border mb-3 p-3">
          <div className="flex flex-col md:flex-row gap-4 justify-between mb-4">
            <div className="flex flex-wrap gap-2">
              <Label className="flex items-center text-sm font-medium">
                Type:
              </Label>
              <Button
                variant={typeFilter === "all" ? "default" : "outline"}
                onClick={() => setTypeFilter("all")}
                size="sm"
                className="h-8"
              >
                All
              </Button>
              <Button
                variant={typeFilter === "tabular" ? "default" : "outline"}
                onClick={() => setTypeFilter("tabular")}
                size="sm"
                className="h-8"
                style={{ borderColor: typeFilter === "tabular" ? typeColors.tabular : undefined }}
              >
                <span className="w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: typeColors.tabular }}></span>
                Tabular
              </Button>
              <Button
                variant={typeFilter === "summary" ? "default" : "outline"}
                onClick={() => setTypeFilter("summary")}
                size="sm"
                className="h-8"
                style={{ borderColor: typeFilter === "summary" ? typeColors.summary : undefined }}
              >
                <span className="w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: typeColors.summary }}></span>
                Summary
              </Button>
              <Button
                variant={typeFilter === "matrix" ? "default" : "outline"}
                onClick={() => setTypeFilter("matrix")}
                size="sm"
                className="h-8"
                style={{ borderColor: typeFilter === "matrix" ? typeColors.matrix : undefined }}
              >
                <span className="w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: typeColors.matrix }}></span>
                Matrix
              </Button>
              <Button
                variant={typeFilter === "joined" ? "default" : "outline"}
                onClick={() => setTypeFilter("joined")}
                size="sm"
                className="h-8"
                style={{ borderColor: typeFilter === "joined" ? typeColors.joined : undefined }}
              >
                <span className="w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: typeColors.joined }}></span>
                Joined
              </Button>
            </div>
            <div className="flex gap-2 items-center">
              <Label className="text-sm font-medium whitespace-nowrap">Sort by:</Label>
              <Select
                value={sortBy}
                onValueChange={(value) => setSortBy(value as any)}
              >
                <SelectTrigger className="w-[140px] h-8">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Recently Modified</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="popular">Most Viewed</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant={showStarredOnly ? "default" : "outline"}
                onClick={() => setShowStarredOnly(!showStarredOnly)}
                size="sm"
                className="h-8 flex items-center"
                title={showStarredOnly ? "Show all reports" : "Show starred only"}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill={showStarredOnly ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <span className="ml-1.5">Starred</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Report Types List */}
        <div className="space-y-4 mb-8">
          {filteredReportTypes.length === 0 ? (
            <div className="bg-background rounded-md border p-12 text-center">
              {/* Empty State Icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mx-auto text-muted-foreground mb-4"
              >
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
                <circle cx="10" cy="13" r="2" />
                <path d="m20 17-1.09-1.09a2 2 0 0 0-2.82 0L10 22" />
              </svg>
              <h3 className="text-lg font-medium mb-2">No reports found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || typeFilter !== "all" || statusFilter !== "all" || showStarredOnly
                  ? "Try a different search term or clear your filters."
                  : "Create your first report type to get started."}
              </p>
              {(searchTerm || typeFilter !== "all" || statusFilter !== "all" || showStarredOnly) ? (
                <Button variant="outline" onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setTypeFilter("all");
                  setShowStarredOnly(false);
                }}>
                  Clear All Filters
                </Button>
              ) : (
                <Link href="/report-types">
                  <Button>Create Report Type</Button>
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {isClient ? (
                  currentItems.map((reportType, index) => (
                    <motion.div
                      key={reportType.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300 h-full">
                        <CardContent className="p-4">
                          <div className="grid grid-cols-[auto_1fr_auto] gap-4 items-start">
                            {/* Icon and Type */}
                            <div className="flex flex-col items-center gap-1">
                              <div
                                className="h-12 w-12 rounded-md flex items-center justify-center relative"
                                style={{ backgroundColor: `${typeColors[reportType.type]}20` }}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="20"
                                  height="20"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                                  <polyline points="14 2 14 8 20 8" />
                                  <line x1="16" y1="13" x2="8" y2="13" />
                                  <line x1="16" y1="17" x2="8" y2="17" />
                                </svg>
                                {reportType.starred && (
                                  <div className="absolute -top-1 -right-1 bg-amber-400 text-white rounded-full p-0.5">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="10"
                                      height="10"
                                      viewBox="0 0 24 24"
                                      fill="currentColor"
                                    >
                                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                              <div className="text-xs font-medium px-2 py-0.5 rounded-full capitalize" style={{
                                backgroundColor: `${typeColors[reportType.type]}20`,
                              }}>
                                {reportType.type}
                              </div>
                            </div>

                            {/* Main Content */}
                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-base font-semibold truncate">{reportType.name}</h3>
                                <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${reportType.status === "active"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-700"
                                  }`}>
                                  {reportType.status}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-2">{reportType.description}</p>
                              <div className="flex flex-col text-xs text-muted-foreground gap-1">
                                <span><strong>Primary:</strong> {reportType.primaryObject}</span>
                                <span><strong>Related:</strong> {reportType.relatedObjects.join(", ")}</span>
                                <span><strong>Created:</strong> {formatDate(reportType.createdDate)}</span>
                                <span><strong>Modified:</strong> {formatDate(reportType.lastModified)}</span>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-1">
                              <Link href={`/report-types/summary?id=${reportType.id}`}>
                                <Button variant="ghost" size="sm" className="justify-start">View</Button>
                              </Link>
                              <Button variant="ghost" size="sm" className="justify-start" onClick={() => router.push(`report-builder?reportId=${reportType?.id}`)}>Edit</Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="justify-start text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                onClick={() => handleDeleteClick(reportType?.id)}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-full flex justify-center py-8">
                    <div className="flex flex-col items-center gap-4">
                      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                      <p className="text-sm text-muted-foreground">Loading reports...</p>
                    </div>
                  </div>
                )}
              </div>

                {showDeleteToast && (
                  <ToastMessage type="success" message="Report Deleted Successfully" />
                )}
                {
                  showErrorToast && (
                    <ToastMessage type="error" message={showErrorToast} />
                  )
                }

              {/* Pagination */}
              <div className="mt-6 flex flex-col items-center gap-4">
                <div className="text-sm text-muted-foreground">
                  Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, sortedReports.length)} of {sortedReports.length} reports
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="h-8 w-8 p-0"
                    aria-label="Previous"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M15 18L9 12l6-6" />
                    </svg>
                  </Button>
                  {getPageNumbers().map((pageNumber, index) =>
                    pageNumber === 'ellipsis' ? (
                      <span key={`ellipsis-${index}`} className="px-2">...</span>
                    ) : (
                      <Button
                        key={`page-${pageNumber}`}
                        variant={currentPage === pageNumber ? "default" : "outline"}
                        size="sm"
                        onClick={() => goToPage(pageNumber as number)}
                        className="h-8 w-8 p-0"
                      >
                        {pageNumber}
                      </Button>
                    )
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="h-8 w-8 p-0"
                    aria-label="Next"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </Button>
                </div>

                {/* Items per page */}
                <div className="flex items-center gap-2">
                  <Label htmlFor="items-per-page" className="text-sm">Items per page:</Label>
                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={(value) => {
                      setItemsPerPage(Number(value));
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger id="items-per-page" className="w-[70px] h-8">
                      <SelectValue placeholder="8" />
                    </SelectTrigger>
                    <SelectContent>
                      {[4, 8, 12, 16, 24].map(n => (
                        <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this report? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600 text-white">
              Yes, Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}