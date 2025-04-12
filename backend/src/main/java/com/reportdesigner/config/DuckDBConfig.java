package com.reportdesigner.config;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;

@Slf4j
@Configuration
@ConfigurationProperties(prefix = "duckdb")
@Getter
@Setter
public class DuckDBConfig {

    private String filePath;
    private boolean inMemory = false;
    private String initSqlPath = "classpath:duckdb-init.sql";

    private Connection connection;

    @PostConstruct
    public void init() {
        try {
            // Load DuckDB JDBC driver
            Class.forName("org.duckdb.DuckDBDriver");

            // Create data directory if it doesn't exist
            if (!inMemory && filePath != null) {
                Path dataDir = Paths.get(filePath).getParent();
                if (dataDir != null && !Files.exists(dataDir)) {
                    Files.createDirectories(dataDir);
                    log.info("Created DuckDB data directory: {}", dataDir);
                }
            }

            log.info("DuckDB configuration initialized");
        } catch (Exception e) {
            log.error("Failed to initialize DuckDB configuration", e);
            throw new RuntimeException("Failed to initialize DuckDB configuration", e);
        }
    }

    @Bean
    @Primary
    public Connection duckDBConnection() throws SQLException {
        String jdbcUrl;

        if (inMemory) {
            jdbcUrl = "jdbc:duckdb:";
            log.info("Connecting to in-memory DuckDB instance");
        } else {
            jdbcUrl = "jdbc:duckdb:" + filePath;
            log.info("Connecting to file-based DuckDB instance at: {}", filePath);
        }

        connection = DriverManager.getConnection(jdbcUrl);

        // Initialize database with SQL script if provided
        if (initSqlPath != null && !initSqlPath.isEmpty()) {
            try {
                String initSql = new String(
                        getClass().getClassLoader().getResourceAsStream(
                                initSqlPath.replace("classpath:", "")
                        ).readAllBytes()
                );

                try (Statement stmt = connection.createStatement()) {
                    for (String sql : initSql.split(";")) {
                        if (!sql.trim().isEmpty()) {
                            stmt.execute(sql);
                        }
                    }
                }
                log.info("Initialized DuckDB with SQL script: {}", initSqlPath);
            } catch (Exception e) {
                log.error("Failed to initialize DuckDB with SQL script", e);
            }
        }

        return connection;
    }

    @PreDestroy
    public void cleanup() {
        if (connection != null) {
            try {
                connection.close();
                log.info("Closed DuckDB connection");
            } catch (SQLException e) {
                log.error("Failed to close DuckDB connection", e);
            }
        }
    }
} 