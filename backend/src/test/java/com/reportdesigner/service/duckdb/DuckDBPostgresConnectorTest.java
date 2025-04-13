package com.reportdesigner.service.duckdb;

import com.reportdesigner.service.duckdb.impl.DuckDBPostgresConnectorImplxxx;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.sql.Connection;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class DuckDBPostgresConnectorTest {

    @Mock
    private Connection duckDBConnection;
    
    @Mock
    private DuckDBQueryService queryService;
    
    private DuckDBPostgresConnector postgresConnector;
    
    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        postgresConnector = new DuckDBPostgresConnectorImplxxx(duckDBConnection, queryService);
    }
    
    @Test
    void testConnectToPostgres() {
        // Mock successful installation of postgres_scanner
        when(queryService.executeUpdate("LOAD postgres_scanner")).thenReturn(0);
        
        // Mock successful connection to PostgreSQL
        when(queryService.executeQuery(contains("CALL postgres_attach"))).thenReturn(List.of(Map.of()));
        
        // Test connection with default schema
        boolean connected = postgresConnector.connectToPostgres(
            "localhost", 5432, "crm_dev", "postgres", "postgres"
        );
        
        // Verify connection was successful
        assertTrue(connected, "Connection should be successful");
        
        // Verify correct SQL was executed
        verify(queryService).executeQuery(contains("postgresql://postgres:postgres@localhost:5432/crm_dev"));
    }
    
    @Test
    void testConnectToPostgresWithSchema() {
        // Mock successful installation of postgres_scanner
        when(queryService.executeUpdate("LOAD postgres_scanner")).thenReturn(0);
        
        // Mock successful connection to PostgreSQL
        when(queryService.executeQuery(contains("CALL postgres_attach"))).thenReturn(List.of(Map.of()));
        when(queryService.executeUpdate(contains("SET search_path TO"))).thenReturn(0);
        
        // Test connection with custom schema
        boolean connected = postgresConnector.connectToPostgres(
            "localhost", 5432, "crm_dev", "postgres", "postgres", "sales"
        );
        
        // Verify connection was successful
        assertTrue(connected, "Connection should be successful");
        
        // Verify correct SQL was executed
        verify(queryService).executeQuery(contains("postgresql://postgres:postgres@localhost:5432/crm_dev"));
        verify(queryService).executeUpdate("SET search_path TO sales");
    }

    @Test
    void testExecuteQuery() {
        // Setup mock connection state
        when(queryService.executeUpdate("LOAD postgres_scanner")).thenReturn(0);
        when(queryService.executeUpdate(contains("CALL postgres_attach"))).thenReturn(0);
        
        // Connect first
        postgresConnector.connectToPostgres("localhost", 5432, "crm_dev", "postgres", "postgres");
        
        // Mock query results
        List<Map<String, Object>> expectedResults = List.of(
            Map.of("id", 1, "name", "Test 1"),
            Map.of("id", 2, "name", "Test 2")
        );
        List<Map<String, Object>> methodCall = queryService.executeQuery("SELECT * FROM postgres.users");
        when(methodCall).thenReturn(expectedResults);
        
        // Execute query
        List<Map<String, Object>> results = postgresConnector.executeQuery("SELECT * FROM postgres.users");
        
        // Verify results
        assertEquals(2, results.size(), "Should return 2 rows");
        assertEquals(1, results.get(0).get("id"), "First row ID should be 1");
        assertEquals("Test 1", results.get(0).get("name"), "First row name should be 'Test 1'");
    }
    
    @Test
    void testExecuteQueryWithoutConnection() {
        // Test executing query without connecting first
        Exception exception = assertThrows(IllegalStateException.class, () -> {
            postgresConnector.executeQuery("SELECT * FROM postgres.users");
        });
        
        assertTrue(exception.getMessage().contains("Not connected to PostgreSQL"), 
                "Exception should mention connection state");
    }
    
    @Test
    void testAttachPostgresTable() {
        // Setup mock connection state
        when(queryService.executeUpdate("LOAD postgres_scanner")).thenReturn(0);
        when(queryService.executeUpdate(contains("CALL postgres_attach"))).thenReturn(0);
        
        // Connect first
        postgresConnector.connectToPostgres("localhost", 5432, "testdb", "user", "password");
        
        // Mock successful table attachment
        when(queryService.executeUpdate(contains("CREATE OR REPLACE VIEW"))).thenReturn(0);
        
        // Attach table
        boolean attached = postgresConnector.attachPostgresTable("public.users", "local_users");
        
        // Verify attachment was successful
        assertTrue(attached, "Table attachment should be successful");
        
        // Verify correct SQL was executed
        verify(queryService).executeUpdate(
            "CREATE OR REPLACE VIEW local_users AS SELECT * FROM postgres.public.users"
        );
    }
} 