package com.reportdesigner.service.duckdb.impl;

import com.reportdesigner.service.duckdb.DuckDBQueryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Implementation of the DuckDBQueryService for executing queries against DuckDB.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DuckDBQueryServiceImpl implements DuckDBQueryService {

    private final Connection duckDBConnection;

    @Override
    public List<Map<String, Object>> executeQuery(String sql) {
        List<Map<String, Object>> results = new ArrayList<>();
        
        try (Statement stmt = duckDBConnection.createStatement();
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
        } catch (SQLException e) {
            log.error("Error executing DuckDB query: {}", sql, e);
            throw new RuntimeException("Error executing DuckDB query", e);
        }
        
        return results;
    }

    @Override
    public List<Map<String, Object>> executeQuery(String sql, Map<String, Object> params) {
        List<Map<String, Object>> results = new ArrayList<>();
        
        try (PreparedStatement pstmt = createPreparedStatement(sql, params);
             ResultSet rs = pstmt.executeQuery()) {
            
            ResultSetMetaData metaData = rs.getMetaData();
            int columnCount = metaData.getColumnCount();
            
            while (rs.next()) {
                Map<String, Object> row = new HashMap<>();
                for (int i = 1; i <= columnCount; i++) {
                    row.put(metaData.getColumnName(i), rs.getObject(i));
                }
                results.add(row);
            }
        } catch (SQLException e) {
            log.error("Error executing DuckDB query with parameters: {}", sql, e);
            throw new RuntimeException("Error executing DuckDB query with parameters", e);
        }
        
        return results;
    }

    @Override
    public int executeUpdate(String sql) {
        try (Statement stmt = duckDBConnection.createStatement()) {
            return stmt.executeUpdate(sql);
        } catch (SQLException e) {
            log.error("Error executing DuckDB update: {}", sql, e);
            throw new RuntimeException("Error executing DuckDB update", e);
        }
    }

    @Override
    public int executeUpdate(String sql, Map<String, Object> params) {
        try (PreparedStatement pstmt = createPreparedStatement(sql, params)) {
            return pstmt.executeUpdate();
        } catch (SQLException e) {
            log.error("Error executing DuckDB update with parameters: {}", sql, e);
            throw new RuntimeException("Error executing DuckDB update with parameters", e);
        }
    }

    @Override
    public int[] executeBatch(List<String> sqlBatch) {
        try (Statement stmt = duckDBConnection.createStatement()) {
            for (String sql : sqlBatch) {
                stmt.addBatch(sql);
            }
            return stmt.executeBatch();
        } catch (SQLException e) {
            log.error("Error executing DuckDB batch: {}", sqlBatch, e);
            throw new RuntimeException("Error executing DuckDB batch", e);
        }
    }

    private PreparedStatement createPreparedStatement(String sql, Map<String, Object> params) throws SQLException {
        PreparedStatement pstmt = duckDBConnection.prepareStatement(sql);
        
        if (params != null) {
            int paramIndex = 1;
            for (Map.Entry<String, Object> entry : params.entrySet()) {
                pstmt.setObject(paramIndex++, entry.getValue());
            }
        }
        
        return pstmt;
    }
} 