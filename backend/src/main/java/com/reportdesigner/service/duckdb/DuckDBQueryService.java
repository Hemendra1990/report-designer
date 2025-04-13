package com.reportdesigner.service.duckdb;

import java.util.List;
import java.util.Map;

/**
 * Service interface for executing queries against DuckDB.
 */
public interface DuckDBQueryService {

    /**
     * Execute a SQL query on DuckDB and return the results as a list of maps.
     *
     * @param sql The SQL query to execute
     * @return A list of maps where each map represents a row with column names as keys
     */
    List<Map<String, Object>> executeQuery(String sql);

    /**
     * Execute a SQL query on DuckDB and return the results as a list of maps with parameters.
     *
     * @param sql The SQL query to execute
     * @param params The parameters to bind to the query
     * @return A list of maps where each map represents a row with column names as keys
     */
    List<Map<String, Object>> executeQuery(String sql, Map<String, Object> params);

    /**
     * Execute an update query (INSERT, UPDATE, DELETE, CREATE, etc.) on DuckDB.
     *
     * @param sql The SQL query to execute
     * @return The number of rows affected
     */
    int executeUpdate(String sql);

    /**
     * Execute an update query with parameters.
     *
     * @param sql The SQL query to execute
     * @param params The parameters to bind to the query
     * @return The number of rows affected
     */
    int executeUpdate(String sql, Map<String, Object> params);

    /**
     * Execute a batch of update queries.
     *
     * @param sqlBatch A list of SQL queries to execute in batch
     * @return An array of row counts for each statement
     */
    int[] executeBatch(List<String> sqlBatch);
} 