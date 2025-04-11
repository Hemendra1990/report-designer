package com.reportdesigner.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TableInfo {
    private String schema;
    private String tableName;
    private List<ColumnInfo> columns;
} 