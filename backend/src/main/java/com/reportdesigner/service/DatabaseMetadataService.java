package com.reportdesigner.service;

import com.reportdesigner.model.TableInfo;
import com.reportdesigner.model.ColumnInfo;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DatabaseMetadataService {
    private final JdbcTemplate jdbcTemplate;

    public List<TableInfo> getAllTables() {
        String tableQuery = """
            SELECT 
                schemaname as schema,
                tablename as table_name
            FROM pg_catalog.pg_tables
            WHERE schemaname NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
            ORDER BY schemaname, tablename
        """;

        List<TableInfo> tables = new ArrayList<>();
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(tableQuery);

        for (Map<String, Object> row : rows) {
            String schema = (String) row.get("schema");
            String tableName = (String) row.get("table_name");
            List<ColumnInfo> columns = getTableColumns(schema, tableName);

            tables.add(TableInfo.builder()
                    .schema(schema)
                    .tableName(tableName)
                    .columns(columns)
                    .build());
        }

        return tables;
    }

    public List<ColumnInfo> getTableColumns(String schema, String tableName) {
        String columnQuery = """
            SELECT 
                c.column_name,
                c.data_type,
                c.is_nullable = 'YES' as is_nullable,
                CASE WHEN pk.column_name IS NOT NULL THEN true ELSE false END as is_primary_key,
                CASE WHEN fk.column_name IS NOT NULL THEN true ELSE false END as is_foreign_key,
                fk_info.foreign_table_name as referenced_table,
                fk_info.foreign_column_name as referenced_column
            FROM information_schema.columns c
            LEFT JOIN (
                SELECT kcu.column_name
                FROM information_schema.table_constraints tc
                JOIN information_schema.key_column_usage kcu 
                    ON tc.constraint_name = kcu.constraint_name
                    AND tc.table_schema = kcu.table_schema
                WHERE tc.constraint_type = 'PRIMARY KEY'
                    AND tc.table_schema = ?
                    AND tc.table_name = ?
            ) pk ON c.column_name = pk.column_name
            LEFT JOIN (
                SELECT kcu.column_name
                FROM information_schema.table_constraints tc
                JOIN information_schema.key_column_usage kcu 
                    ON tc.constraint_name = kcu.constraint_name
                    AND tc.table_schema = kcu.table_schema
                WHERE tc.constraint_type = 'FOREIGN KEY'
                    AND tc.table_schema = ?
                    AND tc.table_name = ?
            ) fk ON c.column_name = fk.column_name
            LEFT JOIN (
                SELECT 
                    kcu.column_name,
                    ccu.table_name as foreign_table_name,
                    ccu.column_name as foreign_column_name
                FROM information_schema.table_constraints tc
                JOIN information_schema.key_column_usage kcu 
                    ON tc.constraint_name = kcu.constraint_name
                    AND tc.table_schema = kcu.table_schema
                JOIN information_schema.constraint_column_usage ccu 
                    ON tc.constraint_name = ccu.constraint_name
                    AND tc.table_schema = ccu.table_schema
                WHERE tc.constraint_type = 'FOREIGN KEY'
                    AND tc.table_schema = ?
                    AND tc.table_name = ?
            ) fk_info ON c.column_name = fk_info.column_name
            WHERE c.table_schema = ?
                AND c.table_name = ?
            ORDER BY c.ordinal_position
        """;

        return jdbcTemplate.query(
            columnQuery,
            (rs, rowNum) -> ColumnInfo.builder()
                .name(rs.getString("column_name"))
                .dataType(rs.getString("data_type"))
                .nullable(rs.getBoolean("is_nullable"))
                .primaryKey(rs.getBoolean("is_primary_key"))
                .foreignKey(rs.getBoolean("is_foreign_key"))
                .referencedTable(rs.getString("referenced_table"))
                .referencedColumn(rs.getString("referenced_column"))
                .build(),
            schema, tableName, // for primary key subquery
            schema, tableName, // for foreign key subquery
            schema, tableName, // for foreign key info subquery
            schema, tableName  // for main query
        );
    }
} 