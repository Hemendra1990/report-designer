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
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-3">Create Custom Report</h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">Select the type of report you want to create from the options below.</p>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search Report Types..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 text-base"
            />
          </div>

          {/* Report Types as Cards with Radio Selection */}
          <RadioGroup value={selectedReportType} onValueChange={setSelectedReportType}>
            <div className="grid md:grid-cols-2 gap-6">
              {filteredReportTypes.map((report) => (
                <div key={report.id}>
                  <Card 
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedReportType === report.id 
                        ? `border-2 bg-opacity-5 bg-${report.id}` 
                        : "hover:border-primary"
                    }`}
                    style={{ 
                      borderColor: selectedReportType === report.id ? report.color : '',
                      backgroundColor: selectedReportType === report.id ? `${report.color}05` : ''
                    }}
                  >
                    <label htmlFor={`report-type-${report.id}`} className="cursor-pointer">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <RadioGroupItem 
                            value={report.id} 
                            id={`report-type-${report.id}`} 
                            className="mt-1"
                          />
                          <div>
                            <div className="flex items-center gap-3 mb-3">
                              <div 
                                className="p-2 rounded-md" 
                                style={{ backgroundColor: `${report.color}20` }}
                              >
                                <Image
                                  src={report.icon}
                                  alt={report.name}
                                  width={24}
                                  height={24}
                                  style={{ color: report.color }}
                                />
                              </div>
                              <h3 className="font-medium text-lg">{report.name}</h3>
                            </div>
                            <p className="text-muted-foreground">{report.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </label>
                  </Card>
                </div>
              ))}
            </div>
          </RadioGroup>
          
          {/* Next Button */}
          <div className="flex justify-end space-x-4 mt-8">
            <Link href="/">
              <Button variant="outline" size="lg" className="px-6">Cancel</Button>
            </Link>
            <Link 
              href={selectedReportType ? `/report-types/select-object?type=${selectedReportType}` : "#"}
              aria-disabled={!selectedReportType}
              className={!selectedReportType ? "pointer-events-none" : ""}
            >
              <Button 
                disabled={!selectedReportType} 
                size="lg" 
                className="px-8"
                style={{ 
                  backgroundColor: selectedReportType ? reportTypes.find(r => r.id === selectedReportType)?.color : undefined,
                  opacity: selectedReportType ? 1 : 0.5
                }}
              >
                Next 
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2">
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