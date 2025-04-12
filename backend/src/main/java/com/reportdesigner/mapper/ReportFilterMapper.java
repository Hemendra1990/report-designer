package com.reportdesigner.mapper;

import com.reportdesigner.dto.ReportFilterDTO;
import com.reportdesigner.model.ReportFilter;
import org.springframework.stereotype.Component;

@Component
public class ReportFilterMapper implements BaseMapper<ReportFilterDTO, ReportFilter> {
    @Override
    public ReportFilterDTO toDto(ReportFilter entity) {
        return ReportFilterDTO.builder()
                .id(entity.getId())
                .tableName(entity.getTableName())
                .columnName(entity.getColumnName())
                .duckDBColumnName(entity.getDuckDBColumnName())
                .operator(entity.getOperator())
                .value(entity.getValue())
                .sortOrder(entity.getSortOrder())
                .logicalOperator(entity.getLogicalOperator())
                .customFormula(entity.getCustomFormula())
                .build();
    }

    @Override
    public ReportFilter toEntity(ReportFilterDTO dto) {
        return ReportFilter.builder()
                .id(dto.getId())
                .tableName(dto.getTableName())
                .columnName(dto.getColumnName())
                .duckDBColumnName(dto.getDuckDBColumnName())
                .operator(dto.getOperator())
                .value(dto.getValue())
                .sortOrder(dto.getSortOrder())
                .logicalOperator(dto.getLogicalOperator())
                .customFormula(dto.getCustomFormula())
                .build();
    }
}