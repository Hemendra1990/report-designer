import { crmHttpService } from "./http-crm-service";
import { rdHttpService } from "./http-rd-service";

const BASE_URL = "/dml/v2";

export const executeQuery = (query: Record<string, string>) => {
    return crmHttpService.post(`${BASE_URL}/execute-query`, query);
}

/**
 * Execute a SQL query on a connected PostgreSQL database via DuckDB.
 * @param query
 */
export const executeQueryOnDuckDB = (query: Record<string, string>) => {
    console.log("executeQueryOnDuckDB", query);
    return rdHttpService.post(`/query`, query);
}
