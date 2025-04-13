package com.reportdesigner.service.duckdb;

import java.util.List;
import java.util.Map;

/**
 * Service interface for connecting to PostgreSQL via DuckDB.
 */
public interface DuckDBPostgresConnector {

    /**
     * Connect to a PostgreSQL database using DuckDB postgres_scanner.
     *
     * @param host PostgreSQL host
     * @param port PostgreSQL port
     * @param database PostgreSQL database name
     * @param username PostgreSQL username
     * @param password PostgreSQL password
     * @return True if connection is successful
     */
    boolean connectToPostgres(String host, int port, String database, String username, String password);
    
    /**
     * Connect to a PostgreSQL database using DuckDB postgres_scanner with schema specification.
     *
     * @param host PostgreSQL host
     * @param port PostgreSQL port
     * @param database PostgreSQL database name
     * @param username PostgreSQL username
     * @param password PostgreSQL password
     * @param schema PostgreSQL schema name (default is 'public')
     * @return True if connection is successful
     */
    boolean connectToPostgres(String host, int port, String database, String username, String password, String schema);

    /**
     * Connect to a PostgreSQL database using connection string.
     *
     * @param connectionString PostgreSQL connection string
     * @return True if connection is successful
     */
    boolean connectToPostgres(String connectionString);
    
    /**
     * Connect to a PostgreSQL database using connection string with schema specification.
     *
     * @param connectionString PostgreSQL connection string
     * @param schema PostgreSQL schema name (default is 'public')
     * @return True if connection is successful
     */
    boolean connectToPostgres(String connectionString, String schema);

    /**
     * Execute a SQL query on the connected PostgreSQL database via DuckDB.
     *
     * @param sql SQL query to execute
     * @return A list of maps where each map represents a row with column names as keys
     */
    List<Map<String, Object>> executeQuery(String sql);

    /**
     * Attach a PostgreSQL table to DuckDB for querying.
     *
     * @param postgresTable The PostgreSQL table name to attach
     * @param duckDbTableName The DuckDB table name to use (if null, uses the same name)
     * @return True if table was attached successfully
     */
    boolean attachPostgresTable(String postgresTable, String duckDbTableName);

    /**
     * Attach all tables from a PostgreSQL schema to DuckDB.
     *
     * @param schema PostgreSQL schema to attach (default is 'public')
     * @return True if all tables were attached successfully
     */
    boolean attachPostgresSchema(String schema);

    /**
     * Close the PostgreSQL connection.
     */
    void closeConnection();
} 