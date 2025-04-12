package com.reportdesigner.mapper;

import com.reportdesigner.dto.ReportColumnDTO;
import com.reportdesigner.model.ReportColumn;
import org.springframework.stereotype.Component;

@Component
public class ReportColumnMapper implements BaseMapper<ReportColumnDTO, ReportColumn> {
    @Override
    public ReportColumnDTO toDto(ReportColumn entity) {
        return ReportColumnDTO.builder()
                .id(entity.getId())
                .tableName(entity.getTableName())
                .columnName(entity.getColumnName())
                .duckDBColumnName(entity.getDuckDBColumnName())
                .displayName(entity.getDisplayName())
                .sortOrder(entity.getSortOrder())
                .visible(entity.getVisible())
                .aggregationType(entity.getAggregationType())
                .build();
    }

    @Override
    public ReportColumn toEntity(ReportColumnDTO dto) {
        return ReportColumn.builder()
                .id(dto.getId())
                .tableName(dto.getTableName())
                .columnName(dto.getColumnName())
                .duckDBColumnName(dto.getDuckDBColumnName())
                .displayName(dto.getDisplayName())
                .sortOrder(dto.getSortOrder())
                .visible(dto.getVisible())
                .aggregationType(dto.getAggregationType())
                .build();
    }
}