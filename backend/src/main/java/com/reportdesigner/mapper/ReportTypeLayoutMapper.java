package com.reportdesigner.mapper;

import com.reportdesigner.dto.ReportTypeLayoutDTO;
import com.reportdesigner.model.ReportTypeLayout;
import org.springframework.stereotype.Component;

@Component
public class ReportTypeLayoutMapper implements BaseMapper<ReportTypeLayoutDTO, ReportTypeLayout> {

    @Override
    public ReportTypeLayoutDTO toDto(ReportTypeLayout entity) {
        return ReportTypeLayoutDTO.builder()
                .id(entity.getId())
                .columnName(entity.getColumnName())
                .columnDisplayName(entity.getColumnDisplayName())
                .columnType(entity.getColumnType())
                .tableName(entity.getTableName())
                .tableId(entity.getTableId())
                .active(entity.getActive())
                .build();
    }

    @Override
    public ReportTypeLayout toEntity(ReportTypeLayoutDTO dto) {
        return ReportTypeLayout.builder()
                .id(dto.getId())
                .columnName(dto.getColumnName())
                .columnDisplayName(dto.getColumnDisplayName())
                .columnType(dto.getColumnType())
                .tableName(dto.getTableName())
                .tableId(dto.getTableId())
                .active(dto.getActive())
                .build();
    }
}
