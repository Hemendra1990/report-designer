package com.reportdesigner.service.duckdb;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.nio.file.Path;
import java.sql.Connection;
import java.sql.DriverManager;
import java.util.List;
import java.util.Map;

import com.reportdesigner.service.duckdb.impl.DuckDBQueryServiceImpl;

import static org.junit.jupiter.api.Assertions.*;

class DuckDBQueryServiceTest {

    private DuckDBQueryService queryService;
    private Connection connection;
    
    @TempDir
    Path tempDir;
    
    @BeforeEach
    void setUp() throws Exception {
        // Create in-memory DuckDB connection for testing
        Class.forName("org.duckdb.DuckDBDriver");
        connection = DriverManager.getConnection("jdbc:duckdb:");
        
        // Initialize the service with our test connection
        queryService = new DuckDBQueryServiceImpl(connection);
        
        // Create a test table
        queryService.executeUpdate("CREATE TABLE test_table (id INTEGER, name VARCHAR)");
        queryService.executeUpdate("INSERT INTO test_table VALUES (1, 'Test 1'), (2, 'Test 2'), (3, 'Test 3')");
    }
    
    @AfterEach
    void tearDown() throws Exception {
        if (connection != null && !connection.isClosed()) {
            connection.close();
        }
    }
    
    @Test
    void testExecuteQuery() {
        // Execute a query
        List<Map<String, Object>> results = queryService.executeQuery("SELECT * FROM test_table ORDER BY id");
        
        // Verify results
        assertEquals(3, results.size(), "Should return 3 rows");
        assertEquals(1, results.get(0).get("id"), "First row ID should be 1");
        assertEquals("Test 1", results.get(0).get("name"), "First row name should be 'Test 1'");
        assertEquals(2, results.get(1).get("id"), "Second row ID should be 2");
        assertEquals(3, results.get(2).get("id"), "Third row ID should be 3");
    }
    
    @Test
    void testExecuteUpdate() {
        // Execute an update
        int rowsAffected = queryService.executeUpdate("UPDATE test_table SET name = 'Updated' WHERE id = 2");
        
        // Verify update affected one row
        assertEquals(1, rowsAffected, "Should affect 1 row");
        
        // Verify the data was updated
        List<Map<String, Object>> results = queryService.executeQuery("SELECT name FROM test_table WHERE id = 2");
        assertEquals(1, results.size(), "Should return 1 row");
        assertEquals("Updated", results.get(0).get("name"), "Name should be updated");
    }
    
    @Test
    void testExecuteBatch() {
        // Create a batch of statements
        List<String> batch = List.of(
            "INSERT INTO test_table VALUES (4, 'Batch 1')",
            "INSERT INTO test_table VALUES (5, 'Batch 2')",
            "UPDATE test_table SET name = 'Batch Updated' WHERE id = 3"
        );
        
        // Execute the batch
        int[] results = queryService.executeBatch(batch);
        
        // Verify results
        assertEquals(3, results.length, "Should return results for 3 statements");
        
        // Verify data changes
        List<Map<String, Object>> data = queryService.executeQuery("SELECT * FROM test_table ORDER BY id");
        assertEquals(5, data.size(), "Should have 5 rows total");
        assertEquals("Batch Updated", data.get(2).get("name"), "Row 3 should be updated");
        assertEquals("Batch 1", data.get(3).get("name"), "Row 4 should be inserted");
        assertEquals("Batch 2", data.get(4).get("name"), "Row 5 should be inserted");
    }
    
    @Test
    void testErrorHandling() {
        // Test with invalid SQL
        Exception exception = assertThrows(RuntimeException.class, () -> {
            queryService.executeQuery("SELECT * FROM nonexistent_table");
        });
        
        assertTrue(exception.getMessage().contains("Error executing DuckDB query"), 
                "Exception should mention query error");
    }
} 