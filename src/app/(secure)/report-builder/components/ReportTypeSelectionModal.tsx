import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { Search, ChevronDown, X, FileText, Clock, ListChecks, BarChart4, Users, PieChart, ExternalLink, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { RecentReportType, ReportTypeTemplate } from "../model/ReportType";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { getReportTypeById, getReportTypeFields, getReportTypes } from "../services/reportTypeService";
import { FieldsSkeletonList, ReportTypesSkeletonList } from "./ReportTypeSkeleton";
import { groupFieldsByTable, mapColumnTypeToFieldType } from "../utils/fieldUtils";
import { AxiosError } from 'axios';
import { Field, FieldType } from "../model/Field";
import { ApiReportField } from "../services/api-types";
import { useActiveLayoutColumnListByReportId, useAllReportTypeSummary } from "@/hooks/report-type-hook";
import { ReportTypeLayout } from "@/components/model/report-type";

// Define an extended Field type that includes ApiReportField properties
interface ExtendedField extends Field {
    tableName: string;
    columnName: string;
    columnDisplayName: string;
    columnType: string;
}

export function ReportTypeSelectionModal({
    isOpen,
    onClose,
    onSelect
}: {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (reportType: ReportTypeTemplate) => void;
}) {
    // Log the component props when the component renders
    console.log("ReportTypeSelectionModal rendering with props:", { isOpen, onClose, onSelect });
    
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedReport, setSelectedReport] = useState<RecentReportType | null>(null);
    const { activeLayoutColumnByReportIdResponse } = useActiveLayoutColumnListByReportId(selectedReport?.id as string);
    const [activeTab, setActiveTab] = useState<"details" | "fields">("details");
    const [fieldSearchTerm, setFieldSearchTerm] = useState("");
    const { allReportTypeSummaryResponse } = useAllReportTypeSummary();
    const [reportTypes, setReportTypes] = useState<RecentReportType[]>([]);
    
    useEffect(() => {
        if (allReportTypeSummaryResponse?.data) {
            setReportTypes(allReportTypeSummaryResponse?.data.map(reportType => {
                const date = new Date(reportType?.createdOn);
                let type:RecentReportType =  {
                    id: reportType.id,
                    name: reportType?.name,
                    label:reportType?.label,
                    category: '',
                    description: reportType?.description,
                    objects: reportType?.usedTables?.map(table => ({name: table})),
                    lastUsed:`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`,
                    status: 'Active',
                    type: reportType?.typeGroup,
                    createdBy: reportType?.createdBy,
                    fieldsCount: reportType?.columnCount
                }
                return type;
            }))
        }
    }, [allReportTypeSummaryResponse?.data])
    

    
    // Fetch fields for the selected report type
    const {
        data: reportFields = [],
        isLoading: isFieldsLoading,
        error: fieldsError,
        refetch: refetchFields
    } = useQuery<ExtendedField[], AxiosError>({
        queryKey: ['reportFields', selectedReport?.name],
        queryFn: async () => {
            if (!selectedReport) return Promise.resolve([]);
            // Use the report ID if available, otherwise use the name
            const reportTypeId = selectedReport?.name;
            // Get API fields and convert them to the Field type format
            const apiFields = await getReportTypeFields(reportTypeId);
            console.log('API Fields from service:', apiFields);
            
            const mappedFields = apiFields.map(apiField => ({
                id: apiField.id,
                name: apiField.columnDisplayName,
                type: mapColumnTypeToFieldType(apiField.columnType) as FieldType,
                category: apiField.tableName,
                // Keep original properties needed by groupFieldsByTable
                tableName: apiField.tableName,
                columnName: apiField.columnName,
                columnDisplayName: apiField.columnDisplayName,
                columnType: apiField.columnType,
                tableId: apiField.tableId,
                active: apiField.active
            } as ExtendedField));
            
            console.log('Mapped fields:', mappedFields);
            return mappedFields;
        },
        enabled: !!selectedReport && activeTab === "fields",
        retry: 2,
    });

    const getFieldCategoryMap = (): Record<string, ReportTypeLayout[]> => {
        if (allReportTypeSummaryResponse?.data) {
            const fieldCategoryMap: Record<string, ReportTypeLayout[]> = activeLayoutColumnByReportIdResponse?.data.reduce((acc: any, layout: any) => {
                const table = layout.tableName;
                if (!acc[table]) {
                  acc[table] = [];
                }
                acc[table].push(layout);
                return acc;
              }, {} as Record<string, ReportTypeLayout[]>);
              return fieldCategoryMap;
        } else {
            return {};
        }
    }

    // Extract unique categories from report types
    const categories = useMemo(() => {
        return Array.from(new Set(reportTypes.map(report => report.type)));
    }, [reportTypes]);

    // Group fields by table name for better organization
    const fieldsByCategory = useMemo(() => {
        if (!reportFields.length) return {};

        console.log('Report fields before filtering:', reportFields);
        
        const filtered = reportFields.filter(field =>
            !fieldSearchTerm ||
            (field.name || field.columnDisplayName || '').toLowerCase().includes(fieldSearchTerm.toLowerCase()) ||
            (field.columnName || '').toLowerCase().includes(fieldSearchTerm.toLowerCase())
        );
        
        console.log('Filtered fields before grouping:', filtered);
        
        const result = groupFieldsByTable(filtered as unknown as ApiReportField[]);
        console.log('Grouped fields result:', result);
        return result;
    }, [reportFields, fieldSearchTerm]);

    // Filter report types based on search and category
    const filteredReports = useMemo(() => {
        return reportTypes.filter(report => {
            const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                report.description.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = !selectedCategory || report.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [reportTypes, searchTerm, selectedCategory]);

    // When selecting a report, reset to details tab
    const handleReportSelect = (report: RecentReportType) => {
        setSelectedReport(report);
        setActiveTab("details"); // Reset to details tab when selecting a new report
    };

    // Handle starting a report
    const handleStartReport = async () => {
        console.log("Start Report clicked", selectedReport);
        if (selectedReport) {
            try {
                // Find the report type ID from the selected report
                const reportTypeId = selectedReport.id;
                console.log("Creating report template with type:", reportTypeId);
                
                // Create a ReportTypeTemplate from the selected report
                const reportTemplate: ReportTypeTemplate = {
                    id: reportTypeId || '',
                    name: selectedReport.name,
                    description: selectedReport.description,
                    icon: selectedReport.objects?.[0]?.icon || "/file.svg",
                    color: selectedReport.objects?.[0]?.color || "#4299e1",
                    type: reportTypeId || ''
                };
                
                console.log("Calling onSelect with template:", reportTemplate);
                // Pass the template to the onSelect callback
                onSelect(reportTemplate);
            } catch (error) {
                console.error("Error starting report:", error);
            }
        }
    };

    // Helper function to get field icon based on type
    const getFieldTypeIcon = (type: string) => {
        switch (type) {
            case 'varchar':
            case 'text':
                return <span className="text-blue-600">Aa</span>;
            case 'int8':
            case 'bigserial':
                return <span className="text-purple-600">#</span>;
            case 'timestamptz(6)':
            case 'timestamp':
                return <Clock className="h-3 w-3" />;
            case 'bool':
                return <span className="text-green-600">✓</span>;
            default:
                return <span className="text-gray-600">•</span>;
        }
    };

    // Helper function to get category icon
    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'Analytics': return <BarChart4 className="h-3.5 w-3.5" />;
            case 'Customer': return <Users className="h-3.5 w-3.5" />;
            case 'Custom': return <Sparkles className="h-3.5 w-3.5" />;
            case 'Sales': return <PieChart className="h-3.5 w-3.5" />;
            default: return <PieChart className="h-3.5 w-3.5" />;
        }
    };

    // Display error messages if needed
    if (allReportTypeSummaryResponse?.error) {
        console.error('Error loading report types:', allReportTypeSummaryResponse?.error);
    }

    if (fieldsError) {
        console.error('Error loading report fields:', fieldsError);
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[1200px] h-[85vh] p-0 flex overflow-hidden rounded-lg shadow-2xl border-0 bg-white">
                {/* Left side - Categories Sidebar - Always visible */}
                <div className="w-48 py-4 border-r border-gray-100 flex-shrink-0 overflow-y-auto bg-slate-50/80">
                    <h3 className="font-medium text-xs uppercase tracking-wider text-slate-500 mb-2 px-4">Categories</h3>
                    <div className="space-y-0.5 px-2">
                        <button
                            onClick={() => setSelectedCategory(null)}
                            className={cn(
                                "w-full text-left px-2.5 py-1.5 text-xs rounded-md flex items-center gap-2 transition-all",
                                !selectedCategory
                                    ? "bg-primary text-white font-medium shadow-sm"
                                    : "hover:bg-slate-100 text-slate-700"
                            )}
                        >
                            <PieChart className={cn("h-3.5 w-3.5", !selectedCategory ? "text-white" : "text-slate-500")} />
                            All Reports
                        </button>
                        
                        {/* Show loading skeleton for categories or actual categories */}
                        {allReportTypeSummaryResponse?.isLoading ? (
                            // Category loading skeletons
                            Array(4).fill(0).map((_, idx) => (
                                <div key={idx} className="w-full px-2.5 py-1.5 flex items-center gap-2">
                                    <div className="h-3.5 w-3.5 bg-slate-200 rounded-full animate-pulse"></div>
                                    <div className="h-3 w-20 bg-slate-200 rounded animate-pulse"></div>
                                </div>
                            ))
                        ) : (<></>
                            // Actual categories when loaded
                            /* categories.map((category) => (
                                <button
                                    key={category}
                                    onClick={() => setSelectedCategory(category)}
                                    className={cn(
                                        "w-full text-left px-2.5 py-1.5 text-xs rounded-md flex items-center gap-2 transition-all",
                                        selectedCategory === category 
                                            ? "bg-primary/10 text-primary font-medium" 
                                            : "hover:bg-slate-100 text-slate-700"
                                    )}
                                >
                                    {getCategoryIcon(category)}
                                    {category}
                                </button>
                            )) */
                        )}
                    </div>
                </div>

                {/* Dynamic content area that changes based on selection state */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Report List - Expands when no report is selected */}
                    <div className={cn(
                        "px-4 py-4 overflow-hidden flex flex-col",
                        selectedReport ? "flex-1 border-r border-gray-100" : "flex-1"
                    )}>
                        <DialogHeader className="px-0 mb-2">
                            <DialogTitle className="text-lg font-semibold text-slate-800">Select a Report</DialogTitle>
                        </DialogHeader>

                        <div className="relative mb-3">
                            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-slate-400 h-3.5 w-3.5" />
                            <Input
                                placeholder="Search Report Types..."
                                className="pl-8 py-1 h-8 text-xs"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <h3 className="text-sm font-medium mb-2.5 text-slate-700">Available Report Types</h3>

                        <div className="space-y-2 overflow-y-auto flex-1 pr-1">
                            {allReportTypeSummaryResponse?.isLoading ? (
                                // Show skeletons when loading
                                <ReportTypesSkeletonList />
                            ) : allReportTypeSummaryResponse?.error ? (
                                // Show error state
                                <div className="p-6 text-center bg-slate-50 rounded-md border border-dashed border-slate-200">
                                    <X className="h-8 w-8 mx-auto mb-2 text-red-400" />
                                    <p className="text-slate-500 font-medium text-sm">Failed to load report types</p>
                                    <p className="text-xs text-slate-400 mt-1">Please try refreshing the page</p>
                                </div>
                            ) : filteredReports.length > 0 ? (
                                // Show actual report types when loaded
                                filteredReports.map((report, index) => (
                                    <div
                                        key={index}
                                        onClick={() => handleReportSelect(report)}
                                        className={`group p-3 rounded-md transition-all cursor-pointer border ${
                                            selectedReport?.name === report.name
                                                ? 'bg-primary/5 border-primary shadow-sm'
                                                : 'hover:bg-slate-50 border-slate-200 hover:border-slate-300'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex gap-2.5">
                                                <div
                                                    className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0"
                                                    style={{
                                                        backgroundColor: `${report.type === 'tabular' ? '#EBF5FF' :
                                                            report.type === 'summary' ? '#E6FFFA' :
                                                                report.type === 'matrix' ? '#FFF5F5' :
                                                                    '#FFFBEB'}`
                                                    }}
                                                >
                                                    {report.type == 'tabular' && <BarChart4 className="h-4 w-4 text-blue-600" />}
                                                    {report.type == 'summary' && <PieChart className="h-4 w-4 text-emerald-600" />}
                                                    {report.type == 'matrix' && <Users className="h-4 w-4 text-rose-600" />}
                                                    {report.type == 'joined' && <Sparkles className="h-4 w-4 text-amber-600" />}
                                                </div>

                                                <div className="flex-1">
                                                    <h4 className="font-medium text-sm text-slate-800 group-hover:text-primary flex items-center gap-2">
                                                        {report?.label}
                                                        <Badge variant={report.status === "Active" ? "default" : "secondary"} className="ml-1.5 px-1 py-0 h-4 text-[0.65rem]">
                                                            {report.status}
                                                        </Badge>
                                                    </h4>

                                                    <div className="flex items-center mt-0.5 text-xs gap-2">
                                                        
                                                        <span className="text-slate-400 flex items-center">
                                                            <Clock className="h-3 w-3 mr-0.5" />
                                                            <span>{report.lastUsed}</span>
                                                        </span>
                                                        {report.fieldsCount && (
                                                            <span className="text-slate-400 flex items-center">
                                                                <ListChecks className="h-3 w-3 mr-0.5" />
                                                                <span>{report.fieldsCount} fields</span>
                                                            </span>
                                                        )}
                                                    </div>

                                                    {report.description && (
                                                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                                                            {report.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <ChevronDown className={`h-4 w-4 transition-transform ${
                                                selectedReport?.name === report.name ? 'rotate-180 text-primary' : 'text-slate-400'
                                            }`} />
                                        </div>

                                        {report.objects && report.objects.length > 0 && (
                                            <div className="mt-2 pt-2 border-t border-dashed border-slate-200 flex gap-1.5 flex-wrap">
                                                {report.objects.slice(0, 3).map((obj, idx) => (
                                                    <div key={idx} className="flex items-center gap-1 bg-slate-50 px-1.5 py-0.5 rounded text-[0.65rem]">
                                                        <span style={{ color: obj.color }}>{obj.icon}</span>
                                                        <span className="text-slate-700">{obj.name}</span>
                                                    </div>
                                                ))}
                                                {report.objects.length > 3 && (
                                                    <div className="bg-slate-50 px-1.5 py-0.5 rounded text-[0.65rem] text-slate-500">
                                                        +{report.objects.length - 3} more
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                // Show empty state when no results
                                <div className="p-6 text-center bg-slate-50 rounded-md border border-dashed border-slate-200">
                                    <Search className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                                    <p className="text-slate-500 font-medium text-sm">No matching report types</p>
                                    <p className="text-xs text-slate-400 mt-1">Try adjusting your search or category filters</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right side - Details Panel - Only visible when a report is selected */}
                    {selectedReport && (
                        <div className="w-1/3 px-4 py-4 flex flex-col overflow-hidden">
                            <div className="flex justify-between items-start mb-4">
                                <h2 className="text-base font-semibold text-slate-800">Details</h2>
                            </div>

                            <div className="flex items-center gap-2.5 mb-4">
                                <div className="w-10 h-10 bg-green-100 rounded-md flex items-center justify-center">
                                    <FileText className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-800">{selectedReport?.label}</h3>
                                    <p className="text-xs text-slate-500">{selectedReport.category} Report Type</p>
                                </div>
                            </div>

                            <div className="flex gap-1.5 mb-4">
                                <Button
                                    className="flex-1 h-8 text-xs"
                                    onClick={handleStartReport}
                                >
                                    Start Report
                                </Button>
                                <Button variant="outline" className="h-8 w-8 p-0">
                                    <ChevronDown className="h-3.5 w-3.5" />
                                </Button>
                            </div>

                            <div className="border-t border-slate-200 pt-3 mb-3 flex-1 overflow-hidden flex flex-col">
                                <div className="flex gap-3 mb-3">
                                    <Button
                                        variant={activeTab === "details" ? "default" : "ghost"}
                                        className="flex-1 justify-start px-0 h-7 text-xs"
                                        onClick={() => setActiveTab("details")}
                                    >
                                        <Clock className="h-3.5 w-3.5 mr-1.5" />
                                        Details
                                    </Button>
                                    <Button
                                        variant={activeTab === "fields" ? "default" : "ghost"}
                                        className="flex-1 justify-start px-0 h-7 text-xs"
                                        onClick={() => setActiveTab("fields")}
                                    >
                                        <ListChecks className="h-3.5 w-3.5 mr-1.5" />
                                        Fields ({selectedReport.fieldsCount || 0})
                                    </Button>
                                </div>

                                {activeTab === "details" ? (
                                    // Details tab content
                                    <div className="overflow-y-auto flex-1 pr-1">
                                        <div>
                                            <h4 className="font-medium text-xs mb-1.5 text-slate-700">Description</h4>
                                            <p className="text-xs text-slate-600 mb-3">{selectedReport.description}</p>

                                            <h4 className="font-medium text-xs mb-1.5 text-slate-700">Created By You</h4>
                                            <div className="flex items-center gap-1.5 mb-3">
                                                <div className="w-6 h-6 bg-green-100 rounded flex items-center justify-center">
                                                    <FileText className="h-3 w-3 text-green-600" />
                                                </div>
                                                <span className="text-xs text-blue-600">New {selectedReport.name} Report</span>
                                            </div>

                                            <h4 className="font-medium text-xs mb-1.5 text-slate-700">Created By Others</h4>
                                            <p className="text-xs text-slate-600 mb-3">No Reports Yet</p>

                                            <h4 className="font-medium text-xs mb-1.5 text-slate-700">Objects Used in Report Type</h4>
                                            {selectedReport.objects?.map((obj, index) => (
                                                <div key={index} className="flex items-center gap-1.5 mb-1.5">
                                                    <div
                                                        className="w-6 h-6 rounded flex items-center justify-center"
                                                        style={{ backgroundColor: `${obj.color}20` }}
                                                    >
                                                        <span className="text-xs" style={{ color: obj.color }}>{obj.icon}</span>
                                                    </div>
                                                    <span className="text-xs text-blue-600">{obj.name}</span>

                                                    {obj.relatedObjects?.map((related, idx) => (
                                                        <div key={idx} className="flex items-center">
                                                            <div className="flex">
                                                                <div className="w-3 h-6 border-t border-l border-slate-300 rounded-tl-md"></div>
                                                            </div>
                                                            <div
                                                                className="w-6 h-6 rounded flex items-center justify-center"
                                                                style={{ backgroundColor: `${related.color}20` }}
                                                            >
                                                                <span className="text-xs" style={{ color: related.color }}>{related.icon}</span>
                                                            </div>
                                                            <span className="text-xs text-blue-600">{related.name}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    // Fields tab content
                                    <div className="flex flex-col flex-1 overflow-hidden">
                                        <div className="relative mb-3">
                                            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-slate-400 h-3.5 w-3.5" />
                                            <Input
                                                placeholder="Search fields..."
                                                className="pl-8 h-7 text-xs"
                                                value={fieldSearchTerm}
                                                onChange={(e) => setFieldSearchTerm(e.target.value)}
                                            />
                                        </div>

                                        {activeLayoutColumnByReportIdResponse?.isLoading ? (
                                            // Loading skeleton for fields
                                            <ScrollArea className="flex-1 pr-3 -mr-3">
                                                <FieldsSkeletonList />
                                            </ScrollArea>
                                        ) : activeLayoutColumnByReportIdResponse?.isError ? (
                                            // Error state for fields
                                            <div className="flex-1 flex items-center justify-center">
                                                <div className="text-center">
                                                    <p className="text-red-500 text-xs mb-2">Failed to load fields</p>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-6 text-xs"
                                                        onClick={() => setActiveTab("fields")}
                                                    >
                                                        Retry
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : Object.entries(getFieldCategoryMap()).length === 0 ? (
                                            // Empty state for fields
                                            <div className="flex-1 flex items-center justify-center">
                                                <div className="text-center">
                                                    <ListChecks className="h-10 w-10 mx-auto mb-2 text-slate-300" />
                                                    <p className="text-slate-500 text-xs">No fields found</p>
                                                </div>
                                            </div>
                                        ) : (
                                            // Display fields grouped by table
                                            <ScrollArea className="flex-1 pr-3 -mr-3">
                                                <div className="space-y-4">
                                                    {Object.entries(getFieldCategoryMap()).map(([category, fields]) => (
                                                        <div key={category}>
                                                            <h4 className="font-medium text-[0.65rem] text-slate-500 mb-1 uppercase tracking-wider">{category}</h4>
                                                            <div className="space-y-0.5">
                                                                {fields.map((field) => (
                                                                    <div
                                                                        key={field.id}
                                                                        className="flex items-center justify-between py-1 px-1.5 hover:bg-slate-50 rounded text-xs group"
                                                                    >
                                                                        <div className="flex items-center gap-1.5">
                                                                            <div className="w-5 h-5 rounded flex items-center justify-center text-[0.65rem] bg-blue-100 text-blue-600">
                                                                                {getFieldTypeIcon(field.columnType)}
                                                                            </div>
                                                                            <div>
                                                                                <div className="font-medium text-slate-800">{field.columnDisplayName}</div>
                                                                                <div className="text-[0.65rem] text-slate-500">{field.columnName}</div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="opacity-0 group-hover:opacity-100 text-[0.65rem] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-sm">
                                                                            {field.columnType}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </ScrollArea>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}