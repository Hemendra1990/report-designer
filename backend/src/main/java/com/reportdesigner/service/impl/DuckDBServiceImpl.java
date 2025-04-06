package com.reportdesigner.service.impl;

import com.reportdesigner.config.DuckDBConfig;
import com.reportdesigner.service.DuckDBService;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StreamUtils;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DuckDBServiceImpl implements DuckDBService {

    private final DuckDBConfig duckDBConfig;

    public DuckDBServiceImpl(DuckDBConfig duckDBConfig) {
        this.duckDBConfig = duckDBConfig;
    }

    @PostConstruct
    public void initializeDatabase() {
        try {
            // Read the initialization SQL script
            ClassPathResource resource = new ClassPathResource("duckdb-init.sql");
            String initScript = StreamUtils.copyToString(resource.getInputStream(), StandardCharsets.UTF_8);

            // Execute the initialization script
            Connection conn = getConnection("default");
            conn.createStatement().execute(initScript);
        } catch (IOException | SQLException e) {
            throw new RuntimeException("Failed to initialize DuckDB database", e);
        }
    }

    @Override
    public Connection getConnection(String dataSource) throws SQLException {
        return duckDBConfig.getConnection(dataSource);
    }

    @Override
    public ResultSet executeQuery(String dataSource, String query, Map<String, Object> parameters) throws SQLException {
        Connection conn = getConnection(dataSource);
        PreparedStatement stmt = conn.prepareStatement(query);
        
        if (parameters != null) {
            int paramIndex = 1;
            for (Map.Entry<String, Object> entry : parameters.entrySet()) {
                stmt.setObject(paramIndex++, entry.getValue());
            }
        }
        
        return stmt.executeQuery();
    }

    @Override
    public List<Map<String, Object>> executeQueryAsList(String dataSource, String query, Map<String, Object> parameters) throws SQLException {
        List<Map<String, Object>> results = new ArrayList<>();
        
        try (ResultSet rs = executeQuery(dataSource, query, parameters)) {
            int columnCount = rs.getMetaData().getColumnCount();
            
            while (rs.next()) {
                Map<String, Object> row = new HashMap<>();
                for (int i = 1; i <= columnCount; i++) {
                    String columnName = rs.getMetaData().getColumnName(i);
                    row.put(columnName, rs.getObject(i));
                }
                results.add(row);
            }
        }
        
        return results;
    }

    @Override
    public void executeUpdate(String dataSource, String query, Map<String, Object> parameters) throws SQLException {
        Connection conn = getConnection(dataSource);
        PreparedStatement stmt = conn.prepareStatement(query);
        
        if (parameters != null) {
            int paramIndex = 1;
            for (Map.Entry<String, Object> entry : parameters.entrySet()) {
                stmt.setObject(paramIndex++, entry.getValue());
            }
        }
        
        stmt.executeUpdate();
    }

    @Override
    public void closeConnection(String dataSource) {
        duckDBConfig.closeConnection(dataSource);
    }

    @Override
    public void closeAllConnections() {
        duckDBConfig.closeAllConnections();
    }
} 