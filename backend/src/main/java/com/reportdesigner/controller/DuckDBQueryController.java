package com.reportdesigner.controller;

import com.reportdesigner.dto.*;
import com.reportdesigner.service.duckdb.DuckDBFileReader;
import com.reportdesigner.service.duckdb.DuckDBPostgresConnector;
import com.reportdesigner.service.duckdb.DuckDBQueryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST controller for DuckDB query operations.
 */
@Slf4j
@RestController
@RequestMapping("/api/duckdb")
@RequiredArgsConstructor
@Deprecated(forRemoval = true)
public class DuckDBQueryController {

    private final DuckDBQueryService queryService;
    private final DuckDBFileReader fileReader;
    private final DuckDBPostgresConnector postgresConnector;

    /**
     * Execute a raw SQL query using DuckDB.
     *
     * @param request Object containing the SQL query
     * @return Results of the query
     */
    @PostMapping("/query")
    public ResponseEntity<List<Map<String, Object>>> executeQuery(@RequestBody QueryRequest request) {
        try {
            List<Map<String, Object>> results = queryService.executeQuery(request.getSql());
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            log.error("Error executing DuckDB query", e);
            throw new RuntimeException("Error executing DuckDB query: " + e.getMessage(), e);
        }
    }

    /**
     * Execute a SQL query on a file.
     *
     * @param request Object containing file information and SQL query
     * @return Results of the query
     */
    @PostMapping("/query/file")
    public ResponseEntity<List<Map<String, Object>>> queryFile(@RequestBody FileQueryRequest request) {
        try {
            List<Map<String, Object>> results = fileReader.queryFile(
                    request.getFilePath(),
                    request.getFileType(),
                    request.getSql(),
                    request.getOptions()
            );
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            log.error("Error querying file with DuckDB", e);
            throw new RuntimeException("Error querying file with DuckDB: " + e.getMessage(), e);
        }
    }

    /**
     * Read a CSV file using DuckDB.
     *
     * @param request Object containing the file path and options
     * @return Contents of the CSV file
     */
    @PostMapping("/file/csv")
    public ResponseEntity<List<Map<String, Object>>> readCsvFile(@RequestBody FileReadRequest request) {
        try {
            List<Map<String, Object>> results = fileReader.readCsvFile(
                    request.getFilePath(),
                    request.getOptions()
            );
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            log.error("Error reading CSV file with DuckDB", e);
            throw new RuntimeException("Error reading CSV file with DuckDB: " + e.getMessage(), e);
        }
    }

    /**
     * Read a Parquet file using DuckDB.
     *
     * @param request Object containing the file path
     * @return Contents of the Parquet file
     */
    @PostMapping("/file/parquet")
    public ResponseEntity<List<Map<String, Object>>> readParquetFile(@RequestBody FileReadRequest request) {
        try {
            List<Map<String, Object>> results = fileReader.readParquetFile(request.getFilePath());
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            log.error("Error reading Parquet file with DuckDB", e);
            throw new RuntimeException("Error reading Parquet file with DuckDB: " + e.getMessage(), e);
        }
    }

    /**
     * Read a JSON file using DuckDB.
     *
     * @param request Object containing the file path
     * @return Contents of the JSON file
     */
    @PostMapping("/file/json")
    public ResponseEntity<List<Map<String, Object>>> readJsonFile(@RequestBody FileReadRequest request) {
        try {
            List<Map<String, Object>> results = fileReader.readJsonFile(request.getFilePath());
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            log.error("Error reading JSON file with DuckDB", e);
            throw new RuntimeException("Error reading JSON file with DuckDB: " + e.getMessage(), e);
        }
    }

    /**
     * Connect to a PostgreSQL database via DuckDB.
     *
     * @param request Object containing PostgreSQL connection details
     * @return Status of the connection attempt
     */
    @PostMapping("/postgres/connect")
    public ResponseEntity<Map<String, Object>> connectToPostgres(@RequestBody PostgresConnectRequest request) {
        try {
            boolean connected = postgresConnector.connectToPostgres(
                    request.getHost(),
                    request.getPort(),
                    request.getDatabase(),
                    request.getUsername(),
                    request.getPassword(),
                    request.getSchema() != null ? request.getSchema() : "public"
            );

            Map<String, Object> response = new HashMap<>();
            response.put("connected", connected);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error connecting to PostgreSQL via DuckDB", e);
            throw new RuntimeException("Error connecting to PostgreSQL via DuckDB: " + e.getMessage(), e);
        }
    }

    /**
     * Execute a SQL query on a connected PostgreSQL database via DuckDB.
     *
     * @param request Object containing the SQL query
     * @return Results of the query
     */
    @PostMapping("/postgres/query")
    public ResponseEntity<List<Map<String, Object>>> queryPostgres(@RequestBody QueryRequest request) {
        try {
            List<Map<String, Object>> results = postgresConnector.executeQuery(request.getSql());
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            log.error("Error querying PostgreSQL via DuckDB", e);
            throw new RuntimeException("Error querying PostgreSQL via DuckDB: " + e.getMessage(), e);
        }
    }

    /**
     * Attach a PostgreSQL table to DuckDB.
     *
     * @param request Object containing the table details
     * @return Status of the attach operation
     */
    @PostMapping("/postgres/attach")
    public ResponseEntity<Map<String, Object>> attachPostgresTable(@RequestBody PostgresTableAttachRequest request) {
        try {
            boolean attached = postgresConnector.attachPostgresTable(
                    request.getPostgresTable(),
                    request.getDuckDbTableName()
            );

            Map<String, Object> response = new HashMap<>();
            response.put("attached", attached);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error attaching PostgreSQL table via DuckDB", e);
            throw new RuntimeException("Error attaching PostgreSQL table via DuckDB: " + e.getMessage(), e);
        }
    }
} 