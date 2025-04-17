import { httpCrmClient } from "./http-crm-client";

const BASE_URL = "/api/metadata";

export const findAllTableMetaData = () => {
    return httpCrmClient.get(`${BASE_URL}/all-table`)
}

export const findColumnMetaDataByTableName = (tableName: string) => {
    return httpCrmClient.get(`${BASE_URL}/table/${tableName}`);
}

export const getRelatedData = (tableName: string) => {
    return httpCrmClient.get(`${BASE_URL}/table/${tableName}/related-tables`);
}