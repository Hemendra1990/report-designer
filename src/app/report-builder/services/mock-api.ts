import { faker } from '@faker-js/faker';
import { RecentReportType, ReportTypeTemplate } from '../model/ReportType';
import { ApiReportField, ApiReportType } from './api-types';

// Generate realistic looking IDs
export const generateId = () => faker.string.alphanumeric(16).toUpperCase();

// List of common database tables
const commonTables = [
  "Account", "Contact", "Lead", "Opportunity", "Campaign", 
  "Product", "Order", "Invoice", "Case", "Contract", 
  "Task", "Event", "User", "Team", "Project", 
  "Department", "Asset", "Document", "Notes", "Activity"
];

// Generate report type data
const generateReportTypes = (count: number): ApiReportType[] => {
  const reportTypes: ApiReportType[] = [];
  
  for (let i = 0; i < count; i++) {
    // Select 1-2 main tables
    const mainTableCount = faker.number.int({ min: 1, max: 2 });
    const shuffledTables = faker.helpers.shuffle([...commonTables]);
    const mainTables = shuffledTables.slice(0, mainTableCount);
    
    // Sometimes add related tables
    const relatedTables: string[] = [];
    if (faker.datatype.boolean()) {
      const relatedTableCount = faker.number.int({ min: 1, max: 2 });
      relatedTables.push(...shuffledTables.slice(mainTableCount, mainTableCount + relatedTableCount)
        .map(table => `${table} ${faker.helpers.arrayElement(['History', 'Relation', 'Detail', 'Family'])}`));
    }
    
    // Combine all tables
    const allTables = [...mainTables, ...relatedTables];
    
    // Generate a report name based on the main tables
    const mainTableName = mainTables[0];
    const namePrefix = faker.helpers.arrayElement([
      "Standard", "Custom", "Advanced", "Basic", "Enterprise"
    ]);
    const nameSuffix = faker.helpers.arrayElement([
      "Report", "Analytics", "Dashboard", "Summary", "Detail View"
    ]);
    
    const label = `${namePrefix} ${mainTableName} ${nameSuffix}`;
    const name = label.replace(/\s+/g, '_');
    
    reportTypes.push({
      id: generateId(),
      label,
      name,
      description: faker.lorem.sentence(),
      usedTables: allTables,
      fieldCount: faker.number.int({ min: 30, max: 200 })
    });
  }
  
  return reportTypes;
};

// Generate a set of report types
const REPORT_TYPES = generateReportTypes(10);

// Convert API report type to RecentReportType format
const mapToRecentReportType = (apiReportType: ApiReportType): RecentReportType => {
  const reportTypeCategories = ["Analytics", "Customer", "Custom", "Sales", "Marketing", "Operations"];
  const reportTypes = ["tabular", "summary", "matrix", "joined"] as const;
  const statusOptions = ["Active", "Draft"] as const;

  // Random last used date (1-30 days ago)
  const daysAgo = faker.number.int({ min: 1, max: 30 });
  const lastUsed = `${daysAgo} ${daysAgo === 1 ? 'day' : 'days'} ago`;

  // Random creator - sometimes it's the user, sometimes someone else
  const createdBy = faker.datatype.boolean(0.7) ? "You" : faker.person.fullName();

  return {
    name: apiReportType.label,
    category: faker.helpers.arrayElement(reportTypeCategories),
    lastUsed,
    status: faker.helpers.arrayElement(statusOptions),
    description: apiReportType.description,
    type: faker.helpers.arrayElement(reportTypes),
    createdBy,
    objects: apiReportType.usedTables.map((table: string) => {
      const colors = [
        "#4299e1", "#38a169", "#805ad5", "#dd6b20", 
        "#e53e3e", "#319795", "#d69e2e", "#3182ce"
      ];
      const icons = ["📊", "📈", "📋", "🔍", "📁", "👤", "💼", "🏢"];
      
      return {
        name: table,
        icon: faker.helpers.arrayElement(icons),
        color: faker.helpers.arrayElement(colors),
        relatedObjects: []
      };
    }),
    fieldsCount: apiReportType.fieldCount
  };
};

