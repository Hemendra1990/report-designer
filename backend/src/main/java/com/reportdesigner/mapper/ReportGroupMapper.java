package com.reportdesigner.mapper;

import com.reportdesigner.dto.ReportGroupDTO;
import com.reportdesigner.model.ReportGroup;
import org.springframework.stereotype.Component;

@Component
public class ReportGroupMapper implements BaseMapper<ReportGroupDTO, ReportGroup> {
    @Override
    public ReportGroupDTO toDto(ReportGroup entity) {
        return ReportGroupDTO.builder()
                .id(entity.getId())
                .tableName(entity.getTableName())
                .columnName(entity.getColumnName())
                .duckDBColumnName(entity.getDuckDBColumnName())
                .displayName(entity.getDisplayName())
                .sortOrder(entity.getSortOrder())
                .sortDirection(entity.getSortDirection())
                .summaryFormula(entity.getSummaryFormula())
                .build();
    }

    @Override
    public ReportGroup toEntity(ReportGroupDTO dto) {
        return ReportGroup.builder()
                .id(dto.getId())
                .tableName(dto.getTableName())
                .columnName(dto.getColumnName())
                .duckDBColumnName(dto.getDuckDBColumnName())
                .displayName(dto.getDisplayName())
                .sortOrder(dto.getSortOrder())
                .sortDirection(dto.getSortDirection())
                .summaryFormula(dto.getSummaryFormula())
                .build();
    }
}