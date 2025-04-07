import { crmHttpService } from "./http-crm-service";

const BASE_URL = "metadata";

export const findAllTableMetaData =  () => {
    return crmHttpService.get(`${BASE_URL}/all-table`)
}

export const findColumnMetaDataByTableName = (tableName: string) => {
    return  crmHttpService.get(`${BASE_URL}/table/${tableName}`);
}