package com.reportdesigner.service;

import com.reportdesigner.model.TableInfo;
import com.reportdesigner.model.ColumnInfo;
import java.util.List;

public interface DatabaseMetadataService {
    List<TableInfo> getAllTables();
    List<ColumnInfo> getTableColumns(String schema, String tableName);
    List<TableInfo> searchTables(String query, String schema);
    List<TableInfo> getRelatedTables(String schema, String tableName);
} 