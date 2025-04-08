import React, { MutableRefObject } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeftIcon } from "@/components/icons";
import { FilterIcon } from "@/components/icons/ReportIcons";
import { Filter } from "../model/Filter";
import { GroupingState } from "@tanstack/react-table";

import ColumnsSection from "./ColumnsSection";
import GroupsSection from "./GroupsSection";
import FilterLogicSelector from "./FilterLogicSelector";
import { FilterRow } from "./FilterRow";
import QuickFilterSelector from "./QuickFilterSelector";

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
  handleGroupBy: (fieldId: string) => void;
  grouping: GroupingState;
  groupSearchRef: MutableRefObject<HTMLDivElement | null>;
  
  // Columns section props
  isMenuOpen: boolean;
  menuRef: MutableRefObject<HTMLDivElement | null>;
  menuPosition: { top: number; left: number };
  columnRefs: MutableRefObject<(HTMLDivElement | null)[]>;
  draggedItem: number | null;
  openColumnMenu: (e: React.MouseEvent) => void;
  addFormulaColumn: () => void;
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
  accountFields: Array<{
    id: string;
    name: string;
    type: string;
    category: string;
    icon: string;
  }>;
  addFilter: (field: any) => void;
  removeFilter: (filterId: string) => void;
  updateFilter: (filterId: string, updates: Partial<Filter>) => void;
  setShowFilterFieldSelector: (show: boolean) => void;
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
  
  // Columns section props
  isMenuOpen,
  menuRef,
  menuPosition,
  columnRefs,
  draggedItem,
  openColumnMenu,
  addFormulaColumn,
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
  accountFields,
  addFilter,
  removeFilter,
  updateFilter,
  setShowFilterFieldSelector
}) => {
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

      {!centerPanelCollapsed ? (
        <Tabs defaultValue="outline" className="flex flex-col flex-1">
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
            </TabsList>
          </div>

          <TabsContent value="outline" className="flex-1 flex flex-col m-0 data-[state=active]:p-0">
            {/* Groups Section */}
            <GroupsSection
              selectedColumns={selectedColumns}
              groupSearchTerm={groupSearchTerm}
              setGroupSearchTerm={setGroupSearchTerm}
              showGroupDropdown={showGroupDropdown}
              setShowGroupDropdown={setShowGroupDropdown}
              setSelectedGroup={setSelectedGroup}
              handleGroupBy={handleGroupBy}
              grouping={grouping}
              groupSearchRef={groupSearchRef}
            />

            {/* Columns Section */}
            <ColumnsSection
              selectedColumns={selectedColumns}
              isMenuOpen={isMenuOpen}
              menuRef={menuRef}
              menuPosition={menuPosition}
              columnRefs={columnRefs}
              draggedItem={draggedItem}
              openColumnMenu={openColumnMenu}
              addFormulaColumn={addFormulaColumn}
              handleDragStart={handleDragStart}
              handleDragOver={handleDragOver}
              removeColumn={removeColumn}
              setIsMenuOpen={setIsMenuOpen}
              setSelectedColumns={setSelectedColumns}
              setDraggedItem={setDraggedItem}
            />
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
              {/* <QuickFilterSelector 
                accountFields={accountFields}
                addFilter={addFilter}
                onOpenFullSelector={() => setShowFilterFieldSelector(true)}
              /> */}
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        // Collapsed view for center panel
        <div className="flex flex-col items-center pt-4 overflow-hidden">
          <div className="text-base font-medium text-gray-700 rotate-90 whitespace-nowrap tracking-wide mb-8">
            Outline
          </div>
          
          {/* Conditionally render shortcuts based on state */}
          {showShortcuts && (
            <>
              <div className="text-base font-medium text-gray-700 rotate-90 whitespace-nowrap tracking-wide mt-8">
                Outline
              </div>
              <div className="text-base font-medium text-gray-700 rotate-90 whitespace-nowrap tracking-wide mt-8">
                Filters ({filters.length})
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportBuilderPanel; 