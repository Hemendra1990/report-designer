import React, { RefObject, MutableRefObject, KeyboardEvent, useEffect } from 'react';
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
  isFormula?: boolean;
  isSummaryFormula?: boolean;
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
  editFormulaColumn: (column: Column) => void;
  handleDragStart: (index: number) => void;
  handleDragOver: (e: React.DragEvent, index: number) => void;
  removeColumn: (id: string) => void;
  setIsMenuOpen: (isOpen: boolean) => void;
  setSelectedColumns: (columns: Column[]) => void;
  setDraggedItem: (item: number | null) => void;
  addSummaryFormulaColumn?: () => void;
  editSummaryFormulaColumn?: (column: Column) => void;
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
  editFormulaColumn,
  handleDragStart,
  handleDragOver,
  removeColumn,
  setIsMenuOpen,
  setSelectedColumns,
  setDraggedItem,
  addSummaryFormulaColumn,
  editSummaryFormulaColumn
}) => {
  // Handle keyboard navigation in dropdown menu
  const handleKeyDown = (e: KeyboardEvent<HTMLElement>, actionFn?: () => void) => {
    if (e.key === 'Escape') {
      setIsMenuOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextFocusable = (e.target as HTMLElement).nextElementSibling as HTMLElement;
      if (nextFocusable && nextFocusable.tagName !== 'DIV') {
        nextFocusable.focus();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevFocusable = (e.target as HTMLElement).previousElementSibling as HTMLElement;
      if (prevFocusable && prevFocusable.tagName !== 'DIV') {
        prevFocusable.focus();
      }
    } else if ((e.key === 'Enter' || e.key === ' ') && actionFn) {
      e.preventDefault();
      actionFn();
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    if (!isMenuOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen, menuRef, setIsMenuOpen]);

  // Update function to handle formula column click
  const handleFormulaColumnClick = (column: Column, e: React.MouseEvent) => {
    if ('formula' in column && column.formula) {
      e.stopPropagation(); // Prevent triggering drag or other events
      
      // Use the appropriate edit function based on formula type
      if (column.isSummaryFormula && editSummaryFormulaColumn) {
        editSummaryFormulaColumn(column);
      } else {
        editFormulaColumn(column);
      }
    }
  };

  return (
    <div className="p-3 flex-1">
      <div className="flex justify-between items-center mb-2">
        <div className="text-xs font-semibold text-gray-500">COLUMNS</div>
        <div className="relative">
          <button
            className="text-xs text-blue-600 flex items-center"
            onClick={openColumnMenu}
            aria-haspopup="true"
            aria-expanded={isMenuOpen}
          >
            <PlusIcon className="mr-0.5 size-3.5" />
            Add Column
            <ChevronDownIcon className="ml-0.5 size-3.5" />
          </button>

          {/* Column Menu Dropdown */}
          {isMenuOpen && (
            <div
              ref={menuRef}
              className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-xl z-50 w-44 max-w-[calc(100vw-1rem)] text-xs"
              role="menu"
              aria-orientation="vertical"
              tabIndex={-1}
              onKeyDown={(e) => handleKeyDown(e)}
              style={{
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12), 0 0 1px rgba(0, 0, 0, 0.05)'
              }}
            >
              <div className="py-0.5">
                <button
                  className="px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none w-full text-left flex items-center gap-1.5 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                  role="menuitem"
                  tabIndex={0}
                  onKeyDown={(e) => handleKeyDown(e, () => setIsMenuOpen(false))}
                >
                  <BucketIcon className="size-3.5" />
                  <span>Add Bucket Column</span>
                </button>
                <button
                  className="px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none w-full text-left flex items-center gap-1.5 transition-colors"
                  onClick={() => {
                    if (addSummaryFormulaColumn) {
                      addSummaryFormulaColumn();
                      setIsMenuOpen(false);
                    }
                  }}
                  role="menuitem"
                  tabIndex={0}
                  onKeyDown={(e) => handleKeyDown(e, () => {
                    if (addSummaryFormulaColumn) {
                      addSummaryFormulaColumn();
                      setIsMenuOpen(false);
                    }
                  })}
                  disabled={!addSummaryFormulaColumn}
                >
                  <FormulaIcon className="size-3.5 text-purple-600" />
                  <span>Add Summary Formula</span>
                </button>
                <button
                  className="px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none w-full text-left flex items-center gap-1.5 transition-colors"
                  onClick={() => {
                    addFormulaColumn();
                    setIsMenuOpen(false);
                  }}
                  role="menuitem"
                  tabIndex={0}
                  onKeyDown={(e) => handleKeyDown(e, () => {
                    addFormulaColumn();
                    setIsMenuOpen(false);
                  })}
                >
                  <FormulaIcon className="size-3.5 text-blue-600" />
                  <span>Add Row-Level Formula</span>
                </button>
                <div className="border-t border-gray-200 my-0.5" role="separator"></div>
                <button
                  className="px-3 py-1.5 text-xs text-red-600 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none w-full text-left flex items-center gap-1.5 transition-colors"
                  onClick={() => {
                    setSelectedColumns([]);
                    setIsMenuOpen(false);
                  }}
                  role="menuitem"
                  tabIndex={0}
                  onKeyDown={(e) => 
                    handleKeyDown(e, () => {
                      setSelectedColumns([]);
                      setIsMenuOpen(false);
                    })
                  }
                >
                  <TrashIcon className="size-3.5" />
                  <span>Remove All Columns</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        {selectedColumns.map((column, index) => (
          <div
            key={column.id}
            ref={(el) => {
              if (columnRefs.current) {
                columnRefs.current[index] = el;
              }
            }}
            className={`bg-white border border-gray-200 rounded px-2 py-1.5 flex items-center justify-between group hover:border-gray-300 shadow-sm ${draggedItem === index ? 'opacity-50 border-dashed' : ''}`}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={() => setDraggedItem(null)}
          >
            <div className="flex items-center gap-1.5">
              <span className="text-gray-400 cursor-move">
                <DragHandleIcon className="size-3.5" />
              </span>
              <span className="text-xs">{column.name}</span>
              {column.isFormula && (
                <span 
                  className={`ml-0.5 px-1.5 py-0.5 text-[10px] rounded cursor-pointer ${
                    column.isSummaryFormula 
                      ? 'bg-purple-100 text-purple-800 hover:bg-purple-200' 
                      : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                  }`}
                  onClick={(e) => handleFormulaColumnClick(column, e)}
                >
                  {column.isSummaryFormula ? 'Summary' : 'Formula'}
                </span>
              )}
            </div>
            <button
              className="text-gray-400 hover:text-gray-600 focus:text-gray-600 focus:outline-none"
              onClick={() => removeColumn(column.id)}
              aria-label={`Remove ${column.name} column`}
            >
              <CrossIcon className="size-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ColumnsSection; 