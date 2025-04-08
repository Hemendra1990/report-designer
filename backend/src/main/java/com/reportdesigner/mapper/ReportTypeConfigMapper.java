package com.reportdesigner.mapper;

import com.reportdesigner.dto.ReportTypeConfigDTO;
import com.reportdesigner.model.ReportTypeConfig;
import org.springframework.stereotype.Component;

@Component
public class ReportTypeConfigMapper implements BaseMapper<ReportTypeConfigDTO, ReportTypeConfig> {

    @Override
    public ReportTypeConfigDTO toDto(ReportTypeConfig entity) {
        return ReportTypeConfigDTO.builder()
                .id(entity.getId())
                .joinType(entity.getJoinType())
                .primaryTableId(entity.getPrimaryTableId())
                .primaryTableName(entity.getPrimaryTableName())
                .primaryTableDisplayName(entity.getPrimaryTableDisplayName())
                .fromColumn(entity.getFromColumn())
                .joinTableName(entity.getJoinTableName())
                .joinTableId(entity.getJoinTableId())
                .joinTableDisplayName(entity.getJoinTableDisplayName())
                .referColumn(entity.getReferColumn())
                .sortOrder(entity.getSortOrder())
                .build();
    }

    @Override
    public ReportTypeConfig toEntity(ReportTypeConfigDTO dto) {
        return ReportTypeConfig.builder()
                .id(dto.getId())
                .joinType(dto.getJoinType())
                .primaryTableId(dto.getPrimaryTableId())
                .primaryTableName(dto.getPrimaryTableName())
                .primaryTableDisplayName(dto.getPrimaryTableDisplayName())
                .fromColumn(dto.getFromColumn())
                .joinTableName(dto.getJoinTableName())
                .joinTableId(dto.getJoinTableId())
                .joinTableDisplayName(dto.getJoinTableDisplayName())
                .referColumn(dto.getReferColumn())
                .sortOrder(dto.getSortOrder())
                .build();
    }
}
