import { AccountData } from "./AccountData";
import { RecentReportType, ReportTypeTemplate } from "./ReportType";

export const reportTypes: ReportTypeTemplate[] = [
{
id: "tabular",
name: "Tabular",
description: "Simple list of records with optional grouping. Best for creating a straightforward list of records.",
icon: "/file.svg",
color: "#1E88E5" // Blue
},
{
id: "summary",
name: "Summary",
description: "Grouped report records with subtotals and grand totals. Perfect for analyzing data across different categories.",
icon: "/file.svg",
color: "#43A047" // Green
},
{
id: "matrix",
name: "Matrix",
description: "Show data in rows and columns with grand summaries. Ideal for comparing related data points in a grid layout.",
icon: "/file.svg",
color: "#E53935" // Red
},
{
id: "joined",
name: "Joined",
description: "Combine data from multiple related objects. Great for creating reports that span across different data entities.",
icon: "/file.svg",
color: "#FB8C00" // Orange
}
];

export const recentReportTypes: RecentReportType[] = [
{
name: "Demo With SS",
category: "Custom",
lastUsed: "2 days ago",
status: "Active",
description: "ashdasd",
type: "tabular",
createdBy: "You",
objects: [
{
name: "Account",
icon: "📊",
color: "#4299e1",
relatedObjects: []
},
{
name: "Contact",
icon: "👤",
color: "#805ad5",
relatedObjects: []
},
{
name: "Opportunity Contact Role",
icon: "🔗",
color: "#38a169",
relatedObjects: []
}
],
fieldsCount: 148
},
// Keep the other report types with updated structure
{
name: "Sales Performance Dashboard",
category: "Analytics",
lastUsed: "2 days ago",
status: "Active",
description: "Track sales metrics and team performance",
type: "tabular",
objects: [
{
name: "Opportunity",
icon: "💰",
color: "#3182ce"
}
],
fieldsCount: 56
},
];

export const reportTypeTemplates: ReportTypeTemplate[] = [
{
id: "tabular-report",
name: "Tabular Report",
description: "Simple list view of records with columns",
icon: "📋",
color: "#4299e1"
},
{
id: "summary-report",
name: "Summary Report",
description: "Grouped data with subtotals and grand totals",
icon: "📊",
color: "#38a169"
},
{
id: "matrix-report",
name: "Matrix Report",
description: "Data summarized in a grid format with row and column groupings",
icon: "🔢",
color: "#805ad5"
},
{
id: "joined-report",
name: "Joined Report",
description: "Multiple report blocks showing data from different objects",
icon: "🔗",
color: "#dd6b20"
}
];

