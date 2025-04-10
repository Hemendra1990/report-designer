"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { InputWithIcon } from "@/components/ui/input-with-icon";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { TableMetadata } from "@/services/databaseService";
import { Database } from "lucide-react";
import { useAllColumnMetadataByTableName, useAllTableMetadata } from "@/hooks/metadata-hook";
import { useReportTypeFormContext } from "@/contexts/report-type-form-context";
import { generateLayoutColumn } from "@/helper/report-type/report-type-helper";

interface SelectObjectFormProps {
    reportTypeId: string;
}

export default function SelectObjectForm(props: SelectObjectFormProps) {
    const searchParams = useSearchParams();
    const reportTypeGroup = searchParams.get("type") || "";

    const { reportTypeId } = props;
    const { setReportTypeId, reportType, setReportType } = useReportTypeFormContext();

    const [selectedObject, setSelectedObject] = useState<string>(reportType.primaryTable || "");
    const { data: selectedTableColumns } = useAllColumnMetadataByTableName(selectedObject);
    const [selectedSchema, setSelectedSchema] = useState<string>("");

    // Add search and pagination state
    const [searchTerm, setSearchTerm] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [availableTables, setAvailableTables] = useState<TableMetadata[]>([]);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        hasMore: false
    });

    const [categories, setCategories] = useState<Set<string>>(new Set());
    const [selectedCategory, setSelectedCategory] = useState<string>("");
    const { data: allTableMetaData, isLoading } = useAllTableMetadata();
    const { data: allColumnMetaData } = useAllColumnMetadataByTableName(availableTables.find(table => table.tableName === selectedObject)?.tableName as string);

    useEffect(() => {
        if (reportTypeId) {
            setReportTypeId(reportTypeId);
        }
    }, [reportTypeId])

    useEffect(() => {
        if (allTableMetaData) {
            setAvailableTables(allTableMetaData);
        }
    }, [allTableMetaData])

    // Handle searching with debounce
    useEffect(() => {
        if (isSearching) {
            const timer = setTimeout(() => {
                setAvailableTables((allTableMetaData || []).filter(table => table.tableName.toLowerCase().includes(searchTerm.toLowerCase())));
                setIsSearching(false);
            }, 300);

            return () => clearTimeout(timer);
        }
    }, [isSearching, searchTerm, allTableMetaData]);

    // Pre-fill form when an object is selected
    useEffect(() => {
        if (selectedObject) {
            const selectedTable = availableTables.find(table => table.tableName === selectedObject);
            if (selectedTable) {
                setSelectedSchema(selectedTable.schema);
                setReportType({
                        label: selectedTable.displayName + " Report Type",
                        name: selectedTable.tableName.toLowerCase() + "_report_type",
                        description: `Report type for ${selectedTable.displayName} objects`,
                        typeGroup: reportTypeGroup,
                        primaryTable: selectedTable.tableName,
                        primaryTableDisplayName: selectedTable.displayName,
                        primaryTableId: selectedTable.id,
                        configList: [],
                });
            }
        } else {
            setSelectedSchema("");
        }
    }, [selectedObject, allTableMetaData]);

    useEffect(() => {
        if (selectedTableColumns) {
            const selectedTable = availableTables.find(table => table.tableName === selectedObject);
            setReportType(prev => ({
                ...prev,
                layoutList: [...generateLayoutColumn(selectedTable?.tableName || '', selectedTable?.id || '', selectedTableColumns.columns as any)]
            }))
        }
    }, [selectedTableColumns, selectedObject]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setReportType(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setIsSearching(true);
    };

    const handleCategoryFilter = (category: string) => {
        setSelectedCategory(category === selectedCategory ? "" : category);
        // When category changes, we'll need to reload objects with the filter
        // loadObjects(searchTerm, 1);
    };

    // Filter objects by selected category
    const displayedObjects = selectedCategory
        ? availableTables.filter(table => table.schema === selectedCategory)
        : availableTables || [];

    return (
        <div className="min-h-screen bg-background">
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
          </div>
        </div>
      </nav> */}

            {/* Main Content */}
            <main className="container mx-auto py-8 px-4">
                <div className="mb-8">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Link href="/report-types" className="hover:text-foreground">Select Report Type</Link>
                        <span>→</span>
                        <span className="text-foreground font-medium">Select Primary Object</span>
                        <span>→</span>
                        <span className="text-muted-foreground">Select Related Objects</span>
                    </div>
                    <h1 className="text-3xl font-bold mt-4 mb-2">Select Primary Object</h1>
                    <p className="text-muted-foreground">
                        Select the primary object/table that is the main focus of reports created with this report type.
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-[2fr_3fr]">
                    {/* Left side - Object Selection */}
                    <div>
                        <div className="mb-6">
                            <InputWithIcon
                                type="text"
                                placeholder="Search tables..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                                icon={
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
                                    >
                                        <circle cx="11" cy="11" r="8" />
                                        <path d="m21 21-4.3-4.3" />
                                    </svg>
                                }
                            />
                        </div>

                        {/* Category filter */}
                        {categories.size > 0 && (
                            <div className="mb-4">
                                <h3 className="text-sm font-medium mb-2">Filter by Schema</h3>
                                <div className="flex flex-wrap gap-2">
                                    {Array.from(categories).map(schema => (
                                        <button
                                            key={schema}
                                            onClick={() => handleCategoryFilter(schema)}
                                            className={`px-3 py-1 text-xs rounded-full border transition-colors ${selectedCategory === schema
                                                    ? "bg-primary text-primary-foreground border-primary"
                                                    : "bg-background border-input hover:border-primary/50"
                                                }`}
                                        >
                                            {schema}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Loading state */}
                        {isLoading && (
                            <div className="flex justify-center my-8">
                                <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
                            </div>
                        )}

                        {/* Objects list */}
                        {!isLoading && (
                            <>
                                <div className="mb-2 flex justify-between items-center">
                                    <h2 className="text-xl font-bold">Available Tables</h2>
                                    <div className="text-sm text-muted-foreground">
                                        {pagination.totalCount} tables found
                                    </div>
                                </div>

                                <div className="h-[60vh] overflow-y-auto pr-2 space-y-2">
                                    <RadioGroup
                                        value={selectedObject}
                                        onValueChange={setSelectedObject}
                                        className="grid gap-2"
                                    >
                                        {displayedObjects.length === 0 ? (
                                            <div className="text-center py-8 text-muted-foreground">
                                                No tables found matching your search criteria
                                            </div>
                                        ) : (
                                            displayedObjects.map((table) => (
                                                <div key={`${table.schema}.${table.tableName}`} className="cursor-pointer">
                                                    <Card
                                                        className={`transition-all hover:border-primary ${selectedObject === table.tableName
                                                                ? "border-2 border-primary bg-primary/5"
                                                                : ""
                                                            }`}
                                                    >
                                                        <label
                                                            htmlFor={`object-${table.schema}-${table.tableName}`}
                                                            className="cursor-pointer"
                                                        >
                                                            <div className="flex items-center gap-3 p-3">
                                                                <RadioGroupItem
                                                                    value={table.tableName}
                                                                    id={`object-${table.schema}-${table.tableName}`}
                                                                    className="mt-0"
                                                                />
                                                                <div className="bg-primary/10 p-1.5 rounded-md text-primary">
                                                                    <Database className="h-4 w-4" />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <h3 className="font-medium text-sm truncate">{table.displayName}</h3>
                                                                    <p className="text-xs text-muted-foreground truncate">{table.schema}</p>
                                                                </div>
                                                            </div>
                                                        </label>
                                                    </Card>
                                                </div>
                                            ))
                                        )}
                                    </RadioGroup>
                                </div>

                                {/* Pagination */}
                                {pagination.totalPages > 1 && (
                                    <div className="flex items-center justify-between mt-4">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            // onClick={() => loadObjects(searchTerm, pagination.currentPage - 1)}
                                            disabled={pagination.currentPage <= 1}
                                        >
                                            Previous
                                        </Button>
                                        <span className="text-sm text-muted-foreground">
                                            Page {pagination.currentPage} of {pagination.totalPages}
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            // onClick={() => loadObjects(searchTerm, pagination.currentPage + 1)}
                                            disabled={!pagination.hasMore}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Right side - Object Details Form */}
                    <div>
                        {selectedObject && (
                            <div className="mb-6">
                                <h2 className="text-xl font-bold mb-4">Selected Table</h2>
                                <Card className="bg-primary/5 border-primary">
                                    <CardContent className="p-4">
                                        {availableTables.find(table => table.tableName === selectedObject) && (
                                            <div className="flex items-start gap-4">
                                                <div className="bg-primary/10 p-2 rounded-md text-primary mt-1">
                                                    <Database className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <h3 className="font-medium text-lg">{availableTables.find(table => table.tableName === selectedObject)?.displayName}</h3>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        Schema: {availableTables.find(table => table.tableName === selectedObject)?.schema}
                                                    </p>
                                                    <div className="mt-2">
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                                            {allColumnMetaData?.columns?.length} columns
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        <Card className={`transition-all ${!selectedObject ? "opacity-50" : ""}`}>
                            <CardHeader>
                                <CardTitle>Report Type Details</CardTitle>
                                <CardDescription>
                                    Provide information about this report type
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="label">Display Label</Label>
                                        <Input
                                            id="label"
                                            name="label"
                                            value={reportType.label}
                                            onChange={handleInputChange}
                                            placeholder="Enter a descriptive name"
                                            disabled={!selectedObject}
                                        />
                                        <p className="text-xs text-muted-foreground">This name appears in the report type selector</p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="name">API Name</Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            value={reportType.name}
                                            onChange={handleInputChange}
                                            placeholder="A unique identifier"
                                            disabled={!selectedObject}
                                        />
                                        <p className="text-xs text-muted-foreground">Unique identifier used in API requests</p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            name="description"
                                            value={reportType.description}
                                            onChange={handleInputChange}
                                            placeholder="Describe what this report type is used for"
                                            disabled={!selectedObject}
                                        />
                                        <p className="text-xs text-muted-foreground">Helps users understand when to use this report type</p>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 flex justify-between">
                    <Link href="/report-types">
                        <Button variant="outline">Back</Button>
                    </Link>
                    <div className="flex gap-4">
                        <Link href="/report-types">
                            <Button variant="outline">Cancel</Button>
                        </Link>
                        <Link
                            href={selectedObject && reportType.label && reportType.name
                                // ? `/report-types/define-relationships?type=${reportTypeGroup}&object=${selectedObject}&schema=${selectedSchema}&label=${encodeURIComponent(formData.displayLabel)}&api=${encodeURIComponent(formData.apiName)}&desc=${encodeURIComponent(formData.description)}`
                                ? `/report-types/define-relationships`
                                : "#"
                            }
                        >
                            <Button disabled={!selectedObject || !reportType.label || !reportType.name}>
                                Next
                            </Button>
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}