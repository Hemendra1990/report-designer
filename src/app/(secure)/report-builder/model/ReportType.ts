export interface ReportTypeTemplate {
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    type: string; // The database table name to query
}


  // Update the RecentReportType interface to include additional fields
export interface RecentReportType {
    id?:string;
    name: string;
    category: string;
    lastUsed: string;
    status: "Active" | "Draft";
    description: string;
    createdBy?: string;
    objects?: Array<{
    name: string;
icon?: string;
color?: string;
relatedObjects?: Array<{
        name: string;
        icon: string;
        color: string;
        relation: string;
}>;
    }>;
    fieldsCount?: number;
}
