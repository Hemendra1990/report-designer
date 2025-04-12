package com.reportdesigner.service.duckdb.impl;

import com.reportdesigner.service.duckdb.DuckDBFileReader;
import com.reportdesigner.service.duckdb.DuckDBQueryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Implementation of the DuckDBFileReader for reading files using DuckDB.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DuckDBFileReaderImpl implements DuckDBFileReader {

    private final DuckDBQueryService queryService;

    @Override
    public List<Map<String, Object>> readCsvFile(String filePath, Map<String, Object> options) {
        try {
            // Construct options string
            String optionsStr = "";
            if (options != null && !options.isEmpty()) {
                optionsStr = options.entrySet().stream()
                    .map(e -> e.getKey() + "=" + formatOptionValue(e.getValue()))
                    .collect(Collectors.joining(", ", "(", ")"));
            }
            
            // Create a temporary view for the CSV file
            String viewName = "temp_csv_view_" + System.currentTimeMillis();
            String createViewSql = String.format(
                "CREATE OR REPLACE VIEW %s AS SELECT * FROM read_csv_auto('%s'%s)",
                viewName, filePath, optionsStr.equals("()") ? "" : optionsStr
            );
            
            queryService.executeUpdate(createViewSql);
            
            // Query the view
            List<Map<String, Object>> result = queryService.executeQuery("SELECT * FROM " + viewName);
            
            // Clean up
            queryService.executeUpdate("DROP VIEW IF EXISTS " + viewName);
            
            return result;
        } catch (Exception e) {
            log.error("Error reading CSV file: {}", filePath, e);
            throw new RuntimeException("Error reading CSV file: " + filePath, e);
        }
    }

    @Override
    public List<Map<String, Object>> readParquetFile(String filePath) {
        try {
            // Create a temporary view for the Parquet file
            String viewName = "temp_parquet_view_" + System.currentTimeMillis();
            String createViewSql = String.format(
                "CREATE OR REPLACE VIEW %s AS SELECT * FROM read_parquet('%s')",
                viewName, filePath
            );
            
            queryService.executeUpdate(createViewSql);
            
            // Query the view
            List<Map<String, Object>> result = queryService.executeQuery("SELECT * FROM " + viewName);
            
            // Clean up
            queryService.executeUpdate("DROP VIEW IF EXISTS " + viewName);
            
            return result;
        } catch (Exception e) {
            log.error("Error reading Parquet file: {}", filePath, e);
            throw new RuntimeException("Error reading Parquet file: " + filePath, e);
        }
    }

    @Override
    public List<Map<String, Object>> readJsonFile(String filePath) {
        try {
            // Create a temporary view for the JSON file
            String viewName = "temp_json_view_" + System.currentTimeMillis();
            String createViewSql = String.format(
                "CREATE OR REPLACE VIEW %s AS SELECT * FROM read_json_auto('%s')",
                viewName, filePath
            );
            
            queryService.executeUpdate(createViewSql);
            
            // Query the view
            List<Map<String, Object>> result = queryService.executeQuery("SELECT * FROM " + viewName);
            
            // Clean up
            queryService.executeUpdate("DROP VIEW IF EXISTS " + viewName);
            
            return result;
        } catch (Exception e) {
            log.error("Error reading JSON file: {}", filePath, e);
            throw new RuntimeException("Error reading JSON file: " + filePath, e);
        }
    }

    @Override
    public List<Map<String, Object>> queryFile(String filePath, String fileType, String sql, Map<String, Object> options) {
        if (options == null) {
            options = new HashMap<>();
        }
        
        try {
            // Create a temporary view based on file type
            String viewName = "temp_file_view_" + System.currentTimeMillis();
            String createViewSql;
            
            switch (fileType.toLowerCase()) {
                case "csv":
                    String optionsStr = options.entrySet().stream()
                        .map(e -> e.getKey() + "=" + formatOptionValue(e.getValue()))
                        .collect(Collectors.joining(", ", "(", ")"));
                    
                    createViewSql = String.format(
                        "CREATE OR REPLACE VIEW %s AS SELECT * FROM read_csv_auto('%s'%s)",
                        viewName, filePath, optionsStr.equals("()") ? "" : optionsStr
                    );
                    break;
                    
                case "parquet":
                    createViewSql = String.format(
                        "CREATE OR REPLACE VIEW %s AS SELECT * FROM read_parquet('%s')",
                        viewName, filePath
                    );
                    break;
                    
                case "json":
                    createViewSql = String.format(
                        "CREATE OR REPLACE VIEW %s AS SELECT * FROM read_json_auto('%s')",
                        viewName, filePath
                    );
                    break;
                    
                default:
                    throw new IllegalArgumentException("Unsupported file type: " + fileType);
            }
            
            queryService.executeUpdate(createViewSql);
            
            // Replace table name in SQL if needed
            String finalSql = sql;
            if (!sql.toLowerCase().contains("from " + viewName.toLowerCase())) {
                // If the SQL doesn't reference our view, we replace "FROM tableName" with "FROM viewName"
                // This is a simple replacement; it assumes the SQL contains FROM clause
                finalSql = sql.replaceFirst("(?i)FROM\\s+[\\w.]+", "FROM " + viewName);
            }
            
            // Execute the query
            List<Map<String, Object>> result = queryService.executeQuery(finalSql);
            
            // Clean up
            queryService.executeUpdate("DROP VIEW IF EXISTS " + viewName);
            
            return result;
        } catch (Exception e) {
            log.error("Error querying file: {}, type: {}", filePath, fileType, e);
            throw new RuntimeException("Error querying file: " + filePath, e);
        }
    }
    
    /**
     * Format option values for SQL statements.
     */
    private String formatOptionValue(Object value) {
        if (value == null) {
            return "NULL";
        } else if (value instanceof String) {
            return "'" + ((String) value).replace("'", "''") + "'";
        } else if (value instanceof Boolean) {
            return value.toString();
        } else if (value instanceof Number) {
            return value.toString();
        } else {
            return "'" + value.toString().replace("'", "''") + "'";
        }
    }
} 