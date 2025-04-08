import React, { RefObject, MutableRefObject } from 'react';
import { 
  ChevronDownIcon, 
  CrossIcon,
  DragHandleIcon,
  PlusIcon
} from "@/components/icons";
import { BucketIcon, FormulaIcon } from "@/components/icons/ReportIcons";
import { TrashIcon } from "@/components/icons";

interface Column {
  id: string;
  name: string;
  type: string;
  formula?: string;
  [key: string]: any;
}

interface ColumnsSectionProps {
  selectedColumns: Column[];
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
}

const ColumnsSection: React.FC<ColumnsSectionProps> = ({
  selectedColumns,
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
  setDraggedItem
}) => {
  return (
    <div className="p-4 flex-1">
      <div className="flex justify-between items-center mb-3">
        <div className="text-xs font-semibold text-gray-500">COLUMNS</div>
        <div className="relative">
          <button
            className="text-sm text-blue-600 flex items-center"
            onClick={openColumnMenu}
          >
            <PlusIcon className="mr-1" />
            Add Column
            <ChevronDownIcon className="ml-1" />
          </button>

          {/* Column Menu Dropdown */}
          {isMenuOpen && (
            <div
              ref={menuRef}
              className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 w-48"
              style={{
                top: menuPosition.top - 250,
                left: menuPosition.left - 100,
                position: 'fixed'
              }}
            >
              <div className="py-1">
                <button
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left flex items-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <BucketIcon className="mr-2" />
                  Add Bucket Column
                </button>
                <button
                  className="px-4 py-2 text-sm text-gray-400 w-full text-left flex items-center cursor-not-allowed"
                >
                  <FormulaIcon className="mr-2" />
                  Add Summary Formula
                </button>
                <button
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left flex items-center"
                  onClick={addFormulaColumn}
                >
                  <FormulaIcon className="mr-2" />
                  Add Row-Level Formula
                </button>
                <div className="border-t border-gray-200 my-1"></div>
                <button
                  className="px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left flex items-center"
                  onClick={() => {
                    setSelectedColumns([]);
                    setIsMenuOpen(false);
                  }}
                >
                  <TrashIcon className="mr-2" />
                  Remove All Columns
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {selectedColumns.map((column, index) => (
          <div
            key={column.id}
            ref={(el) => {
              // Fix the ref assignment
              if (columnRefs.current) {
                columnRefs.current[index] = el;
              }
            }}
            className={`bg-white border border-gray-200 rounded p-2 flex items-center justify-between group hover:border-gray-300 shadow-sm ${draggedItem === index ? 'opacity-50 border-dashed' : ''}`}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={() => setDraggedItem(null)}
          >
            <div className="flex items-center gap-2">
              <span className="text-gray-400 cursor-move">
                <DragHandleIcon />
              </span>
              <span className="text-sm">{column.name}</span>
              {'formula' in column && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">Formula</span>
              )}
            </div>
            <button
              className="text-gray-400 hover:text-gray-600"
              onClick={() => removeColumn(column.id)}
            >
              <CrossIcon />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ColumnsSection; 