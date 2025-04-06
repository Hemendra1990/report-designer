package com.reportdesigner.service;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.Map;

public interface DuckDBService {
    Connection getConnection(String dataSource) throws SQLException;
    ResultSet executeQuery(String dataSource, String query, Map<String, Object> parameters) throws SQLException;
    List<Map<String, Object>> executeQueryAsList(String dataSource, String query, Map<String, Object> parameters) throws SQLException;
    void executeUpdate(String dataSource, String query, Map<String, Object> parameters) throws SQLException;
    void closeConnection(String dataSource);
    void closeAllConnections();
} 