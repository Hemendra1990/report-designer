import { crmHttpService } from "./http-crm-service";

const BASE_URL = `dml`;

export const getLayout = () => {
    return crmHttpService.get('/api/layout/0JEC9RMYTZR6G');
  }