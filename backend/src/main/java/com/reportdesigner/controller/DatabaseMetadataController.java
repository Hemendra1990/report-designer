package com.reportdesigner.controller;

import com.reportdesigner.model.TableInfo;
import com.reportdesigner.model.ColumnInfo;
import com.reportdesigner.service.DatabaseMetadataService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/metadata")
@RequiredArgsConstructor
@Tag(name = "Database Metadata", description = "APIs for retrieving database structure information")
public class DatabaseMetadataController {
    private final DatabaseMetadataService databaseMetadataService;

    @GetMapping("/tables")
    @Operation(summary = "Get all tables with their columns",
            description = "Retrieves a list of all tables in the database along with their column information")
    public List<TableInfo> getAllTables() {
        return databaseMetadataService.getAllTables();
    }

    @GetMapping("/tables/{schema}/{tableName}/columns")
    @Operation(summary = "Get columns for a specific table",
            description = "Retrieves detailed column information for a specific table")
    public List<ColumnInfo> getTableColumns(
            @PathVariable String schema,
            @PathVariable String tableName) {
        return databaseMetadataService.getTableColumns(schema, tableName);
    }
} 