import React, { MutableRefObject } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeftIcon } from "@/components/icons";
import { FilterIcon, PivotTableIcon } from "@/components/icons/ReportIcons";
import { Filter } from "../model/Filter";
import { GroupingState } from "@tanstack/react-table";

import ColumnsSection from "./ColumnsSection";
import GroupsSection from "./GroupsSection";
import FilterLogicSelector from "./FilterLogicSelector";
import { FilterRow } from "./FilterRow";
import QuickFilterSelector from "./QuickFilterSelector";
import PivotOptions from "./PivotOptions";
import { Field, FormulaColumn } from '../model/Field';

interface Column {
  id: string;
  name: string;
  type: string;
  [key: string]: any;
}

interface ReportBuilderPanelProps {
  centerPanelCollapsed: boolean;
  setCenterPanelCollapsed: (collapsed: boolean) => void;
  showShortcuts: boolean;
  filters: Filter[];
  
  // Groups section props
  selectedColumns: Column[];
  groupSearchTerm: string;
  setGroupSearchTerm: (value: string) => void;
  showGroupDropdown: boolean;
  setShowGroupDropdown: (show: boolean) => void;
  setSelectedGroup: (id: string | null) => void;
  handleGroupBy: (fieldId: Field) => void;
  grouping: GroupingState;
  groupSearchRef: MutableRefObject<HTMLDivElement | null>;
  addSummaryFormulaColumn?: () => void;
  editSummaryFormulaColumn?: (column: any) => void;
  
  // Columns section props
  isMenuOpen: boolean;
  menuRef: MutableRefObject<HTMLDivElement | null>;
  menuPosition: { top: number; left: number };
  columnRefs: MutableRefObject<(HTMLDivElement | null)[]>;
  draggedItem: number | null;
  openColumnMenu: (e: React.MouseEvent) => void;
  addFormulaColumn: () => void;
  editFormulaColumn: (column: any) => void;
  handleDragStart: (index: number) => void;
  handleDragOver: (e: React.DragEvent, index: number) => void;
  removeColumn: (id: string) => void;
  setIsMenuOpen: (isOpen: boolean) => void;
  setSelectedColumns: (columns: Column[]) => void;
  setDraggedItem: (item: number | null) => void;
  
  // Filters section props
  filterLogic: 'and' | 'or' | 'custom';
  setFilterLogic: (value: 'and' | 'or' | 'custom') => void;
  customFormula: string;
  setCustomFormula: (value: string) => void;
  addFilter: (field: any) => void;
  removeFilter: (filterId: string) => void;
  updateFilter: (filterId: string, updates: Partial<Filter>) => void;
  setShowFilterFieldSelector: (show: boolean) => void;
  
  // Pivot section props
  isPivotActive?: boolean;
  setIsPivotActive?: (active: boolean) => void;
  pivotColumnIds?: string[];
  setPivotColumnIds?: (ids: string[]) => void;
  pivotValues?: string[];
  setPivotValues?: (values: string[]) => void;
  groupByFields?: string[];
  setGroupByFields?: (fields: string[]) => void;
  selectedAggregations?: Record<string, string>;
  setSelectedAggregations?: (aggs: Record<string, string>) => void;
  onApplyPivot?: () => void;
}

