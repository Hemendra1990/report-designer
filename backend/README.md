# DuckDB Spring Boot Integration

This project demonstrates a production-ready integration of DuckDB with Spring Boot, implementing various features for data analytics and processing.

## Features

- **DuckDB Integration**: Embedded DuckDB database with Spring Boot
- **PostgreSQL Connector**: Connect to PostgreSQL via DuckDB
- **File Reading**: Read CSV, Parquet, and JSON files using DuckDB
- **SQL Query Service**: Execute queries on data from various sources

## Prerequisites

- Java 17 or later
- Maven 3.6+
- PostgreSQL (optional, for testing PostgreSQL connectivity)

## Configuration

The application can be configured through `application.properties`:

```properties
# DuckDB Configuration
duckdb.file-path=./data/olap_new.duckdb
duckdb.in-memory=false
duckdb.init-sql-path=classpath:duckdb-init.sql

# DuckDB PostgreSQL Integration (optional)
duckdb.postgres.host=jdbc:postgresql://localhost:5432/your_database
duckdb.postgres.username=postgres
duckdb.postgres.password=password
```

## Building and Running

1. Clone the repository
2. Build the project:
   ```bash
   mvn clean install
   ```
3. Run the application:
   ```bash
   mvn spring-boot:run
   ```

## API Endpoints

### DuckDB Direct Queries

- **POST /api/duckdb/query**
  - Execute a raw SQL query on DuckDB
  - Request body: `{"sql": "SELECT * FROM my_table"}`

### File Operations

- **POST /api/duckdb/file/csv**
  - Read a CSV file
  - Request body: `{"filePath": "path/to/file.csv", "options": {"header": true, "delimiter": ","}}`

- **POST /api/duckdb/file/parquet**
  - Read a Parquet file
  - Request body: `{"filePath": "path/to/file.parquet"}`

- **POST /api/duckdb/file/json**
  - Read a JSON file
  - Request body: `{"filePath": "path/to/file.json"}`

- **POST /api/duckdb/query/file**
  - Query a file directly with SQL
  - Request body: `{"filePath": "path/to/file.csv", "fileType": "csv", "sql": "SELECT * FROM data WHERE value > 10", "options": {"header": true}}`

### PostgreSQL Integration

- **POST /api/duckdb/postgres/connect**
  - Connect to a PostgreSQL database
  - Request body: `{"host": "localhost", "port": 5432, "database": "testdb", "username": "user", "password": "pass"}`

- **POST /api/duckdb/postgres/query**
  - Query PostgreSQL via DuckDB
  - Request body: `{"sql": "SELECT * FROM postgres.users"}`

- **POST /api/duckdb/postgres/attach**
  - Attach a PostgreSQL table
  - Request body: `{"postgresTable": "public.users", "duckDbTableName": "local_users"}`

## Usage Examples

### Query a CSV file with DuckDB

```java
// Java client example
HttpClient client = HttpClient.newHttpClient();
HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("http://localhost:8080/api/duckdb/query/file"))
    .header("Content-Type", "application/json")
    .POST(HttpRequest.BodyPublishers.ofString(
        "{\"filePath\": \"data/sales.csv\", \"fileType\": \"csv\", \"sql\": \"SELECT SUM(amount) as total FROM data GROUP BY region\", \"options\": {\"header\": true}}"
    ))
    .build();

HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
System.out.println(response.body());
```

### Connect to PostgreSQL and query tables

```java
// First connect to PostgreSQL
HttpRequest connectRequest = HttpRequest.newBuilder()
    .uri(URI.create("http://localhost:8080/api/duckdb/postgres/connect"))
    .header("Content-Type", "application/json")
    .POST(HttpRequest.BodyPublishers.ofString(
        "{\"host\": \"localhost\", \"port\": 5432, \"database\": \"testdb\", \"username\": \"user\", \"password\": \"pass\"}"
    ))
    .build();

client.send(connectRequest, HttpResponse.BodyHandlers.ofString());

// Then query PostgreSQL tables
HttpRequest queryRequest = HttpRequest.newBuilder()
    .uri(URI.create("http://localhost:8080/api/duckdb/postgres/query"))
    .header("Content-Type", "application/json")
    .POST(HttpRequest.BodyPublishers.ofString(
        "{\"sql\": \"SELECT u.id, u.name, o.order_date FROM postgres.users u JOIN postgres.orders o ON u.id = o.user_id\"}"
    ))
    .build();

HttpResponse<String> queryResponse = client.send(queryRequest, HttpResponse.BodyHandlers.ofString());
System.out.println(queryResponse.body());
```

## Testing

Run the tests with:

```bash
mvn test
```

The test suite includes:
- Unit tests for all DuckDB services
- Tests for file reading capabilities
- Tests for PostgreSQL connectivity
- Error handling tests

## Architecture

This implementation follows SOLID principles:

- **Single Responsibility**: Each service has a single responsibility (querying, file reading, PostgreSQL connectivity)
- **Open/Closed**: The code is open for extension through interfaces
- **Liskov Substitution**: All implementations can be substituted for their interfaces
- **Interface Segregation**: Interfaces are specific to client needs
- **Dependency Inversion**: The code depends on abstractions, not concrete implementations

## License

This project is licensed under the MIT License - see the LICENSE file for details. 