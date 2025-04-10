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
import { 
    useReportCategories, 
    useReportTypeFields, 
    useRecentReports, 
    useReportTypes,
    useFilteredFields
} from "@/hooks/useReportTypes";
import { Field } from "@/services/reportTypes.service";
import { Skeleton } from "@/components/ui/skeleton";

export function ReportTypeSelectionModal({
    isOpen,
    onClose,
    onSelect
}: {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (reportType: ReportTypeTemplate) => void;
}) {
    // State
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedReport, setSelectedReport] = useState<RecentReportType | null>(null);
    const [activeTab, setActiveTab] = useState<"details" | "fields">("details");
    const [fieldSearchTerm, setFieldSearchTerm] = useState("");
    
    // React Query hooks
    const { 
        data: categoriesData, 
        isLoading: categoriesLoading 
    } = useReportCategories({
        enabled: isOpen
    });
    
    const {
        data: recentReportsData,
        isLoading: recentReportsLoading,
        isError: recentReportsError
    } = useRecentReports(
        { 
            search: searchTerm,
            category: selectedCategory || undefined
        },
        {
            enabled: isOpen,
            placeholderData: prevData => prevData
        }
    );
    
    const {
        data: fieldsData,
        isLoading: fieldsLoading,
        isError: fieldsError
    } = useReportTypeFields(
        selectedReport?.type || '',
        { search: fieldSearchTerm },
        {
            enabled: isOpen && activeTab === "fields" && !!selectedReport
        }
    );
    
    // Perform client-side field filtering
    const fieldsByCategory = useFilteredFields(fieldsData?.fields || [], fieldSearchTerm);
    
    // Get categories from data
    const categories = useMemo(() => 
        categoriesData?.categories || [],
        [categoriesData]
    );
    
    // Get filtered reports from data
    const filteredReports = useMemo(() => 
        recentReportsData?.reports || [],
        [recentReportsData]
    );
    
    // Reset selected report when closing the modal
    useEffect(() => {
        if (!isOpen) {
            setSelectedReport(null);
            setActiveTab("details");
            setSearchTerm("");
            setFieldSearchTerm("");
            setSelectedCategory(null);
        }
    }, [isOpen]);
    
    // Helper function to get field icon based on type
    const getFieldTypeIcon = (type: string) => {
        switch (type) {
            case 'text':
                return <span className="text-blue-600">Aa</span>;
            case 'textarea':
                return <span className="text-blue-600">¶</span>;
            case 'number':
                return <span className="text-purple-600">#</span>;
            case 'currency':
                return <span className="text-green-600">$</span>;
            case 'percent':
                return <span className="text-orange-600">%</span>;
            case 'date':
            case 'datetime':
                return <Clock className="h-3 w-3" />;
            case 'picklist':
            case 'multipicklist':
                return <ListChecks className="h-3 w-3" />;
            case 'reference':
                return <ExternalLink className="h-3 w-3" />;
            case 'id':
                return <span className="text-gray-600">ID</span>;
            case 'checkbox':
                return <span className="text-green-600">✓</span>;
            case 'email':
                return <span className="text-blue-600">@</span>;
            case 'url':
                return <span className="text-blue-600">🔗</span>;
            case 'phone':
                return <span className="text-blue-600">📞</span>;
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
            case 'Marketing': return <BarChart4 className="h-3.5 w-3.5" />;
            case 'Service': return <Users className="h-3.5 w-3.5" />;
            default: return <PieChart className="h-3.5 w-3.5" />;
        }
    };

    const handleReportSelect = (report: RecentReportType) => {
        setSelectedReport(report);
        setActiveTab("details"); // Reset to details tab when selecting a new report
    };

    const handleStartReport = () => {
        if (!selectedReport) return;
        
        // Convert the selected report to a report template format
        const reportTemplate: ReportTypeTemplate = {
            id: selectedReport.type, // Use the type as ID (e.g., "tabular", "summary")
            name: selectedReport.name,
            description: selectedReport.description,
            icon: selectedReport.objects?.[0]?.icon || selectedReport.name.charAt(0).toUpperCase(),
            color: selectedReport.objects?.[0]?.color || "#3B82F6",
            type: selectedReport.type
        };
        
        onSelect(reportTemplate);
    };
    
    // Render category loading skeletons
    const renderCategorySkeleton = () => (
        <div className="space-y-1 px-2">
            {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="w-full h-7 rounded-md" />
            ))}
        </div>
    );
    
    // Render report loading skeletons
    const renderReportSkeleton = () => (
        <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="w-full h-24 rounded-md" />
            ))}
        </div>
    );
    
    // Render field loading skeletons
    const renderFieldSkeleton = () => (
        <div className="space-y-1">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Skeleton key={i} className="w-full h-6 rounded-md" />
            ))}
        </div>
    );

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[1200px] h-[85vh] p-0 flex overflow-hidden rounded-lg shadow-2xl border-0 bg-white">
                {/* Left side - Categories Sidebar - Always visible */}
                <div className="w-48 py-4 border-r border-gray-100 flex-shrink-0 overflow-y-auto bg-slate-50/80">
                    <h3 className="font-medium text-xs uppercase tracking-wider text-slate-500 mb-2 px-4">Categories</h3>
                    
                    {categoriesLoading ? (
                        renderCategorySkeleton()
                    ) : (
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
                            {categories.map((category) => (
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
                            ))}
                        </div>
                    )}
                </div>

                {/* Dynamic content area that changes based on selection state */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Report List - Expands when no report is selected */}
                    <div className={cn(
                        "px-4 py-4 overflow-hidden flex flex-col",
                        selectedReport ? "flex-1 border-r border-gray-100" : "flex-1"
                    )}>
                        <DialogHeader className="px-0 mb-2">
                            <DialogTitle className="text-lg font-semibold text-slate-800">Select a Report Type</DialogTitle>
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

                        <h3 className="text-sm font-medium mb-2.5 text-slate-700">Recently Used Report Types</h3>

                        <div className="space-y-2 overflow-y-auto flex-1 pr-1">
                            {recentReportsLoading ? (
                                renderReportSkeleton()
                            ) : recentReportsError ? (
                                <div className="py-8 text-center text-slate-500">
                                    Error loading reports. Please try again.
                                </div>
                            ) : filteredReports.length > 0 ? (
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
                                                    {/* Use first letter instead of icon */}
                                                    <span className="text-md font-semibold">
                                                        {report.name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>

                                                <div className="flex-1">
                                                    <h4 className="font-medium text-sm text-slate-800 group-hover:text-primary flex items-center gap-2">
                                                        {report.name}
                                                        <Badge variant={report.status === "Active" ? "default" : "secondary"} className="ml-1.5 px-1 py-0 h-4 text-[0.65rem]">
                                                            {report.status}
                                                        </Badge>
                                                    </h4>
                                                    <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{report.description}</p>
                                                    <div className="flex items-center gap-2 mt-1.5">
                                                        <span className="text-[0.65rem] text-slate-500">
                                                            Last used: {new Date(report.lastUsed).toLocaleString()}
                                                        </span>
                                                        <span className="text-[0.65rem] text-slate-400">•</span>
                                                        <span className="text-[0.65rem] text-slate-500 capitalize">
                                                            {report.type} report
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-8 text-center text-slate-500">
                                    No reports found matching your criteria
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Report Details - Only visible when a report is selected */}
                    {selectedReport && (
                        <div className="w-1/3 px-4 py-4 flex flex-col overflow-hidden">
                            <div className="flex justify-between items-start mb-4">
                                <h2 className="text-base font-semibold text-slate-800">Details</h2>
                            </div>

                            <div className="flex items-center gap-2.5 mb-4">
                                <div className="w-10 h-10 bg-green-100 rounded-md flex items-center justify-center">
                                    <span className="text-green-600 text-lg font-bold">
                                        {selectedReport.name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-800">{selectedReport.name}</h3>
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
                                <Button variant="outline" size="icon" onClick={() => setSelectedReport(null)}>
                                    <X className="h-3.5 w-3.5" />
                                </Button>
                            </div>

                            <div className="border-t border-slate-200 pt-3 mb-3 flex-1 overflow-hidden flex flex-col">
                                <div className="flex gap-3 mb-3">
                                    <Button
                                        variant={activeTab === "details" ? "default" : "ghost"}
                                        className="flex-1 justify-start px-3 h-7 text-xs"
                                        onClick={() => setActiveTab("details")}
                                    >
                                        <Clock className="h-3.5 w-3.5 mr-1.5" />
                                        Details
                                    </Button>
                                    <Button
                                        variant={activeTab === "fields" ? "default" : "ghost"}
                                        className="flex-1 justify-start px-3 h-7 text-xs"
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

                                            {selectedReport.createdBy && (
                                                <>
                                                    <h4 className="font-medium text-xs mb-1.5 text-slate-700">Created By</h4>
                                                    <div className="flex items-center gap-1.5 mb-3">
                                                        <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                                                            <span className="text-blue-600 text-xs font-bold">
                                                                {selectedReport.createdBy.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <span className="text-xs text-slate-700">{selectedReport.createdBy}</span>
                                                    </div>
                                                </>
                                            )}

                                            <h4 className="font-medium text-xs mb-1.5 text-slate-700">Objects Used in Report Type</h4>
                                            {selectedReport.objects?.map((obj, index) => (
                                                <div key={index} className="flex items-center gap-1.5 mb-1.5">
                                                    <div
                                                        className="w-6 h-6 rounded flex items-center justify-center"
                                                        style={{ backgroundColor: `${obj.color}20` }}
                                                    >
                                                        <span className="text-xs font-bold" style={{ color: obj.color }}>
                                                            {obj.icon || obj.name.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <span className="text-xs text-blue-600">{obj.name}</span>

                                                    {obj.relatedObjects?.map((related, idx) => (
                                                        <div key={idx} className="flex items-center ml-3">
                                                            <div
                                                                className="w-5 h-5 rounded flex items-center justify-center"
                                                                style={{ backgroundColor: `${related.color}20` }}
                                                            >
                                                                <span className="text-xs font-bold" style={{ color: related.color }}>
                                                                    {related.icon || related.name.charAt(0).toUpperCase()}
                                                                </span>
                                                            </div>
                                                            <span className="text-xs text-blue-600 ml-1">{related.name}</span>
                                                            <span className="text-xs text-slate-500 ml-1">({related.relation})</span>
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

                                        <ScrollArea className="flex-1 pr-1">
                                            {fieldsLoading ? (
                                                renderFieldSkeleton()
                                            ) : fieldsError ? (
                                                <div className="flex-1 flex items-center justify-center">
                                                    <div className="text-center">
                                                        <p className="text-red-500 text-xs mb-2">Error loading fields</p>
                                                    </div>
                                                </div>
                                            ) : Object.keys(fieldsByCategory).length === 0 ? (
                                                <div className="flex-1 flex items-center justify-center">
                                                    <div className="text-center">
                                                        <ListChecks className="h-10 w-10 mx-auto mb-2 text-slate-300" />
                                                        <p className="text-slate-500 text-xs">No fields found</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    {Object.entries(fieldsByCategory).map(([category, fields]) => (
                                                        <div key={category}>
                                                            <h4 className="font-medium text-[0.65rem] text-slate-500 mb-1 uppercase tracking-wider">{category}</h4>
                                                            <div className="space-y-0.5">
                                                                {fields.map((field) => (
                                                                    <div
                                                                        key={field.id}
                                                                        className="flex items-center justify-between py-1 px-1.5 hover:bg-slate-50 rounded text-xs group"
                                                                    >
                                                                        <div className="flex items-center gap-1.5">
                                                                            <div className={`w-5 h-5 rounded flex items-center justify-center text-[0.65rem] ${
                                                                                field.isCustom
                                                                                    ? 'bg-purple-100 text-purple-600'
                                                                                    : 'bg-blue-100 text-blue-600'
                                                                            }`}>
                                                                                {getFieldTypeIcon(field.type)}
                                                                            </div>
                                                                            <div>
                                                                                <div className="font-medium text-slate-800">{field.label}</div>
                                                                                <div className="text-[0.65rem] text-slate-500">{field.name}</div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="opacity-0 group-hover:opacity-100 text-[0.65rem] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-sm">
                                                                            {field.type}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </ScrollArea>
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