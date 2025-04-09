import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FormulaSettingsProps {
  formulaName: string;
  setFormulaName: (value: string) => void;
  formulaDescription: string;
  setFormulaDescription: (value: string) => void;
  formulaOutputType: string;
  setFormulaOutputType: (value: string) => void;
  decimalPoints: string;
  setDecimalPoints: (value: string) => void;
}

const FormulaSettings: React.FC<FormulaSettingsProps> = ({
  formulaName,
  setFormulaName,
  formulaDescription,
  setFormulaDescription,
  formulaOutputType,
  setFormulaOutputType,
  decimalPoints,
  setDecimalPoints
}) => {
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="formula-name" className="flex items-center text-xs font-medium">
            Column Name
            <span className="text-red-500 ml-1">*</span>
          </Label>
          <Input
            id="formula-name"
            value={formulaName}
            onChange={(e) => setFormulaName(e.target.value)}
            placeholder="Enter a name for this column"
            className="mt-1 text-xs h-8"
          />
        </div>
        <div>
          <Label htmlFor="formula-description" className="text-xs font-medium">
            Description
          </Label>
          <Input
            id="formula-description"
            value={formulaDescription}
            onChange={(e) => setFormulaDescription(e.target.value)}
            placeholder="Optional description"
            className="mt-1 text-xs h-8"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="output-type" className="text-xs font-medium">
            Formula Output Type
          </Label>
          <Select
            value={formulaOutputType}
            onValueChange={setFormulaOutputType}
          >
            <SelectTrigger id="output-type" className="mt-1 h-8 text-xs">
              <SelectValue placeholder="Select output type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="number">Number</SelectItem>
              <SelectItem value="text">Text</SelectItem>
              <SelectItem value="currency">Currency</SelectItem>
              <SelectItem value="percent">Percent</SelectItem>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="datetime">Date/Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {(formulaOutputType === 'number' || formulaOutputType === 'currency' || formulaOutputType === 'percent') && (
          <div>
            <Label htmlFor="decimal-points" className="text-xs font-medium">
              Decimal Points
            </Label>
            <Select
              value={decimalPoints}
              onValueChange={setDecimalPoints}
            >
              <SelectTrigger id="decimal-points" className="mt-1 h-8 text-xs">
                <SelectValue placeholder="Select decimal points" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">0</SelectItem>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="4">4</SelectItem>
                <SelectItem value="5">5</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </>
  );
};

export default FormulaSettings; 