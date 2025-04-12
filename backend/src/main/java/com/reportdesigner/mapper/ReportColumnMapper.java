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
                .tableId(entity.getTableId())
                .columnName(entity.getColumnName())
                .columnDisplayName(entity.getColumnDisplayName())
                .columnType(entity.getColumnType())
                .duckDBColumnName(entity.getDuckDBColumnName())
                .duckDBColumnDisplayName(entity.getDuckDBColumnDisplayName())
                .name(entity.getName())
                .type(entity.getType())
                .category(entity.getCategory())
                .icon(entity.getIcon())
                .isFormula(entity.getIsFormula())
                .formula(entity.getFormula())
                .isSummaryFormula(entity.getIsSummaryFormula())
                .alias(entity.getAlias())
                .description(entity.getDescription())
                .build();
    }

    @Override
    public ReportColumn toEntity(ReportColumnDTO dto) {
        return ReportColumn.builder()
                .id(dto.getId())
                .tableName(dto.getTableName())
                .tableId(dto.getTableId())
                .columnName(dto.getColumnName())
                .columnDisplayName(dto.getColumnDisplayName())
                .columnType(dto.getColumnType())
                .duckDBColumnName(dto.getDuckDBColumnName())
                .duckDBColumnDisplayName(dto.getDuckDBColumnDisplayName())
                .name(dto.getName())
                .type(dto.getType())
                .category(dto.getCategory())
                .icon(dto.getIcon())
                .isFormula(dto.getIsFormula())
                .formula(dto.getFormula())
                .isSummaryFormula(dto.getIsSummaryFormula())
                .alias(dto.getAlias())
                .description(dto.getDescription())
                .build();
    }
}