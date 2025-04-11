package com.reportdesigner.controller;

import com.reportdesigner.model.TableInfo;
import com.reportdesigner.model.ColumnInfo;
import com.reportdesigner.service.DatabaseMetadataService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/metadata")
@RequiredArgsConstructor
@Tag(name = "Database Metadata", description = "APIs for retrieving database structure information")
public class DatabaseMetadataController {
    private final DatabaseMetadataService databaseMetadataService;

    @GetMapping("/tables")
    @Operation(summary = "Get all tables with their columns",
            description = "Retrieves a list of all tables in the database along with their column information")
    public ResponseEntity<Map<String, Object>> getAllTables(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        List<TableInfo> allTables = databaseMetadataService.getAllTables();
        
        int start = (page - 1) * size;
        int end = Math.min(start + size, allTables.size());
        List<TableInfo> paginatedTables = allTables.subList(start, end);
        
        Map<String, Object> response = new HashMap<>();
        response.put("items", paginatedTables);
        response.put("totalItems", allTables.size());
        response.put("totalPages", (int) Math.ceil((double) allTables.size() / size));
        response.put("currentPage", page);
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/tables/{schema}/{tableName}/columns")
    @Operation(summary = "Get columns for a specific table",
            description = "Retrieves detailed column information for a specific table")
    public List<ColumnInfo> getTableColumns(
            @PathVariable String schema,
            @PathVariable String tableName) {
        return databaseMetadataService.getTableColumns(schema, tableName);
    }

    @GetMapping("/tables/search")
    public ResponseEntity<List<TableInfo>> searchTables(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String schema) {
        try {
            List<TableInfo> tables = databaseMetadataService.searchTables(query, schema);
            return ResponseEntity.ok(tables);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/tables/{schema}/{tableName}/related")
    public ResponseEntity<List<TableInfo>> getRelatedTables(
            @PathVariable String schema,
            @PathVariable String tableName) {
        try {
            List<TableInfo> tables = databaseMetadataService.getRelatedTables(schema, tableName);
            return ResponseEntity.ok(tables);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
} 