package com.reportdesigner.controller;

import com.reportdesigner.dto.PostgresConnectRequest;
import com.reportdesigner.dto.QueryRequest;
import com.reportdesigner.service.duckdb.impl.DuckDBPostgresConnectorImpl;
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

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@Slf4j
public class DuckDBQueryExecutionController {
    private final DuckDBPostgresConnectorImpl postgresConnector;

    /**
     * Execute a raw SQL query using DuckDB.
     *
     * @param request Object containing the SQL query
     * @return Results of the query
     */
    @PostMapping("/query")
    public ResponseEntity<List<Map<String, Object>>> executeQuery(@RequestBody QueryRequest request) {
        try {
            List<Map<String, Object>> results = postgresConnector.executeQuery(request.getSql());
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            log.error("Error executing DuckDB query", e);
            throw new RuntimeException("Error executing DuckDB query: " + e.getMessage(), e);
        }
    }

    /**
     * Connect to a PostgreSQL database via DuckDB.
     *
     * @param request Object containing PostgreSQL connection details
     * @return Status of the connection attempt
     */
    @PostMapping("/pg/connect")
    public ResponseEntity<Map<String, Object>> connectToPostgres(@RequestBody PostgresConnectRequest request) {//TODO: Get the schema name from the user authentication
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

}
