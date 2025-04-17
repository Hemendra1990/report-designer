package com.reportdesigner.dto;

public class PostgresTableAttachRequest {
    private String postgresTable;
    private String duckDbTableName;

    public String getPostgresTable() {
        return postgresTable;
    }

    public void setPostgresTable(String postgresTable) {
        this.postgresTable = postgresTable;
    }

    public String getDuckDbTableName() {
        return duckDbTableName;
    }

    public void setDuckDbTableName(String duckDbTableName) {
        this.duckDbTableName = duckDbTableName;
    }
}