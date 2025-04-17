import { httpCrmClient } from "./http-crm-client";

const BASE_URL = "/api/dml/v2";

export const executeQuery = (query: Record<string, string>) => {
    return httpCrmClient.post(`${BASE_URL}/execute-query`, query);
}