// Convert API report type to ReportTypeTemplate format
const mapToReportTypeTemplate = (apiReportType: ApiReportType): ReportTypeTemplate => {
  const reportTypes = ["tabular", "summary", "matrix", "joined"];
  
  return {
    id: apiReportType.id,
    name: apiReportType.label,
    description: apiReportType.description,
    icon: faker.helpers.arrayElement(["/file.svg", "/chart.svg", "/table.svg", "/dashboard.svg"]),
    color: faker.helpers.arrayElement([
      "#1E88E5", "#43A047", "#E53935", "#FB8C00", 
      "#4299e1", "#38a169", "#805ad5", "#dd6b20"
    ]),
    type: faker.helpers.arrayElement(reportTypes)
  };
};

// Common PostgreSQL column types
const columnTypes = [
  "varchar", "text", "int4", "int8", "bigserial", "bool", 
  "timestamptz(6)", "date", "numeric", "decimal", "float4", "float8"
];

// Field name prefixes by table
const fieldPrefixes: Record<string, string[]> = {
  'account': ['name', 'industry', 'revenue', 'employees', 'type', 'region', 'status'],
  'contact': ['first_name', 'last_name', 'email', 'phone', 'title', 'department', 'status'],
  'lead': ['source', 'status', 'rating', 'converted', 'interest', 'campaign', 'industry'],
  'opportunity': ['amount', 'stage', 'close_date', 'probability', 'type', 'source', 'forecast'],
  'campaign': ['name', 'budget', 'start_date', 'end_date', 'type', 'status', 'channel'],
  'product': ['name', 'code', 'price', 'cost', 'category', 'inventory', 'status'],
  'order': ['number', 'date', 'status', 'amount', 'shipping', 'discount', 'tax'],
  'invoice': ['number', 'date', 'due_date', 'amount', 'status', 'tax', 'discount'],
  'case': ['number', 'subject', 'priority', 'status', 'origin', 'reason', 'description'],
  'task': ['subject', 'due_date', 'status', 'priority', 'type', 'description', 'assignee']
};

// Common fields for most tables
const commonFields = [
  {name: 'id', displayName: 'Id', type: 'varchar'},
  {name: 'created_by', displayName: 'Created By', type: 'varchar'},
  {name: 'created_on', displayName: 'Created On', type: 'timestamptz(6)'},
  {name: 'updated_by', displayName: 'Updated By', type: 'varchar'},
  {name: 'updated_on', displayName: 'Updated On', type: 'timestamptz(6)'},
  {name: 'is_active', displayName: 'Is Active', type: 'bool'},
  {name: 'is_deleted', displayName: 'Is Deleted', type: 'bool'},
  {name: 'organisation_id', displayName: 'Organisation', type: 'varchar'},
  {name: 'owner', displayName: 'Owner', type: 'varchar'}
];

