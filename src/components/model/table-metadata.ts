
  export interface iColumnMetaData {
    id: string;
    columnName: string;
    headerName: string;
    dataType: string;
    returnType: string;
    formulaExpression: string;
    constraints: string;
    defaultValue: string;
    staticOptions: string;
    referenceAPI: string;
    controlType: string;
    selectedConstraints: string[];
    staticOption: boolean;
    standardColumn: boolean;
    fieldWidth: string;
    isFormula: boolean;
    fractionalLength: number;
    supportedType: string;
    fileSize: number | null;
    isFormulaValid: boolean;
    dropdownOptionsOrderBy?: string;
    helpText: string;
    valueLength?: number;
  }
  
  export interface RelationshipMetaData {
    id: string;
    type: string;
    referenceTable: string;
    sourceColumn: string;
    referenceColumn: string;
  }
  
  export interface iTableMetaData {
    id: string;
    tableName: string;
    displayName: string;
    namePattern: string;
    icon: string;
    listDisplayName: string;
    standardTable: boolean;
    columns: iColumnMetaData[];
    relationships: RelationshipMetaData[];
  }