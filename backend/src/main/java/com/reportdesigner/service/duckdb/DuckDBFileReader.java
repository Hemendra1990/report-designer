package com.reportdesigner.service.duckdb;

import java.util.List;
import java.util.Map;

/**
 * Service interface for reading various file formats using DuckDB.
 */
public interface DuckDBFileReader {

    /**
     * Read a CSV file and return the results as a list of maps.
     *
     * @param filePath Path to the CSV file (local or remote)
     * @param options Optional map of CSV read options (delimiter, header, etc.)
     * @return A list of maps where each map represents a row with column names as keys
     */
    List<Map<String, Object>> readCsvFile(String filePath, Map<String, Object> options);

    /**
     * Read a Parquet file and return the results as a list of maps.
     *
     * @param filePath Path to the Parquet file (local or remote)
     * @return A list of maps where each map represents a row with column names as keys
     */
    List<Map<String, Object>> readParquetFile(String filePath);

    /**
     * Read a JSON file and return the results as a list of maps.
     *
     * @param filePath Path to the JSON file (local or remote)
     * @return A list of maps where each map represents a row with column names as keys
     */
    List<Map<String, Object>> readJsonFile(String filePath);

    /**
     * Execute a SQL query on top of a file.
     *
     * @param filePath Path to the file (local or remote)
     * @param fileType Type of file (csv, parquet, json)
     * @param sql SQL query to execute on the file
     * @param options Optional map of file read options
     * @return A list of maps where each map represents a row with column names as keys
     */
    List<Map<String, Object>> queryFile(String filePath, String fileType, String sql, Map<String, Object> options);
} 