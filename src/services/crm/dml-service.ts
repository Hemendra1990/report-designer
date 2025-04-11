import { crmHttpService } from "./http-crm-service";

const BASE_URL = "/dml/v2";

export const executeQuery = (query: Record<string, string>) => {
    return crmHttpService.post(`${BASE_URL}/execute-query`, query);
}
