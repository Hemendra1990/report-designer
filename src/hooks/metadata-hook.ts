import { METADATA } from "@/components/enum/query-keys";
import { findAllTableMetaData, findColumnMetaDataByTableName } from "@/services/crm/metadata-service";
import { TableMetadata } from "@/services/databaseService";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export const useAllColumnMetadataByTableName = (tableName: string) => {
    const allColumnMetadataByTableName = () => {
        return findColumnMetaDataByTableName(tableName).then((res) => res?.data?.data);
    };

    const columnListByTableName = useQuery<TableMetadata>({
        queryKey: [METADATA.ALL_COLUMNMETADATA_INFO, tableName],
        enabled: !!tableName,
        queryFn: allColumnMetadataByTableName,
    });
    return columnListByTableName;
};

export const useInvalidateAllColumnMetadataByTableName = () => {
    const queryClient = useQueryClient();
    const invalidateAllColumnMetadataByTableName = () => {
        queryClient.invalidateQueries({ queryKey: [METADATA.ALL_COLUMNMETADATA_INFO] });
    }
    return { invalidateAllColumnMetadataByTableName };
}


export const useAllTableMetadata = () => {
    const allTableMetaData = () => {
        return findAllTableMetaData().then((res) => res?.data?.data);
    };
    const columnListByTableName = useQuery({
        queryKey: [METADATA.ALL_TABLE_METADATA],
        queryFn: allTableMetaData,
    });
    return columnListByTableName;
};

export const useInvalidateAllTableMetaData = () => {
    const queryClient = useQueryClient();
    const invalidateAllTableMetaData = () => {
        queryClient.invalidateQueries({ queryKey: [METADATA.ALL_TABLE_METADATA] });
    }
    return { invalidateAllTableMetaData };
}
