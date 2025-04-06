package com.reportdesigner.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import java.io.File;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Configuration
public class DuckDBConfig {

    @Value("${duckdb.file.path}")
    private String duckDbFilePath;

    private final Map<String, Connection> connectionCache = new ConcurrentHashMap<>();

    @Bean
    @Primary
    public Connection defaultConnection() throws SQLException {
        return getConnection("default");
    }

    public Connection getConnection(String dataSource) throws SQLException {
        return connectionCache.computeIfAbsent(dataSource, key -> {
            try {
                // Ensure the directory exists
                File dbFile = new File(duckDbFilePath);
                dbFile.getParentFile().mkdirs();

                // Create the connection URL
                String url = "jdbc:duckdb:" + duckDbFilePath;
                
                // Load the DuckDB JDBC driver
                Class.forName("org.duckdb.DuckDBDriver");
                
                // Create the connection
                Connection conn = DriverManager.getConnection(url);
                
                // If this is not the default connection, we need to attach the database
                if (!"default".equals(key)) {
                    conn.createStatement().execute("ATTACH DATABASE '" + key + "' AS " + key);
                }
                
                return conn;
            } catch (SQLException | ClassNotFoundException e) {
                throw new RuntimeException("Failed to create DuckDB connection for data source: " + key, e);
            }
        });
    }

    public void closeConnection(String dataSource) {
        Connection conn = connectionCache.remove(dataSource);
        if (conn != null) {
            try {
                conn.close();
            } catch (SQLException e) {
                // Log error but don't throw
                System.err.println("Error closing connection: " + e.getMessage());
            }
        }
    }

    public void closeAllConnections() {
        for (Map.Entry<String, Connection> entry : connectionCache.entrySet()) {
            try {
                entry.getValue().close();
            } catch (SQLException e) {
                // Log error but don't throw
                System.err.println("Error closing connection: " + e.getMessage());
            }
        }
        connectionCache.clear();
    }
} 