const ReportBuilderPanel: React.FC<ReportBuilderPanelProps> = ({
  centerPanelCollapsed,
  setCenterPanelCollapsed,
  showShortcuts,
  filters,
  
  // Groups section props
  selectedColumns,
  groupSearchTerm,
  setGroupSearchTerm,
  showGroupDropdown,
  setShowGroupDropdown,
  setSelectedGroup,
  handleGroupBy,
  grouping,
  groupSearchRef,
  addSummaryFormulaColumn,
  editSummaryFormulaColumn,
  
  // Columns section props
  isMenuOpen,
  menuRef,
  menuPosition,
  columnRefs,
  draggedItem,
  openColumnMenu,
  addFormulaColumn,
  editFormulaColumn,
  handleDragStart,
  handleDragOver,
  removeColumn,
  setIsMenuOpen,
  setSelectedColumns,
  setDraggedItem,
  
  // Filters section props
  filterLogic,
  setFilterLogic,
  customFormula,
  setCustomFormula,
  addFilter,
  removeFilter,
  updateFilter,
  setShowFilterFieldSelector,
  
  // Pivot section props
  isPivotActive = false,
  setIsPivotActive = () => {},
  pivotColumnIds = [],
  setPivotColumnIds = () => {},
  pivotValues = [],
  setPivotValues = () => {},
  groupByFields = [],
  setGroupByFields = () => {},
  selectedAggregations = {},
  setSelectedAggregations = () => {},
  onApplyPivot = () => {}
}) => {
  // Default aggregation functions that can be used in pivot tables
  const aggregationFunctions = ["SUM", "AVG", "MIN", "MAX", "COUNT"];
  
  // Store active tab for showing label in collapsed state
  const [activeTab, setActiveTab] = React.useState<string>("outline");
  
  return (
    <div className={`${centerPanelCollapsed ? 'w-12' : 'w-64'} flex flex-col bg-card border-r border-border transition-all duration-300 shrink-0`}>
      {/* Collapse Control */}
      <div className="flex justify-end p-1">
        <button
          onClick={() => setCenterPanelCollapsed(!centerPanelCollapsed)}
          className="p-1 text-muted-foreground hover:text-foreground transition-colors"
          title={centerPanelCollapsed ? "Expand builder panel" : "Collapse builder panel"}
        >
          <ChevronLeftIcon 
            className={`transition-transform ${centerPanelCollapsed ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {centerPanelCollapsed ? (
        // Collapsed state with vertical label
        <div className="flex flex-col items-center flex-1">
          {/* Move label to top with larger text */}
          <div className="mt-8 mb-6">
            <div className="rotate-90 transform origin-center whitespace-nowrap text-base font-medium text-indigo-600">
              {activeTab === "outline" && "Outline"}
              {activeTab === "filters" && "Filters"}
              {activeTab === "pivot" && "Pivot"}
            </div>
          </div>
          
          {/* Move indicators to top, after the label */}
          <div className="flex flex-col items-center space-y-3 mb-4">
            <button 
              onClick={() => { setActiveTab("outline"); setCenterPanelCollapsed(false); }}
              className={`w-2 h-2 rounded-full ${activeTab === "outline" ? "bg-indigo-600" : "bg-slate-300 hover:bg-slate-400"}`}
              title="Outline"
            />
            <button 
              onClick={() => { setActiveTab("filters"); setCenterPanelCollapsed(false); }}
              className={`w-2 h-2 rounded-full ${activeTab === "filters" ? "bg-indigo-600" : "bg-slate-300 hover:bg-slate-400"}`}
              title="Filters"
            />
            <button 
              onClick={() => { setActiveTab("pivot"); setCenterPanelCollapsed(false); }}
              className={`w-2 h-2 rounded-full ${activeTab === "pivot" ? "bg-indigo-600" : "bg-slate-300 hover:bg-slate-400"}`} 
              title="Pivot"
            />
          </div>
          
          {/* Add empty space to fill the rest */}
          <div className="flex-1"></div>
        </div>
      ) : (
        <Tabs 
          defaultValue="outline" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex flex-col flex-1"
        >
          <div className="border-b border-gray-200">
            <TabsList className="p-0 bg-transparent border-b-0">
              <TabsTrigger
                value="outline"
                className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:shadow-none"
              >
                Outline
              </TabsTrigger>
              <TabsTrigger
                value="filters"
                className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:shadow-none"
              >
                Filters ({filters.length})
              </TabsTrigger>
              <TabsTrigger
                value="pivot"
                className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:shadow-none"
              >
                <PivotTableIcon className="h-4 w-4 mr-1" />
                Pivot
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="outline" className="m-0 data-[state=active]:p-4 flex-1 overflow-auto">
            <div>
              <h3 className="text-lg font-medium mb-3">Groups</h3>
              <GroupsSection
                groupSearchTerm={groupSearchTerm}
                setGroupSearchTerm={setGroupSearchTerm}
                showGroupDropdown={showGroupDropdown}
                setShowGroupDropdown={setShowGroupDropdown}
                selectedColumns={selectedColumns}
                setSelectedGroup={setSelectedGroup}
                handleGroupBy={handleGroupBy}
                grouping={grouping}
                groupSearchRef={groupSearchRef}
                addSummaryFormulaColumn={addSummaryFormulaColumn}
                editSummaryFormulaColumn={editSummaryFormulaColumn}
              />
            </div>

            <div className="mt-6">
              <ColumnsSection
                selectedColumns={selectedColumns}
                isMenuOpen={isMenuOpen}
                menuRef={menuRef}
                menuPosition={menuPosition}
                columnRefs={columnRefs}
                draggedItem={draggedItem}
                openColumnMenu={openColumnMenu}
                addFormulaColumn={addFormulaColumn}
                editFormulaColumn={editFormulaColumn}
                handleDragStart={handleDragStart}
                handleDragOver={handleDragOver}
                removeColumn={removeColumn}
                setIsMenuOpen={setIsMenuOpen}
                setSelectedColumns={setSelectedColumns}
                setDraggedItem={setDraggedItem}
              />
            </div>
          </TabsContent>

          <TabsContent value="filters" className="m-0 data-[state=active]:p-4">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Filters</h3>
                <Button
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => setShowFilterFieldSelector(true)}
                >
                  <FilterIcon width={16} height={16} />
                  Add Filter
                </Button>
              </div>

              <div className="space-y-4">
                {/* Filter Logic Selector */}
                <FilterLogicSelector
                  filterLogic={filterLogic}
                  setFilterLogic={setFilterLogic}
                  customFormula={customFormula}
                  setCustomFormula={setCustomFormula}
                />

                {/* Display existing filters */}
                {filters.map((filter, index) => (
                  <FilterRow
                    key={filter.id}
                    filter={filter}
                    onRemove={() => removeFilter(filter.id)}
                    onUpdate={(updates) => updateFilter(filter.id, updates)}
                    index={index + 1}
                  />
                ))}

                {/* Show message when no filters exist */}
                {filters.length === 0 && (
                  <div className="bg-gray-50 p-4 rounded-md border border-dashed border-gray-300 text-center">
                    <p className="text-gray-500 text-sm font-medium">No filters currently configured</p>
                    <p className="text-gray-400 text-xs mt-1">Add filters to refine your report data</p>
                  </div>
                )}
              </div>

              {/* Filter Field Selection UI */}
              {/* QuickFilterSelector will be rendered as a modal/popup at the app level */}
            </div>
          </TabsContent>
          
          <TabsContent value="pivot" className="m-0 data-[state=active]:p-4">
            <PivotOptions
              selectedColumns={selectedColumns}
              isPivotActive={isPivotActive}
              setIsPivotActive={setIsPivotActive}
              pivotColumnIds={pivotColumnIds}
              setPivotColumnIds={setPivotColumnIds}
              pivotValues={pivotValues}
              setPivotValues={setPivotValues}
              groupByFields={groupByFields}
              setGroupByFields={setGroupByFields}
              aggregationFunctions={aggregationFunctions}
              selectedAggregations={selectedAggregations}
              setSelectedAggregations={setSelectedAggregations}
              onApplyPivot={onApplyPivot}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default ReportBuilderPanel; 