// Generate fields for a report type
const generateReportTypeFields = (reportTypeId: string): ApiReportField[] => {
  // Find the report type
  const reportType = REPORT_TYPES.find(rt => rt.id === reportTypeId || rt.name === reportTypeId);
  const tables = reportType?.usedTables || ['contact', 'contact_family__c'];
  
  // Generate fields for each table
  const allFields: ApiReportField[] = [];
  
  tables.forEach((tableFullName: string) => {
    // Extract base table name (lowercase, without suffixes like "History")
    const baseTableName = tableFullName.split(' ')[0].toLowerCase();
    const tableNameForDisplay = tableFullName.includes('__c') 
      ? tableFullName.replace('__c', '') 
      : tableFullName;
    const tableName = tableNameForDisplay.toLowerCase();
    const tableId = generateId();
    
    // Add common fields first
    commonFields.forEach(commonField => {
      allFields.push({
        id: generateId(),
        columnName: commonField.name,
        columnDisplayName: commonField.displayName,
        columnType: commonField.type,
        tableName,
        tableId,
        active: true
      });
    });
    
    // Get prefixes for this table type or use generic ones
    const fieldPrefix = fieldPrefixes[baseTableName] || 
      ['name', 'type', 'status', 'description', 'category', 'code', 'value'];
    
    // Add table-specific fields
    const fieldCount = faker.number.int({ min: 10, max: 20 });
    for (let i = 0; i < fieldCount; i++) {
      const prefix = faker.helpers.arrayElement(fieldPrefix);
      const suffix = faker.datatype.boolean(0.3) ? `_${faker.lorem.word()}` : '';
      const customSuffix = faker.datatype.boolean(0.2) ? '__c' : '';
      
      const columnName = `${prefix}${suffix}${customSuffix}`;
      const words = columnName.replace('_', ' ').split(' ');
      const columnDisplayName = words
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
        .replace('__c', '');
      
      allFields.push({
        id: generateId(),
        columnName,
        columnDisplayName,
        columnType: faker.helpers.arrayElement(columnTypes),
        tableName,
        tableId,
        active: true
      });
    }
  });
  
  return allFields;
};

// Map of API endpoints to handlers
const API_HANDLERS: Record<string, (params?: any) => any> = {
  // Get all report types
  '/report-types': () => {
    return REPORT_TYPES.map(mapToRecentReportType);
  },
  
  // Get a report type by ID
  '/report-types/:id': (params: { id: string }) => {
    const reportType = REPORT_TYPES.find(rt => rt.id === params.id);
    return reportType ? mapToReportTypeTemplate(reportType) : null;
  },
  
  // Get fields for a report type
  '/report-types/:id/fields': (params: { id: string }) => {
    return generateReportTypeFields(params.id);
  }
};

// Helper to extract params from endpoint path
const extractParams = (endpoint: string, pattern: string): Record<string, string> => {
  const params: Record<string, string> = {};
  
  const endpointParts = endpoint.split('/');
  const patternParts = pattern.split('/');
  
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(':')) {
      const paramName = patternParts[i].substring(1);
      params[paramName] = endpointParts[i];
    }
  }
  
  return params;
};

// This function handles mock API requests
export const handleMockRequest = (
  endpoint: string, 
  method: 'GET' | 'POST' | 'PUT' | 'DELETE', 
  data?: any
) => {
  console.log(`[MOCK API] ${method} ${endpoint}`, data);
  
  // Parse the endpoint to extract any parameters
  let handler: ((params?: any) => any) | undefined;
  let params: Record<string, string> = {};

  // First, check for exact endpoint match
  if (API_HANDLERS[endpoint]) {
    handler = API_HANDLERS[endpoint];
  } 
  // Otherwise, try to match patterns with parameters
  else {
    const endpointParts = endpoint.split('/');
    
    for (const pattern of Object.keys(API_HANDLERS)) {
      const patternParts = pattern.split('/');
      
      // If pattern length doesn't match, skip
      if (patternParts.length !== endpointParts.length) continue;
      
      let isMatch = true;
      
      for (let i = 0; i < patternParts.length; i++) {
        // If this part is a parameter (starts with :), it matches anything
        if (patternParts[i].startsWith(':')) continue;
        
        // Otherwise, it must match exactly
        if (patternParts[i] !== endpointParts[i]) {
          isMatch = false;
          break;
        }
      }
      
      if (isMatch) {
        handler = API_HANDLERS[pattern];
        params = extractParams(endpoint, pattern);
        break;
      }
    }
  }
  
  if (!handler) {
    throw new Error(`Endpoint not found: ${endpoint}`);
  }
  
  // Combine params and data
  const handlerParams = {
    ...params,
    ...data
  };
  
  // Call the handler with parameters
  return handler(handlerParams);
}; 