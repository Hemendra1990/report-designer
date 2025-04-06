"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Image from "next/image";

// Report Types with additional details
const reportTypes = [
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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReportType, setSelectedReportType] = useState<string>("");

  const filteredReportTypes = reportTypes.filter((report) =>
    report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Find the selected report object to access its color
  const selectedReport = reportTypes.find(r => r.id === selectedReportType);

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
            <h1 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">Create Custom Report</h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">Select the type of report you want to create from the options below.</p>
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
              {filteredReportTypes.map((report) => (
                <div key={report.id}>
                  <Card 
                    className={`cursor-pointer transition-all duration-200 ease-in-out hover:shadow-lg border ${ // Added default border
                      selectedReportType === report.id 
                        ? `border-2` // Use border width for selection
                        : "border-border hover:border-muted-foreground/50" // Default and hover border
                    }`}
                    style={{ 
                      // Set border color dynamically for selection
                      borderColor: selectedReportType === report.id ? report.color : undefined, 
                      // Apply a very subtle background tint on selection
                      backgroundColor: selectedReportType === report.id ? `${report.color}10` : '' 
                    }}
                  >
                    <label htmlFor={`report-type-${report.id}`} className="block cursor-pointer p-6">
                      <div className="flex items-start gap-5">
                        <RadioGroupItem 
                          value={report.id} 
                          id={`report-type-${report.id}`} 
                          className="mt-1 flex-shrink-0"
                          // Style radio button border based on selection color
                          style={{ 
                            borderColor: selectedReportType === report.id ? report.color : undefined,
                            // Optionally add ring on focus/selection if needed, but border might suffice
                          }}
                        />
                        <div className="flex-grow">
                          <div className="flex items-center gap-3 mb-3">
                            <div 
                              className="p-2 rounded-md flex items-center justify-center" 
                              style={{ backgroundColor: `${report.color}20` }} // Slightly more vibrant icon background
                            >
                              <Image
                                src={report.icon}
                                alt={`${report.name} icon`}
                                width={24}
                                height={24}
                                // Apply color to SVG icon if needed (depends on SVG structure)
                                // style={{ color: report.color }} 
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
            <Link href="/">
              <Button variant="outline" size="lg" className="px-6">Cancel</Button>
            </Link>
            <Link 
              href={selectedReportType ? `/report-types/select-object?type=${selectedReportType}` : "#"}
              aria-disabled={!selectedReportType}
              tabIndex={!selectedReportType ? -1 : undefined} // Improve accessibility for disabled link
              className={` ${!selectedReportType ? "cursor-not-allowed" : ""}`}
            >
              <Button 
                disabled={!selectedReportType} 
                size="lg" 
                className={`px-8 transition-colors duration-200 ease-in-out ${!selectedReportType ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"}`}
                style={{ 
                  backgroundColor: selectedReport?.color, 
                  // Ensure text color contrasts well with dynamic background
                  color: selectedReport ? getContrastYIQ(selectedReport.color) : undefined
                }}
              >
                Next 
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ml-2">
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to determine text color (black/white) based on background hex color
// (This should ideally be placed in a utility file)
function getContrastYIQ(hexcolor: string): string {
  hexcolor = hexcolor.replace("#", "");
  const r = parseInt(hexcolor.substring(0, 2), 16);
  const g = parseInt(hexcolor.substring(2, 4), 16);
  const b = parseInt(hexcolor.substring(4, 6), 16);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return (yiq >= 128) ? '#000000' : '#FFFFFF';
}