package com.reportdesigner.exception;

/**
 * Custom exception for DuckDB related errors.
 */
public class DuckDBException extends RuntimeException {

    /**
     * Creates a new DuckDBException with the specified message.
     *
     * @param message the detail message
     */
    public DuckDBException(String message) {
        super(message);
    }

    /**
     * Creates a new DuckDBException with the specified message and cause.
     *
     * @param message the detail message
     * @param cause the cause of the exception
     */
    public DuckDBException(String message, Throwable cause) {
        super(message, cause);
    }

    /**
     * Creates a new DuckDBException for file operations.
     *
     * @param filePath the path of the file that caused the error
     * @param cause the cause of the exception
     * @return a new DuckDBException
     */
    public static DuckDBException fileError(String filePath, Throwable cause) {
        return new DuckDBException("Error processing file: " + filePath, cause);
    }

    /**
     * Creates a new DuckDBException for query execution.
     *
     * @param sql the SQL query that caused the error
     * @param cause the cause of the exception
     * @return a new DuckDBException
     */
    public static DuckDBException queryError(String sql, Throwable cause) {
        return new DuckDBException("Error executing query: " + sql, cause);
    }

    /**
     * Creates a new DuckDBException for PostgreSQL connection.
     *
     * @param host the host of the PostgreSQL server
     * @param cause the cause of the exception
     * @return a new DuckDBException
     */
    public static DuckDBException postgresConnectionError(String host, Throwable cause) {
        return new DuckDBException("Error connecting to PostgreSQL server: " + host, cause);
    }
} 