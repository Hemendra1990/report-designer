-- Create the database if it doesn't exist
CREATE DATABASE rd_db;

-- Connect to the database
\c rd_db;

-- Create the report_types table
CREATE TABLE IF NOT EXISTS report_types (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(500),
    query_template TEXT NOT NULL,
    parameters_schema TEXT NOT NULL,
    is_public BOOLEAN NOT NULL DEFAULT FALSE,
    data_source VARCHAR(255) NOT NULL,
    visualization_options TEXT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

-- Create the reports table
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    report_type_id UUID NOT NULL REFERENCES report_types(id),
    parameters TEXT NOT NULL,
    query TEXT NOT NULL,
    visualization_config TEXT NOT NULL,
    is_public BOOLEAN NOT NULL DEFAULT FALSE,
    data_source VARCHAR(255) NOT NULL,
    refresh_interval VARCHAR(50) NOT NULL,
    auto_refresh BOOLEAN NOT NULL DEFAULT FALSE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    UNIQUE(name, report_type_id)
);

-- Create the dashboards table
CREATE TABLE IF NOT EXISTS dashboards (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    report_id UUID NOT NULL REFERENCES reports(id),
    is_public BOOLEAN NOT NULL DEFAULT FALSE,
    publish_url VARCHAR(255) NOT NULL UNIQUE,
    layout TEXT NOT NULL,
    theme VARCHAR(50) NOT NULL,
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    UNIQUE(name, report_id)
);

-- Create the widgets table
CREATE TABLE IF NOT EXISTS widgets (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    dashboard_id UUID NOT NULL REFERENCES dashboards(id),
    report_id UUID NOT NULL REFERENCES reports(id),
    type VARCHAR(50) NOT NULL,
    configuration TEXT NOT NULL,
    position TEXT NOT NULL,
    size TEXT NOT NULL,
    refresh_interval VARCHAR(50) NOT NULL,
    auto_refresh BOOLEAN NOT NULL DEFAULT FALSE,
    filters TEXT NOT NULL,
    style TEXT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    UNIQUE(name, dashboard_id)
); 