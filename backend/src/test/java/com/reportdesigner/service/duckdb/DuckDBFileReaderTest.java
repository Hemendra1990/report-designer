package com.reportdesigner.service.duckdb;

import com.reportdesigner.service.duckdb.impl.DuckDBFileReaderImpl;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;

import java.io.BufferedWriter;
import java.io.File;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

class DuckDBFileReaderTest {

    @Mock
    private DuckDBQueryService queryService;

    private DuckDBFileReader fileReader;
    
    @TempDir
    Path tempDir;
    
    private Path csvFile;
    private Path jsonFile;
    
    @BeforeEach
    void setUp() throws Exception {
        MockitoAnnotations.openMocks(this);
        fileReader = new DuckDBFileReaderImpl(queryService);
        
        // Create test CSV file
        csvFile = tempDir.resolve("test.csv");
        try (BufferedWriter writer = Files.newBufferedWriter(csvFile, StandardCharsets.UTF_8)) {
            writer.write("id,name,value\n");
            writer.write("1,Item 1,10.5\n");
            writer.write("2,Item 2,20.75\n");
            writer.write("3,Item 3,30.25\n");
        }
        
        // Create test JSON file
        jsonFile = tempDir.resolve("test.json");
        try (BufferedWriter writer = Files.newBufferedWriter(jsonFile, StandardCharsets.UTF_8)) {
            writer.write("[");
            writer.write("{\"id\": 1, \"name\": \"Item 1\", \"value\": 10.5},\n");
            writer.write("{\"id\": 2, \"name\": \"Item 2\", \"value\": 20.75},\n");
            writer.write("{\"id\": 3, \"name\": \"Item 3\", \"value\": 30.25}\n");
            writer.write("]");
        }
    }
    
    @Test
    void testReadCsvFile() {
        // Mock the query service behavior
        List<Map<String, Object>> expectedResults = List.of(
            Map.of("id", 1, "name", "Item 1", "value", 10.5),
            Map.of("id", 2, "name", "Item 2", "value", 20.75),
            Map.of("id", 3, "name", "Item 3", "value", 30.25)
        );
        
        // Mock the executeUpdate method for creating the view
        when(queryService.executeUpdate(contains("CREATE OR REPLACE VIEW"))).thenReturn(0);
        
        // Mock the executeQuery method that reads from the view
        when(queryService.executeQuery(contains("SELECT * FROM temp_csv_view_"))).thenReturn(expectedResults);
        
        // Mock the executeUpdate method for dropping the view
        when(queryService.executeUpdate(contains("DROP VIEW IF EXISTS"))).thenReturn(0);
        
        // Test reading the CSV file
        List<Map<String, Object>> results = fileReader.readCsvFile(
            csvFile.toAbsolutePath().toString(),
            Map.of("header", true, "delimiter", ",")
        );
        
        // Verify results
        assertEquals(3, results.size(), "Should return 3 rows");
        assertEquals(1, results.get(0).get("id"), "First row ID should be 1");
        assertEquals("Item 1", results.get(0).get("name"), "First row name should be 'Item 1'");
        assertEquals(10.5, results.get(0).get("value"), "First row value should be 10.5");
    }
    
    @Test
    void testReadJsonFile() {
        // Mock the query service behavior
        List<Map<String, Object>> expectedResults = List.of(
            Map.of("id", 1, "name", "Item 1", "value", 10.5),
            Map.of("id", 2, "name", "Item 2", "value", 20.75),
            Map.of("id", 3, "name", "Item 3", "value", 30.25)
        );
        
        // Mock the executeUpdate method for creating the view
        when(queryService.executeUpdate(contains("CREATE OR REPLACE VIEW"))).thenReturn(0);
        
        // Mock the executeQuery method that reads from the view
        when(queryService.executeQuery(contains("SELECT * FROM temp_json_view_"))).thenReturn(expectedResults);
        
        // Mock the executeUpdate method for dropping the view
        when(queryService.executeUpdate(contains("DROP VIEW IF EXISTS"))).thenReturn(0);
        
        // Test reading the JSON file
        List<Map<String, Object>> results = fileReader.readJsonFile(jsonFile.toAbsolutePath().toString());
        
        // Verify results
        assertEquals(3, results.size(), "Should return 3 rows");
        assertEquals(1, results.get(0).get("id"), "First row ID should be 1");
        assertEquals("Item 1", results.get(0).get("name"), "First row name should be 'Item 1'");
        assertEquals(10.5, results.get(0).get("value"), "First row value should be 10.5");
    }
    
    @Test
    void testQueryFile() {
        // Mock the query service behavior
        List<Map<String, Object>> expectedResults = List.of(
            Map.of("id", 1, "name", "Item 1", "value", 10.5),
            Map.of("id", 2, "name", "Item 2", "value", 20.75)
        );
        
        // Mock the executeUpdate method for creating the view
        when(queryService.executeUpdate(contains("CREATE OR REPLACE VIEW"))).thenReturn(0);
        
        // Mock the executeQuery method with SQL
        when(queryService.executeQuery(contains("WHERE value > 10"))).thenReturn(expectedResults);
        
        // Mock the executeUpdate method for dropping the view
        when(queryService.executeUpdate(contains("DROP VIEW IF EXISTS"))).thenReturn(0);
        
        // Test querying the CSV file
        List<Map<String, Object>> results = fileReader.queryFile(
            csvFile.toAbsolutePath().toString(),
            "csv",
            "SELECT * FROM data WHERE value > 10",
            Map.of("header", true)
        );
        
        // Verify results
        assertEquals(2, results.size(), "Should return 2 rows");
        assertEquals(1, results.get(0).get("id"), "First row ID should be 1");
        assertEquals(2, results.get(1).get("id"), "Second row ID should be 2");
    }
    
    @Test
    void testFileNotFound() {
        // Mock the query service to throw an exception when file not found
        when(queryService.executeUpdate(contains("nonexistent.csv"))).thenThrow(
            new RuntimeException("Error: file not found")
        );
        
        // Test with non-existent file
        Exception exception = assertThrows(RuntimeException.class, () -> {
            fileReader.readCsvFile("nonexistent.csv", null);
        });
        
        assertTrue(exception.getMessage().contains("Error reading CSV file"), 
                "Exception should mention CSV file error");
    }
} 