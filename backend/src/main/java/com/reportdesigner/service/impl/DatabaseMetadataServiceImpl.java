package com.reportdesigner.service.impl;

import com.reportdesigner.model.TableInfo;
import com.reportdesigner.model.ColumnInfo;
import com.reportdesigner.service.DatabaseMetadataService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
public class DatabaseMetadataServiceImpl implements DatabaseMetadataService {

    private final JdbcTemplate jdbcTemplate;

    @Autowired
    public DatabaseMetadataServiceImpl(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public List<TableInfo> getAllTables() {
        log.info("Fetching all tables from the database");
        String sql = """
            SELECT table_schema, table_name 
            FROM information_schema.tables 
            WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
            AND table_type = 'BASE TABLE'
            ORDER BY table_schema, table_name
            """;
        
        return jdbcTemplate.query(sql, 
            (rs, rowNum) -> TableInfo.builder()
                .schema(rs.getString("table_schema"))
                .tableName(rs.getString("table_name"))
                .columns(getTableColumns(rs.getString("table_schema"), rs.getString("table_name")))
                .build()
        );
    }

    @Override
    public List<ColumnInfo> getTableColumns(String schema, String tableName) {
        log.debug("Fetching columns for table: {}.{}", schema, tableName);
        String sql = """
            SELECT 
                c.column_name, 
                c.data_type, 
                c.is_nullable,
                CASE WHEN pk.column_name IS NOT NULL THEN true ELSE false END as is_primary_key,
                CASE WHEN fk.column_name IS NOT NULL THEN true ELSE false END as is_foreign_key,
                fk_info.referenced_table,
                fk_info.referenced_column
            FROM information_schema.columns c
            LEFT JOIN (
                SELECT kcu.column_name
                FROM information_schema.table_constraints tc
                JOIN information_schema.key_column_usage kcu 
                    ON tc.constraint_name = kcu.constraint_name
                WHERE tc.constraint_type = 'PRIMARY KEY'
                    AND tc.table_schema = ?
                    AND tc.table_name = ?
            ) pk ON c.column_name = pk.column_name
            LEFT JOIN (
                SELECT kcu.column_name
                FROM information_schema.table_constraints tc
                JOIN information_schema.key_column_usage kcu 
                    ON tc.constraint_name = kcu.constraint_name
                WHERE tc.constraint_type = 'FOREIGN KEY'
                    AND tc.table_schema = ?
                    AND tc.table_name = ?
            ) fk ON c.column_name = fk.column_name
            LEFT JOIN (
                SELECT 
                    kcu.column_name,
                    ccu.table_name as referenced_table,
                    ccu.column_name as referenced_column
                FROM information_schema.table_constraints tc
                JOIN information_schema.key_column_usage kcu 
                    ON tc.constraint_name = kcu.constraint_name
                JOIN information_schema.constraint_column_usage ccu 
                    ON tc.constraint_name = ccu.constraint_name
                WHERE tc.constraint_type = 'FOREIGN KEY'
                    AND tc.table_schema = ?
                    AND tc.table_name = ?
            ) fk_info ON c.column_name = fk_info.column_name
            WHERE c.table_schema = ?
                AND c.table_name = ?
            ORDER BY c.ordinal_position
            """;
        
        return jdbcTemplate.query(sql,
            (rs, rowNum) -> ColumnInfo.builder()
                .name(rs.getString("column_name"))
                .dataType(rs.getString("data_type"))
                .nullable(rs.getString("is_nullable").equals("YES"))
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

    @Override
    public List<TableInfo> searchTables(String query, String schema) {
        log.info("Searching tables with query: {} and schema: {}", query, schema);
        String sql = """
            SELECT table_schema, table_name 
            FROM information_schema.tables 
            WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
            AND table_type = 'BASE TABLE'
            AND (? IS NULL OR table_schema = ?)
            AND (? IS NULL OR table_name ILIKE ?)
            ORDER BY table_schema, table_name
            """;
        
        String searchPattern = query != null ? "%" + query + "%" : null;
        
        return jdbcTemplate.query(sql, 
            (rs, rowNum) -> TableInfo.builder()
                .schema(rs.getString("table_schema"))
                .tableName(rs.getString("table_name"))
                .columns(getTableColumns(rs.getString("table_schema"), rs.getString("table_name")))
                .build(),
            schema, schema, searchPattern, searchPattern
        );
    }

    @Override
    public List<TableInfo> getRelatedTables(String schema, String tableName) {
        log.info("Finding related tables for {}.{}", schema, tableName);
        String sql = """
            WITH primary_keys AS (
                SELECT kcu.column_name
                FROM information_schema.table_constraints tc
                JOIN information_schema.key_column_usage kcu 
                    ON tc.constraint_name = kcu.constraint_name
                WHERE tc.constraint_type = 'PRIMARY KEY'
                    AND tc.table_schema = ?
                    AND tc.table_name = ?
            ),
            related_tables AS (
                SELECT DISTINCT
                    tc.table_schema,
                    tc.table_name
                FROM information_schema.table_constraints tc
                JOIN information_schema.key_column_usage kcu 
                    ON tc.constraint_name = kcu.constraint_name
                JOIN information_schema.constraint_column_usage ccu 
                    ON tc.constraint_name = ccu.constraint_name
                WHERE tc.constraint_type = 'FOREIGN KEY'
                    AND ccu.table_schema = ?
                    AND ccu.table_name = ?
                    AND ccu.column_name IN (SELECT column_name FROM primary_keys)
            )
            SELECT 
                rt.table_schema,
                rt.table_name
            FROM related_tables rt
            ORDER BY rt.table_schema, rt.table_name
            """;
        
        return jdbcTemplate.query(sql,
            (rs, rowNum) -> TableInfo.builder()
                .schema(rs.getString("table_schema"))
                .tableName(rs.getString("table_name"))
                .columns(getTableColumns(rs.getString("table_schema"), rs.getString("table_name")))
                .build(),
            schema, tableName,  // for primary_keys CTE
            schema, tableName   // for related_tables CTE
        );
    }
} 