// Sample Account fields with type indicators
export const accountFields = [
{ id: "account_owner", name: "Account Owner", category: "general", type: "user", icon: "A" },
{ id: "created_by", name: "Created By", category: "general", type: "user", icon: "A" },
{ id: "account_name", name: "Account Name", category: "general", type: "text", icon: "A" },
{ id: "account_number", name: "Account Number", category: "general", type: "number", icon: "#" },
{ id: "type", name: "Type", category: "general", type: "picklist", icon: "A" },
{ id: "industry", name: "Industry", category: "general", type: "picklist", icon: "A" },
{ id: "annual_revenue", name: "Annual Revenue", category: "general", type: "currency", icon: "#" },
{ id: "rating", name: "Rating", category: "general", type: "picklist", icon: "A" },
{ id: "phone", name: "Phone", category: "general", type: "phone", icon: "A" },
{ id: "billing_street", name: "Billing Street", category: "address", type: "text", icon: "A" },
{ id: "billing_city", name: "Billing City", category: "address", type: "text", icon: "A" },
{ id: "billing_state", name: "Billing State/Province", category: "address", type: "text", icon: "A" },
{ id: "billing_postal_code", name: "Billing Postal Code", category: "address", type: "text", icon: "A" },
{ id: "billing_country", name: "Billing Country", category: "address", type: "text", icon: "A" },
{ id: "shipping_street", name: "Shipping Street", category: "address", type: "text", icon: "A" },
{ id: "shipping_city", name: "Shipping City", category: "address", type: "text", icon: "A" },
{ id: "shipping_state", name: "Shipping State/Province", category: "address", type: "text", icon: "A" },
{ id: "shipping_postal_code", name: "Shipping Postal Code", category: "address", type: "text", icon: "A" },
{ id: "shipping_country", name: "Shipping Country", category: "address", type: "text", icon: "A" },
{ id: "website", name: "Website", category: "general", type: "url", icon: "A" },
{ id: "description", name: "Description", category: "general", type: "textarea", icon: "A" },
{ id: "employees", name: "Employees", category: "general", type: "number", icon: "#" },
{ id: "ownership", name: "Ownership", category: "general", type: "picklist", icon: "A" },
{ id: "parent_account", name: "Parent Account", category: "general", type: "lookup", icon: "A" },
{ id: "created_date", name: "Created Date", category: "system", type: "datetime", icon: "A" },
{ id: "last_modified_date", name: "Last Modified Date", category: "system", type: "datetime", icon: "A" },
{ id: "last_activity", name: "Last Activity", category: "system", type: "datetime", icon: "A" },
{ id: "sic_code", name: "SIC Code", category: "general", type: "text", icon: "A" },
{ id: "account_source", name: "Account Source", category: "general", type: "picklist", icon: "A" },
{ id: "customer_priority", name: "Customer Priority", category: "general", type: "picklist", icon: "A" },
{ id: "active", name: "Active", category: "general", type: "checkbox", icon: "A" },
{ id: "sla", name: "SLA", category: "general", type: "picklist", icon: "A" },
{ id: "sla_expiration_date", name: "SLA Expiration Date", category: "general", type: "date", icon: "A" },
{ id: "sla_serial_number", name: "SLA Serial Number", category: "general", type: "text", icon: "A" },
{ id: "number_of_locations", name: "Number of Locations", category: "general", type: "number", icon: "#" },
{ id: "upsell_opportunity", name: "Upsell Opportunity", category: "general", type: "picklist", icon: "A" },
{ id: "last_viewed_date", name: "Last Viewed Date", category: "system", type: "datetime", icon: "A" },
// Add formula fields
{ id: "profit_margin", name: "Profit Margin", category: "formula", type: "percent", icon: "#", isFormula: true, formula: "Annual_Revenue * 0.15" },
{ id: "full_address", name: "Full Address", category: "formula", type: "text", icon: "A", isFormula: true, formula: "Billing_Street & ', ' & Billing_City & ', ' & Billing_State" },
{ id: "total_revenue", name: "Total Revenue", category: "formula", type: "currency", icon: "#", isFormula: true, isSummaryFormula: true, formula: "SUM(Annual_Revenue)" },
{ id: "avg_deal_size", name: "Average Deal Size", category: "formula", type: "currency", icon: "#", isFormula: true, isSummaryFormula: true, formula: "AVG(Annual_Revenue)" }
];

export const sampleData: AccountData[] = [
{ id: 1, account_name: "Acme Corporation", account_owner: "John Smith", billing_state: "CA", type: "Customer", rating: "Hot", last_activity: "2023-05-15", annual_revenue: 5000000 },
{ id: 2, account_name: "Globex Industries", account_owner: "Sarah Johnson", billing_state: "NY", type: "Customer", rating: "Warm", last_activity: "2023-05-10", annual_revenue: 3200000 },
{ id: 3, account_name: "Initech", account_owner: "Michael Brown", billing_state: "TX", type: "Prospect", rating: "Cold", last_activity: "2023-04-28", annual_revenue: 1200000 },
{ id: 4, account_name: "Umbrella Corporation", account_owner: "Emily Davis", billing_state: "CA", type: "Customer", rating: "Hot", last_activity: "2023-05-18", annual_revenue: 7800000 },
{ id: 5, account_name: "Stark Industries", account_owner: "John Smith", billing_state: "NY", type: "Customer", rating: "Hot", last_activity: "2023-05-20", annual_revenue: 9500000 },
{ id: 6, account_name: "Wayne Enterprises", account_owner: "Sarah Johnson", billing_state: "NJ", type: "Customer", rating: "Warm", last_activity: "2023-05-05", annual_revenue: 4200000 },
{ id: 7, account_name: "Cyberdyne Systems", account_owner: "Michael Brown", billing_state: "CA", type: "Prospect", rating: "Cold", last_activity: "2023-04-15", annual_revenue: 800000 },
{ id: 8, account_name: "Oscorp", account_owner: "Emily Davis", billing_state: "NY", type: "Customer", rating: "Warm", last_activity: "2023-05-12", annual_revenue: 6100000 },
{ id: 9, account_name: "Soylent Corporation", account_owner: "John Smith", billing_state: "TX", type: "Customer", rating: "Hot", last_activity: "2023-05-22", annual_revenue: 8900000 },
{ id: 10, account_name: "Massive Dynamic", account_owner: "Sarah Johnson", billing_state: "CA", type: "Customer", rating: "Warm", last_activity: "2023-05-08", annual_revenue: 4500000 },
];

