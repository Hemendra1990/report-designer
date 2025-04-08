import React from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AccountIcon, NavigationIcon } from "@/components/icons/ReportIcons";
import { PrintIcon } from "@/components/icons";

interface TopHeaderBarProps {
  reportName?: string;
  reportType?: string;
  showShortcuts: boolean;
  onToggleShortcuts: () => void;
  onRun?: () => void;
  onSave?: () => void;
  onClose?: () => void;
}

const TopHeaderBar: React.FC<TopHeaderBarProps> = ({
  reportName = "New Accounts Report",
  reportType = "Accounts",
  showShortcuts,
  onToggleShortcuts,
  onRun,
  onSave,
  onClose,
}) => {
  return (
    <header className="bg-white border-b border-gray-200 py-3 px-4 flex justify-between items-center">
      <div className="flex items-center gap-4">
        <div className="flex flex-col">
          <div className="text-xs text-gray-500 uppercase font-semibold">REPORT</div>
          <div className="text-lg font-semibold">{reportName}</div>
        </div>
        <div className="bg-white text-gray-700 px-3 py-1 rounded-full text-sm border border-gray-300 flex items-center gap-1">
          <AccountIcon size={14} />
          <span>{reportType}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Shortcut toggle control */}
        <div className="flex items-center gap-2 mr-4">
          <span className="text-xs text-gray-500">Panel Shortcuts</span>
          <div className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={showShortcuts}
              onChange={onToggleShortcuts}
            />
            <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
          </div>
        </div>
        
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <NavigationIcon size={16} />
        </Button>
        <Button variant="outline" size="sm" className="text-gray-400 bg-gray-100">
          <PrintIcon size={16} />
        </Button>
        <Select defaultValue="save">
          <SelectTrigger className="w-[130px] h-9 bg-sky-50 text-blue-600 border-blue-100">
            <SelectValue placeholder="Save" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="save">Save</SelectItem>
            <SelectItem value="save_as">Save As</SelectItem>
            <SelectItem value="save_copy">Save Copy</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
        <Button size="sm" className="bg-blue-600" onClick={onRun}>Run</Button>
      </div>
    </header>
  );
};

export default TopHeaderBar; 