-- Create a sample table for storing raw data
CREATE TABLE IF NOT EXISTS raw_data (
    id INTEGER PRIMARY KEY,
    timestamp TIMESTAMP,
    category VARCHAR,
    value DOUBLE,
    metadata JSON
);

-- Create a sample table for aggregated metrics
CREATE TABLE IF NOT EXISTS metrics (
    id INTEGER PRIMARY KEY,
    metric_name VARCHAR,
    metric_value DOUBLE,
    dimensions JSON,
    updated_at TIMESTAMP
);

-- Create a sample table for time series data
CREATE TABLE IF NOT EXISTS time_series (
    id INTEGER PRIMARY KEY,
    series_name VARCHAR,
    timestamp TIMESTAMP,
    value DOUBLE,
    tags JSON
);

-- Create some sample views
CREATE VIEW IF NOT EXISTS daily_metrics AS
SELECT 
    DATE_TRUNC('day', timestamp) as day,
    category,
    COUNT(*) as count,
    AVG(value) as avg_value,
    SUM(value) as total_value
FROM raw_data
GROUP BY DATE_TRUNC('day', timestamp), category; 