// Add more sample data for better grouping demonstration
export const moreSampleData: AccountData[] = [
{ id: 11, account_name: "Aperture Science", account_owner: "Michael Brown", billing_state: "CA", type: "Prospect", rating: "Cold", last_activity: "2023-04-20", annual_revenue: 1500000 },
{ id: 12, account_name: "Black Mesa", account_owner: "Emily Davis", billing_state: "NY", type: "Customer", rating: "Hot", last_activity: "2023-05-19", annual_revenue: 7200000 },
{ id: 13, account_name: "Vault-Tec", account_owner: "John Smith", billing_state: "TX", type: "Customer", rating: "Warm", last_activity: "2023-05-14", annual_revenue: 3800000 },
{ id: 14, account_name: "Abstergo Industries", account_owner: "Sarah Johnson", billing_state: "CA", type: "Customer", rating: "Hot", last_activity: "2023-05-21", annual_revenue: 8200000 },
{ id: 15, account_name: "Weyland-Yutani", account_owner: "Michael Brown", billing_state: "NY", type: "Prospect", rating: "Cold", last_activity: "2023-04-25", annual_revenue: 2000000 },
];

export const mockFieldList = [
{ id: "id", name: "Id", type: "id", label: "Record ID", category: "System Fields", isCustom: false },
{ id: "name", name: "Name", type: "text", label: "Name", category: "Standard Fields", isCustom: false },
{ id: "created_date", name: "CreatedDate", type: "datetime", label: "Created Date", category: "System Fields", isCustom: false },
{ id: "last_modified_date", name: "LastModifiedDate", type: "datetime", label: "Last Modified Date", category: "System Fields", isCustom: false },
{ id: "owner", name: "Owner", type: "reference", label: "Owner", category: "Standard Fields", isCustom: false },
{ id: "status", name: "Status", type: "picklist", label: "Status", category: "Standard Fields", isCustom: false },
{ id: "type", name: "Type", type: "picklist", label: "Type", category: "Standard Fields", isCustom: false },
{ id: "amount", name: "Amount", type: "currency", label: "Amount", category: "Standard Fields", isCustom: false },
{ id: "close_date", name: "CloseDate", type: "date", label: "Close Date", category: "Standard Fields", isCustom: false },
{ id: "stage", name: "Stage", type: "picklist", label: "Stage", category: "Standard Fields", isCustom: false },
{ id: "probability", name: "Probability", type: "percent", label: "Probability", category: "Standard Fields", isCustom: false },
{ id: "description", name: "Description", type: "textarea", label: "Description", category: "Standard Fields", isCustom: false },
{ id: "account_id", name: "AccountId", type: "reference", label: "Account ID", category: "Standard Fields", isCustom: false },
{ id: "contact_id", name: "ContactId", type: "reference", label: "Contact ID", category: "Standard Fields", isCustom: false },
{ id: "custom_field_1", name: "CustomField1__c", type: "text", label: "Custom Field 1", category: "Custom Fields", isCustom: true },
{ id: "custom_field_2", name: "CustomField2__c", type: "number", label: "Custom Field 2", category: "Custom Fields", isCustom: true },
{ id: "custom_field_3", name: "CustomField3__c", type: "checkbox", label: "Custom Field 3", category: "Custom Fields", isCustom: true },
{ id: "custom_field_4", name: "CustomField4__c", type: "date", label: "Custom Field 4", category: "Custom Fields", isCustom: true },
{ id: "custom_field_5", name: "CustomField5__c", type: "url", label: "Custom Field 5", category: "Custom Fields", isCustom: true },
{ id: "custom_field_6", name: "CustomField6__c", type: "email", label: "Custom Field 6", category: "Custom Fields", isCustom: true },
{ id: "custom_field_7", name: "CustomField7__c", type: "phone", label: "Custom Field 7", category: "Custom Fields", isCustom: true },
{ id: "custom_field_8", name: "CustomField8__c", type: "picklist", label: "Custom Field 8", category: "Custom Fields", isCustom: true },
{ id: "custom_field_9", name: "CustomField9__c", type: "multipicklist", label: "Custom Field 9", category: "Custom Fields", isCustom: true },
{ id: "custom_field_10", name: "CustomField10__c", type: "currency", label: "Custom Field 10", category: "Custom Fields", isCustom: true },
// Add more fields as needed for testing
]