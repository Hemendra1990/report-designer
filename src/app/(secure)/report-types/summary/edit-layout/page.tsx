"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ReportTypeLayout } from "@/components/model/report-type";
import { useReportTypeFormContext } from "@/contexts/report-type-form-context";
import { useCallback } from 'react';
import { useInvalidateAllReportTypeSummary, useUpdateReportTypeLayoutStatus } from "@/hooks/report-type-hook";
import { useRouter } from "next/navigation";
import ToastMessage from "../summary-helper";


export default function EditLayout() {
  const { reportType, setReportType } = useReportTypeFormContext();
  const displayLabel = reportType?.label
  const router = useRouter();
  // Initialize selectedTab with a fallback value in case reportType is not immediately available
  const [selectedTab, setSelectedTab] = useState<string>("");
  const [primaryObject, setPrimaryObject] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showSuccessMessage, setShowSuccessMessage] = useState<boolean>(false);
  const updateReportTypeLayoutStatus = useUpdateReportTypeLayoutStatus();
  const [showErrorToast, setShowErrorToast] = useState<string>('');
  const { invalidateAllReportTypeSummary }  = useInvalidateAllReportTypeSummary();

  // Get column details for the selected tab

  useEffect(() => {
    if (!selectedTab && reportType?.layoutList?.length && reportType?.layoutList[0].tableName) {
      let initialTable = reportType?.layoutList[0].tableName;
      setSelectedTab(initialTable);
      setPrimaryObject(reportType.primaryTable);
    }
  }, [selectedTab, reportType?.layoutList])

  // Get all objects involved in this report type
  const getAllObjects = () => {
    let allTables = reportType?.layoutList?.map((e) => e.tableName);
    let uniqueTables = new Set(allTables);
    return Array.from(uniqueTables);
  };

  let selectedTabColumns: ReportTypeLayout[] = useMemo(() => {
    if (!selectedTab || !reportType?.layoutList?.length) return [];
    return reportType.layoutList
      .filter(col => col.tableName === selectedTab);
  }, [selectedTab]);

  selectedTabColumns = selectedTabColumns?.filter(
    (e) =>
      e.columnDisplayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.columnType?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Toggle field selection
  const handleColumnCheck = (objectId: string, fieldName: string, checked: boolean) => {
    reportType?.layoutList?.forEach((e) => {
      if (e.tableName === selectedTab && e.id === objectId) {
        e.active = checked
      }
    });
    setReportType({ ...reportType });
  };

  const handleSelectAll = (checked: boolean) => {
    reportType?.layoutList?.forEach((e) => {
      if (e.tableName === selectedTab) {
        e.active = checked
      }
    });
    setReportType({ ...reportType });
  }


  const getSelectedFieldCount = useCallback((name?: string) => {
    return reportType?.layoutList
      ?.filter((e) => e.tableName === name && e.active === true)
      .length || 0;
  }, [reportType]);

  const handleOnError = (err: any) => {
    setShowErrorToast(err?.response?.data?.message || 'Something went wrong. Please try again.');
    setTimeout(() => setShowErrorToast(''), 3000);
  }
  // Handle save
  const handleSave = () => {
    updateReportTypeLayoutStatus.mutate(
      { payload: reportType},
      {
        onSuccess: () => {
          invalidateAllReportTypeSummary();
          setShowSuccessMessage(true);
          setTimeout(() => {
            setShowSuccessMessage(false);
          }, 3000);
          router.push("/report-types");
        },
        onError: (error) => {
          handleOnError(error);
        },
      }
    );
  };


  const allObjects = getAllObjects();
  const totalSelectedFields = reportType?.layoutList?.filter(e => e.active)?.length || 0;

  // Handle tab change
  const handleTabChange = (value: string) => {
    setSelectedTab(value);
  };

  const getColorByName = (name: string): string => {
    const colors = [
      '#FF6B6B', '#6BCB77', '#4D96FF', '#FFD93D',
      '#845EC2', '#FF9671', '#00C9A7', '#C34A36',
      '#F9F871', '#0081CF'
    ];

    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    const index = Math.abs(hash % colors.length);
    return colors[index];
  };

  const formatDisplayText = (str: string) => {
    if (!str) return "";
    return str
      .replace(/_/g, ' ')                         // Replace underscores with space
      .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize first letter of each word
  };


  return (
    <div className="min-h-screen bg-muted/40">
      {/* Main Content */}
      <main className="container mx-auto py-8 px-4">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-muted-foreground mb-4">
            <Link href="/report-types/summary" className="hover:text-foreground">
              Report Type Summary
            </Link>
            <span>→</span>
            <span className="text-foreground font-medium">Edit Fields Layout</span>
          </div>

          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Edit Field Layout</h1>
              <p className="text-muted-foreground">
                Customize which fields are available in {displayLabel} ({totalSelectedFields} fields selected)
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/report-types/summary">
                <Button variant="outline">Cancel</Button>
              </Link>
              <Button onClick={handleSave}>Save Layout</Button>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {showSuccessMessage && (
          <div className="mb-6 bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-900 text-green-800 dark:text-green-300 p-4 rounded-md">
            <div className="flex items-center gap-2">
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
                className="text-green-600 dark:text-green-400"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span className="font-medium">Layout saved successfully!</span>
            </div>
          </div>
        )}
        {/* Tabs and Fields Editor */}
        <div className="bg-background border rounded-lg overflow-hidden">
          <Tabs
            value={selectedTab}
            onValueChange={handleTabChange}
            defaultValue={primaryObject?.id}
          >
            <div className="px-4">
              <TabsList className="mt-3 gap-3 bg-transparent p-0">
                {allObjects.map((obj, index) => (
                  <TabsTrigger
                    key={obj}
                    value={obj}
                    className={`
                      flex items-center gap-3 px-4 py-2
                      border rounded-full transition-all
                      shadow-sm text-sm font-medium
                      h-12
                      data-[state=active]:bg-white
                      data-[state=active]:border-[${getColorByName(obj)}]
                      data-[state=active]:shadow-md
                      hover:bg-muted
                    `}
                    style={{
                      borderColor: selectedTab === obj ? getColorByName(obj) : "transparent",
                    }}
                  >
                    {/* Colored circle with letter */}
                    <div
                      className="h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                      style={{
                        backgroundColor: selectedTab === obj
                          ? getColorByName(obj)
                          : `${getColorByName(obj)}40`,
                        color: selectedTab === obj ? "white" : getColorByName(obj),
                      }}
                    >
                      {obj.charAt(0).toUpperCase()}
                    </div>

                    {/* Name + field count */}
                    <div className="flex flex-col items-start justify-center leading-tight">
                      <span className="font-medium text-sm"> {formatDisplayText(obj)}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        {getSelectedFieldCount(obj)} fields
                      </span>
                    </div>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* Tab Content Areas */}
            <div className="p-4">
              {/* Search Bar */}
              <div className="mb-6">
                <div className="relative">
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
                    placeholder="Search fields by name or type..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              {/* Select All / Deselect All Controls */}
              <div className="mb-2 flex justify-between items-center">
                <div className="text-sm font-medium">
                  {reportType?.layoutList?.filter((e) => e.tableName == selectedTab).length || 0} of {reportType?.layoutList?.filter((e) => e.tableName == selectedTab && e.active === true).length || 0} fields selected
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      handleSelectAll(true);
                    }}
                  >
                    Select All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      handleSelectAll(false);
                    }}
                  >
                    Deselect All
                  </Button>
                </div>
              </div>
              {selectedTabColumns.length && (
                <TabsContent key={selectedTab} value={selectedTab} className="mt-0">
                  <div className="rounded-md border">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="w-[50px] p-3 text-left"></th>
                          <th className="p-3 text-left font-medium text-sm">Field Label</th>
                          <th className="p-3 text-left font-medium text-sm">API Name</th>
                          <th className="p-3 text-left font-medium text-sm">Type</th>
                          <th className="w-[120px] p-3 text-right font-medium text-sm">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {selectedTabColumns.map((field, idx) => (
                          <tr key={field.columnName} className="hover:bg-muted/30">
                            <td className="p-3 text-center">
                              <Checkbox
                                id={`${field.id}-${field.active}`}
                                checked={field.active}
                                onCheckedChange={(checked: boolean) => handleColumnCheck(field.id, field.columnName, checked)}
                              />
                            </td>
                            <td className="p-3">
                              <Label
                                htmlFor={`${field.id}-${field.columnDisplayName}`}
                                className="font-medium text-sm cursor-pointer"
                              >
                                {field.columnDisplayName}
                              </Label>
                            </td>
                            <td className="p-3 text-sm text-muted-foreground">{field.columnName}</td>
                            <td className="p-3">
                              <span className="text-xs px-2 py-1 rounded bg-muted">
                                {field.columnType}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              {field.active ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 text-xs"
                                  onClick={() => handleColumnCheck(field.id, field.columnName, !field?.active)}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="mr-1 text-red-500"
                                  >
                                    <path d="M18 6 6 18" />
                                    <path d="m6 6 12 12" />
                                  </svg>
                                  Remove
                                </Button>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 text-xs"
                                  onClick={() => handleColumnCheck(field.id, field.columnName, !field.active)}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="mr-1 text-green-500"
                                  >
                                    <path d="M12 5v14" />
                                    <path d="M5 12h14" />
                                  </svg>
                                  Add
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>
              )}
            </div>
          </Tabs>
        </div>
        {
          showErrorToast && (
            <ToastMessage type="error" message={showErrorToast} />
          )
        }
        {/* Action Buttons at Bottom */}
        <div className="mt-8 flex justify-between items-center">
          <Link href="/report-types/summary">
            <Button variant="outline">Cancel</Button>
          </Link>
          <div className="flex items-center gap-3">
            <Button onClick={handleSave}>Save Layout</Button>
          </div>
        </div>
      </main>
    </div>
  );
}