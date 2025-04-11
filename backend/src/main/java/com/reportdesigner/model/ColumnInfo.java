package com.reportdesigner.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ColumnInfo {
    private String name;
    private String dataType;
    private boolean nullable;
    private boolean primaryKey;
    private boolean foreignKey;
    private String referencedTable;
    private String referencedColumn;
} 