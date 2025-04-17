import { httpRDClient } from "./http-rd-client";

/**
 * Execute a SQL query on a connected PostgreSQL database via DuckDB.
 * @param query
 */
export const executeQueryOnDuckDB = (query: Record<string, string>) => {
    console.log("executeQueryOnDuckDB", query);
    return httpRDClient.post(`/api/analytics/query`, query);
}