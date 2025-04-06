import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface ReportType {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

interface ReportTypeFormProps {
  reportType: ReportType | null;
  onSubmit: (data: Omit<ReportType, "id">) => void;
  onCancel: () => void;
}

export function ReportTypeForm({ reportType, onSubmit, onCancel }: ReportTypeFormProps) {
  const [formData, setFormData] = useState<Omit<ReportType, "id">>({
    name: "",
    description: "",
    icon: "/file.svg",
    color: "#1E88E5"
  });

  useEffect(() => {
    if (reportType) {
      const { id, ...rest } = reportType;
      setFormData(rest);
    }
  }, [reportType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{reportType ? "Edit Report Type" : "Create Report Type"}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter report type name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter report type description"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="color">Color</Label>
            <div className="flex items-center gap-2">
              <Input
                id="color"
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-20 h-10 p-1"
              />
              <Input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                placeholder="#000000"
                className="flex-1"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {reportType ? "Update" : "Create"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
} 