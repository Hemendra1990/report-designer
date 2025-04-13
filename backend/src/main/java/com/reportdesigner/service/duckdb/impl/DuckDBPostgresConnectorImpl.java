package com.reportdesigner.service.duckdb.impl;

import com.reportdesigner.service.duckdb.DuckDBPostgresConnector;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.sql.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class DuckDBPostgresConnectorImpl implements DuckDBPostgresConnector {

    private static final String POSTGRES_EXTENSION = "postgres";
    private static final String LOAD_POSTGRES_EXT = "LOAD " + POSTGRES_EXTENSION + ";";
    private static final String INSTALL_POSTGRES_EXT = "INSTALL " + POSTGRES_EXTENSION;
    private static final String DUCK_DB_URL_PREFIX = "jdbc:duckdb:";

    // Cache to track which schemas have been attached
    private final Map<String, Connection> schemaConnections = new ConcurrentHashMap<>();
    // Cache to track which tables have been created as views
    private final Map<String, Map<String, Boolean>> schemaTableViews = new ConcurrentHashMap<>();

    @Override
    public boolean connectToPostgres(String host, int port, String database, String username, String password) {
        return connectToPostgres(host, port, database, username, password, "public");
    }

    /**
     * !!! IMPORTANT !!!
     * Use this method importantly to connect to a specific schema
     *
     * @param host     PostgreSQL host
     * @param port     PostgreSQL port
     * @param database PostgreSQL database name
     * @param username PostgreSQL username
     * @param password PostgreSQL password
     * @param schema   PostgreSQL schema name (default is 'public')
     * @return
     */
    @Override
    public boolean connectToPostgres(String host, int port, String database, String username, String password, String schema) {
        String connectionString = String.format("dbname=%s user=%s password=%s host=%s port=%d",
                database, username, password, host, port);
        return connectToPostgres(connectionString, schema);
    }

    @Override
    public boolean connectToPostgres(String connectionString) {
        return connectToPostgres(connectionString, "public");
    }

    @Override
    public boolean connectToPostgres(String connectionString, String schema) {
        try {
            // Use schema name as DuckDB database name for multitenancy
            Connection connection = getDuckDBConnection(schema);

            // Load postgres extension
            loadPostgresExtension(connection);

            // Attach PostgreSQL database with read-only access
            attachPostgresDatabase(connection, connectionString, schema);

            // Cache the connection for this schema
            schemaConnections.put(schema, connection);
            schemaTableViews.put(schema, new ConcurrentHashMap<>());

            log.info("Successfully connected to PostgreSQL schema '{}' via DuckDB", schema);
            return true;
        } catch (SQLException e) {
            log.error("Failed to connect to PostgreSQL via DuckDB: {}", e.getMessage(), e);
            return false;
        }
    }

    @Override
    public List<Map<String, Object>> executeQuery(String sql) {
        List<Map<String, Object>> results = new ArrayList<>();

        // Extract schema and table information from the SQL query to ensure views are created
        try {
            // This is a simplified approach. In a real-world scenario, you would use a SQL parser.
            ensureTablesExistAsViews(sql);

            // Find the active schema connection to use
            String activeSchema = findActiveSchemaFromQuery(sql);
            if (activeSchema == null || !schemaConnections.containsKey(activeSchema)) {
                log.error("No active connection for schema found from query: {}", sql);
                return results;
            }

            Connection connection = schemaConnections.get(activeSchema);
            try (Statement stmt = connection.createStatement();
                 ResultSet rs = stmt.executeQuery(sql)) {

                ResultSetMetaData metaData = rs.getMetaData();
                int columnCount = metaData.getColumnCount();

                while (rs.next()) {
                    Map<String, Object> row = new HashMap<>();
                    for (int i = 1; i <= columnCount; i++) {
                        row.put(metaData.getColumnName(i), rs.getObject(i));
                    }
                    results.add(row);
                }
            }

            log.debug("Executed query successfully with {} results", results.size());
            return results;
        } catch (SQLException e) {
            log.error("Error executing query: {}", e.getMessage(), e);
            return results;
        }
    }

    @Override
    public boolean attachPostgresTable(String postgresTable, String duckDbTableName) {
        try {
            for (Map.Entry<String, Connection> entry : schemaConnections.entrySet()) {
                String schema = entry.getKey();
                Connection connection = entry.getValue();

                try (Statement stmt = connection.createStatement()) {
                    createViewForTable(stmt, postgresTable, duckDbTableName, schema);
                    schemaTableViews.get(schema).put(postgresTable, true);
                }
            }
            return true;
        } catch (SQLException e) {
            log.error("Failed to attach Postgres table {}: {}", postgresTable, e.getMessage(), e);
            return false;
        }
    }

    @Override
    public boolean attachPostgresSchema(String schema) {
        if (schemaConnections.containsKey(schema)) {
            log.info("Schema {} is already attached", schema);
            return true;
        }

        log.error("Cannot attach schema {} without connection details", schema);
        return false;
    }

    @Override
    public void closeConnection() {
        for (Map.Entry<String, Connection> entry : schemaConnections.entrySet()) {
            try {
                Connection connection = entry.getValue();
                if (connection != null && !connection.isClosed()) {
                    connection.close();
                    log.info("Closed DuckDB connection for schema: {}", entry.getKey());
                }
            } catch (SQLException e) {
                log.warn("Error closing DuckDB connection for schema {}: {}",
                        entry.getKey(), e.getMessage());
            }
        }
        schemaConnections.clear();
        schemaTableViews.clear();
    }

    /**
     * Get or create a DuckDB connection for the given schema
     */
    private Connection getDuckDBConnection(String schema) throws SQLException {
        if (schemaConnections.containsKey(schema)) {
            Connection connection = schemaConnections.get(schema);
            if (!connection.isClosed()) {
                return connection;
            }
        }

        // Create a new DuckDB database file per schema for tenant isolation
        String duckDbUrl = DUCK_DB_URL_PREFIX + schema + ".db";
        return DriverManager.getConnection(duckDbUrl);
    }

    /**
     * Load the Postgres extension for DuckDB
     */
    private void loadPostgresExtension(Connection connection) throws SQLException {
        try (Statement stmt = connection.createStatement()) {
            stmt.executeUpdate(LOAD_POSTGRES_EXT);
            log.info("Postgres extension loaded successfully");
        } catch (SQLException e) {
            log.warn("Postgres extension not loaded, attempting to install: {}", e.getMessage());
            try (Statement stmt = connection.createStatement()) {
                stmt.executeUpdate(INSTALL_POSTGRES_EXT);
                stmt.executeUpdate(LOAD_POSTGRES_EXT);
                log.info("Postgres extension installed and loaded successfully");
            }
        }
    }

    /**
     * Attach a PostgreSQL database to DuckDB
     */
    private void attachPostgresDatabase(Connection connection, String connectionString, String schema) throws SQLException {
        String duckDbName = "pg_" + schema.replace("-", "_");
        String attachSql = String.format(
                "ATTACH '%s' AS %s (TYPE postgres, SCHEMA '%s', READ_ONLY);",
                connectionString, duckDbName, schema);

        try (Statement stmt = connection.createStatement()) {
            stmt.execute(attachSql);
            log.info("Attached PostgreSQL schema '{}' to DuckDB as '{}'", schema, duckDbName);
        }
    }

    /**
     * Create a view for a table if it doesn't exist
     */
    private void createViewForTable(Statement stmt, String tableName, String viewName, String schema) throws SQLException {
        String finalViewName = viewName != null && !viewName.isBlank() ? viewName : tableName;
        String duckDbName = "pg_" + schema.replace("-", "_");

        // Check if view already exists
        try (ResultSet rs = stmt.executeQuery("SELECT 1 FROM information_schema.views WHERE table_name = '" + finalViewName + "'")) {
            if (rs.next()) {
                log.debug("View '{}' already exists", finalViewName);
                return;
            }
        }

        // Create the view for the table
        String createViewSQL = String.format(
                "CREATE OR REPLACE VIEW %s AS SELECT * FROM %s.%s.%s;",
                finalViewName, duckDbName, schema, tableName);

        stmt.execute(createViewSQL);
        log.info("Created view '{}' for table '{}.{}'", finalViewName, schema, tableName);
    }

    /**
     * Extracts table names from a SQL query and ensures corresponding views exist
     */
    private void ensureTablesExistAsViews(String sql) throws SQLException {
        // This is a simplified approach. In a real-world scenario, you would use a SQL parser library.
        // For a production-ready implementation, consider using libraries like JSqlParser or Calcite.
        
        String normalizedSql = sql.toLowerCase();
        for (Map.Entry<String, Connection> entry : schemaConnections.entrySet()) {
            String schema = entry.getKey();
            Connection connection = entry.getValue();
            
            // First collect all table names that might need views
            List<String> tablesToProcess = new ArrayList<>();
            try (Statement stmt = connection.createStatement();
                 ResultSet rs = stmt.executeQuery(String.format(
                     "SELECT table_name FROM information_schema.tables WHERE table_schema='%s' AND table_type='BASE TABLE'", 
                     schema))) {
                
                while (rs.next()) {
                    String tableName = rs.getString("table_name");
                    // If table is mentioned in the query and we haven't created a view for it yet
                    if (normalizedSql.contains(tableName.toLowerCase()) && 
                            !schemaTableViews.get(schema).getOrDefault(tableName, false)) {
                        tablesToProcess.add(tableName);
                    }
                }
            }
            
            // Now process each table outside of the result set
            if (!tablesToProcess.isEmpty()) {
                try (Statement createViewStmt = connection.createStatement()) {
                    for (String tableName : tablesToProcess) {
                        createViewForTable(createViewStmt, tableName, tableName, schema);
                        schemaTableViews.get(schema).put(tableName, true);
                    }
                }
            }
        }
    }

    /**
     * Find which schema is being used in the query
     */
    private String findActiveSchemaFromQuery(String sql) {
        // This is a simplified approach. In a real-world scenario, use proper SQL parsing.
        // For now, just return the first schema found or the one that seems most relevant

        if (schemaConnections.isEmpty()) {
            return null;
        }

        // If only one schema is attached, return that
        if (schemaConnections.size() == 1) {
            return schemaConnections.keySet().iterator().next();
        }

        // Try to find a schema mentioned in the query
        String lowerSql = sql.toLowerCase();
        for (String schema : schemaConnections.keySet()) {
            if (lowerSql.contains(schema.toLowerCase())) {
                return schema;
            }
        }

        // Default to the first schema
        return schemaConnections.keySet().iterator().next();
    }
}
