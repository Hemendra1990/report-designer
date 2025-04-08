import React, { RefObject } from 'react';
import { Input } from "@/components/ui/input";
import { SearchIcon, CrossIcon } from "@/components/icons";
import { GroupingState } from "@tanstack/react-table";

interface GroupsSectionProps {
  selectedColumns: Array<{
    id: string;
    name: string;
    type: string;
  }>;
  groupSearchTerm: string;
  setGroupSearchTerm: (value: string) => void;
  showGroupDropdown: boolean;
  setShowGroupDropdown: (show: boolean) => void;
  setSelectedGroup: (id: string | null) => void;
  handleGroupBy: (fieldId: string) => void;
  grouping: GroupingState;
  groupSearchRef: React.MutableRefObject<HTMLDivElement | null>;
}

const GroupsSection: React.FC<GroupsSectionProps> = ({
  selectedColumns,
  groupSearchTerm,
  setGroupSearchTerm,
  showGroupDropdown,
  setShowGroupDropdown,
  setSelectedGroup,
  handleGroupBy,
  grouping,
  groupSearchRef
}) => {
  return (
    <div className="border-b border-gray-200 p-4">
      <div className="text-xs font-semibold text-muted-foreground mb-2">GROUP ROWS</div>
      <div className="relative" ref={groupSearchRef}>
        <Input
          className="pl-8 text-sm bg-background"
          placeholder="Add group..."
          value={groupSearchTerm}
          onChange={(e) => {
            setGroupSearchTerm(e.target.value);
            if (!showGroupDropdown) setShowGroupDropdown(true);
          }}
          onClick={() => setShowGroupDropdown(true)}
        />
        <SearchIcon 
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
        />

        {/* Group Dropdown */}
        {showGroupDropdown && (
          <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-md py-1 max-h-[300px] overflow-y-auto">
            {selectedColumns.filter(col =>
              !groupSearchTerm.trim() || col.name.toLowerCase().includes(groupSearchTerm.toLowerCase())
            ).length > 0 ? (
              selectedColumns
                .filter(col =>
                  !groupSearchTerm.trim() || col.name.toLowerCase().includes(groupSearchTerm.toLowerCase())
                )
                .map(column => (
                  <div
                    key={column.id}
                    className="px-3 py-2 hover:bg-accent cursor-pointer flex items-center gap-2 text-sm"
                    onClick={() => {
                      setSelectedGroup(column.id);
                      setGroupSearchTerm(column.name);
                      setShowGroupDropdown(false);
                      handleGroupBy(column.id);
                    }}
                  >
                    <span className={`size-4 flex items-center justify-center rounded-sm text-xs ${column.type === 'number' || column.type === 'currency' ? 'bg-primary/10 text-primary' : 'bg-accent/80 text-accent-foreground'}`}>
                      {column.name.charAt(0).toUpperCase()}
                    </span>
                    {column.name}
                  </div>
                ))
            ) : (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                No columns match your search
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected Groups */}
      {grouping.length > 0 && (
        <div className="mt-2 space-y-2">
          {grouping.map((groupId, index) => {
            const groupColumn = selectedColumns.find(col => col.id === groupId);
            if (!groupColumn) return null;
            return (
              <div key={groupId} className="bg-accent/50 border rounded-md p-2 text-sm flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{groupColumn.name}</span>
                  <span className="text-muted-foreground">Ascending</span>
                </div>
                <button
                  onClick={() => {
                    handleGroupBy(groupId);
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <CrossIcon />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GroupsSection; 