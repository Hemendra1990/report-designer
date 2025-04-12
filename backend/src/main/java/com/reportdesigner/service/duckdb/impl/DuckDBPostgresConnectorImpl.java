package com.reportdesigner.service.duckdb.impl;

import com.reportdesigner.service.duckdb.DuckDBPostgresConnector;
import com.reportdesigner.service.duckdb.DuckDBQueryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Implementation of the DuckDBPostgresConnector for connecting to PostgreSQL via DuckDB.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DuckDBPostgresConnectorImpl implements DuckDBPostgresConnector {

    private final Connection duckDBConnection;
    private final DuckDBQueryService queryService;
    
    private boolean isPostgresConnected = false;
    private String currentConnectionString = null;
    private String currentSchema = null;

    @Override
    public boolean connectToPostgres(String host, int port, String database, String username, String password) {
        return connectToPostgres(host, port, database, username, password, "public");
    }
    
    @Override
    public boolean connectToPostgres(String host, int port, String database, String username, String password, String schema) {
        String connectionString = String.format(
            "postgresql://%s:%s@%s:%d/%s",
            username, password, host, port, database
        );
        return connectToPostgres(connectionString, schema);
    }

    @Override
    public boolean connectToPostgres(String connectionString) {
        return connectToPostgres(connectionString, "public");
    }
    
    @Override
    public boolean connectToPostgres(String connectionString, String schema) {
        try {
            // First, check if postgres_scanner extension is installed
            try {
                queryService.executeUpdate("LOAD postgres_scanner");
            } catch (Exception e) {
                log.warn("postgres_scanner not loaded, attempting to install...");
                queryService.executeUpdate("INSTALL postgres_scanner");
                queryService.executeUpdate("LOAD postgres_scanner");
            }
            
            // Connect to PostgreSQL using executeQuery instead of executeUpdate
            // since CALL statements return a result set
            String sql = String.format("CALL postgres_attach('%s')", connectionString);
            queryService.executeQuery(sql);
            
            // Set the search path to the specified schema if not 'public'
            if (schema != null && !schema.equals("public")) {
                try {
                    String schemaQuery = String.format("SET search_path TO %s", schema);
                    queryService.executeUpdate(schemaQuery);
                    log.info("Set search path to schema: {}", schema);
                } catch (Exception e) {
                    log.warn("Failed to set search path to schema: {}", schema, e);
                    // Continue anyway, as the connection was established
                }
            }
            
            log.info("Successfully connected to PostgreSQL via DuckDB using schema: {}", schema);
            isPostgresConnected = true;
            currentConnectionString = connectionString;
            currentSchema = schema;
            return true;
        } catch (Exception e) {
            log.error("Failed to connect to PostgreSQL via DuckDB", e);
            isPostgresConnected = false;
            currentSchema = null;
            return false;
        }
    }

    @Override
    public List<Map<String, Object>> executeQuery(String sql) {
        if (!isPostgresConnected) {
            throw new IllegalStateException("Not connected to PostgreSQL. Call connectToPostgres() first.");
        }
        
        try {
            return queryService.executeQuery(sql);
        } catch (Exception e) {
            log.error("Error executing query on PostgreSQL via DuckDB: {}", sql, e);
            throw new RuntimeException("Error executing query on PostgreSQL via DuckDB", e);
        }
    }

    @Override
    public boolean attachPostgresTable(String postgresTable, String duckDbTableName) {
        if (!isPostgresConnected) {
            throw new IllegalStateException("Not connected to PostgreSQL. Call connectToPostgres() first.");
        }
        
        String tableName = duckDbTableName == null ? postgresTable : duckDbTableName;
        
        try {
            // If the postgresTable doesn't contain a schema reference and currentSchema is not public,
            // prepend the current schema to the table name
            String fullyQualifiedTableName = postgresTable;
            if (!postgresTable.contains(".") && currentSchema != null && !currentSchema.equals("public")) {
                fullyQualifiedTableName = currentSchema + "." + postgresTable;
                log.debug("Using current schema for table: {}", fullyQualifiedTableName);
            }
            
            String sql = String.format(
                "CREATE OR REPLACE VIEW %s AS SELECT * FROM postgres.%s",
                tableName, fullyQualifiedTableName
            );
            queryService.executeUpdate(sql);
            log.info("Successfully attached PostgreSQL table '{}' as '{}'", fullyQualifiedTableName, tableName);
            return true;
        } catch (Exception e) {
            log.error("Failed to attach PostgreSQL table: {}", postgresTable, e);
            return false;
        }
    }

    @Override
    public boolean attachPostgresSchema(String schema) {
        if (!isPostgresConnected) {
            throw new IllegalStateException("Not connected to PostgreSQL. Call connectToPostgres() first.");
        }
        
        try {
            // Get list of tables in the schema
            String sql = String.format(
                "SELECT table_name FROM information_schema.tables WHERE table_schema = '%s'",
                schema
            );
            
            List<Map<String, Object>> tables = queryService.executeQuery(sql);
            boolean allSuccess = true;
            
            for (Map<String, Object> table : tables) {
                String tableName = (String) table.get("table_name");
                String fullTableName = schema + "." + tableName;
                boolean success = attachPostgresTable(fullTableName, tableName);
                if (!success) {
                    allSuccess = false;
                }
            }
            
            log.info("Attached {} tables from PostgreSQL schema '{}'", tables.size(), schema);
            return allSuccess;
        } catch (Exception e) {
            log.error("Failed to attach PostgreSQL schema: {}", schema, e);
            return false;
        }
    }

    @Override
    public void closeConnection() {
        if (isPostgresConnected) {
            try {
                // Reset search path to public if a custom schema was used
                if (currentSchema != null && !currentSchema.equals("public")) {
                    try {
                        queryService.executeUpdate("SET search_path TO public");
                        log.debug("Reset search path to public schema");
                    } catch (Exception e) {
                        log.debug("Could not reset search path: {}", e.getMessage());
                    }
                }
                
                // Simply attempt to detach the database, ignore errors if it doesn't exist
                try {
                    queryService.executeUpdate("DETACH DATABASE postgres");
                } catch (Exception e) {
                    log.debug("Could not detach database: {}", e.getMessage());
                }
                
                isPostgresConnected = false;
                currentConnectionString = null;
                currentSchema = null;
                log.info("Closed PostgreSQL connection via DuckDB");
            } catch (Exception e) {
                log.error("Error closing PostgreSQL connection via DuckDB", e);
            }
        }
    }
    
    // Helper method to identify if a DuckDB table/view exists
    private boolean tableExists(String tableName) {
        try (Statement stmt = duckDBConnection.createStatement();
             ResultSet rs = stmt.executeQuery(
                 "SELECT name FROM information_schema.tables WHERE table_name='" + tableName + "'")) {
            return rs.next();
        } catch (SQLException e) {
            log.error("Error checking if table exists: {}", tableName, e);
            return false;
        }
    }
    
    // Helper method to identify if a table exists in a specific schema
    private boolean tableExistsInSchema(String tableName, String schema) {
        try (Statement stmt = duckDBConnection.createStatement();
             ResultSet rs = stmt.executeQuery(
                 "SELECT name FROM information_schema.tables " +
                 "WHERE table_name='" + tableName + "' AND table_schema='" + schema + "'")) {
            return rs.next();
        } catch (SQLException e) {
            log.error("Error checking if table exists in schema {}: {}", schema, tableName, e);
            return false;
        }
    }
} 