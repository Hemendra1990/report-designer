package com.reportdesigner.service.duckdb;

import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Test;

import java.sql.*;

@Slf4j
public class PgTablesToDuckViewTest {

    private static final String PG_USER = "postgres";
    private static final String PG_PASSWORD = "postgres";
    private static final String PG_HOST = "localhost";
    private static final String TABLE_NAME_COLUMN = "table_name";

    @Test
    public void testSchemaView() {
        String pgDbName = "crm_dev";
        String pgSchemaName = "rd";
        String duckDbName = "db";

        String duckDbUrl = String.format("jdbc:duckdb:%s.db", pgSchemaName);

        try (
                Connection connection = DriverManager.getConnection(duckDbUrl);
                Statement stmt = connection.createStatement()
        ) {
            // 1. Attach Postgres
            attachToPostgres(stmt, pgDbName, pgSchemaName, duckDbName);

            // 2. Query table names from attached Postgres schema and create views
            queryTablesAndCreateDuckDbViews(pgSchemaName, duckDbName, stmt);

            // 3. Execute query on the view
            queryAndLogViewData(stmt, "accounts");

        } catch (SQLException e) {
            log.error("Error in DuckDB operations: {}", e.getMessage(), e);
        }
    }

    private void queryAndLogViewData(Statement stmt, String viewName) throws SQLException {
        String query = String.format("SELECT * FROM %s", viewName);
        try (ResultSet rs = stmt.executeQuery(query)) {
            ResultSetMetaData metaData = rs.getMetaData();
            int columnCount = metaData.getColumnCount();

            // Print column headers
            logColumnHeaders(metaData, columnCount);

            // Print rows
            int rowCount = 0;
            while (rs.next() && rowCount < 100) { // Limit to 100 rows to prevent excessive logging
                logRowData(rs, metaData, columnCount, rowCount);
                rowCount++;
            }

            log.info("Total rows displayed: {}", rowCount);
        }
    }

    private void logColumnHeaders(ResultSetMetaData metaData, int columnCount) throws SQLException {
        StringBuilder headers = new StringBuilder("Columns: ");
        for (int i = 1; i <= columnCount; i++) {
            headers.append(metaData.getColumnName(i));
            if (i < columnCount) {
                headers.append(" | ");
            }
        }
        log.info(headers.toString());
    }

    private void logRowData(ResultSet rs, ResultSetMetaData metaData, int columnCount, int rowNum) throws SQLException {
        StringBuilder rowData = new StringBuilder();
        rowData.append("Row ").append(rowNum + 1).append(": ");

        for (int i = 1; i <= columnCount; i++) {
            String columnName = metaData.getColumnName(i);
            Object value = rs.getObject(i);
            rowData.append(columnName).append("=").append(value);

            if (i < columnCount) {
                rowData.append(" | ");
            }
        }

        log.info(rowData.toString());
    }

    private void queryTablesAndCreateDuckDbViews(String schemaName, String pgDbName, Statement stmt) {
        String query = String.format(
                "SELECT %s FROM information_schema.tables WHERE table_schema='%s' AND table_type = 'BASE TABLE'",
                TABLE_NAME_COLUMN, schemaName
        );

        try (ResultSet rs = stmt.executeQuery(query)) {
            // Create a separate statement for executing create view commands
            try (Statement createViewStmt = stmt.getConnection().createStatement()) {
                int viewCount = 0;
                while (rs.next()) {
                    String tableName = rs.getString(TABLE_NAME_COLUMN);
                    createViewForTable(createViewStmt, tableName, pgDbName, schemaName);
                    viewCount++;
                }
                log.info("Created {} views for schema '{}'", viewCount, schemaName);
            }
        } catch (SQLException e) {
            log.error("Error creating views: {}", e.getMessage());
            throw new RuntimeException(e);
        }
    }

    private void createViewForTable(Statement stmt, String tableName, String pgDbName, String schemaName) throws SQLException {
        String createViewSQL = String.format(
                "CREATE OR REPLACE VIEW %s AS SELECT * FROM %s.%s.%s;",
                tableName, pgDbName, schemaName, tableName
        );

        log.info("Creating view: {}", createViewSQL);
        stmt.execute(createViewSQL);
    }

    private static void attachToPostgres(Statement stmt, String dbName, String schemaName, String duckDbName) throws SQLException {
        loadPostgresExtension(stmt);

        String attachSql = String.format(
                "ATTACH 'dbname=%s user=%s password=%s host=%s' AS %s (TYPE postgres, SCHEMA '%s', READ_ONLY);",
                dbName, PG_USER, PG_PASSWORD, PG_HOST, duckDbName, schemaName
        );

        log.info("Attaching to Postgres database: {}", dbName);
        stmt.execute(attachSql);
    }

    private static void loadPostgresExtension(Statement stmt) throws SQLException {
        try {
            stmt.executeUpdate("LOAD postgres;");
            log.info("Postgres extension loaded successfully");
        } catch (Exception e) {
            log.warn("Postgres extension not loaded, attempting to install...");
            stmt.executeUpdate("INSTALL postgres");
            stmt.executeUpdate("LOAD postgres");
            log.info("Postgres extension installed and loaded successfully");
        }
    }
}
