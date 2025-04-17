package com.reportdesigner.mapper;

import com.reportdesigner.dto.ReportDTO;
import com.reportdesigner.dto.ReportTypeDTO;
import com.reportdesigner.model.Report;
import com.reportdesigner.model.ReportColumn;
import com.reportdesigner.model.ReportType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ReportMapper implements BaseMapper<ReportDTO, Report> {
    private final ReportColumnMapper columnMapper;
    private final ReportGroupMapper groupMapper;
    private final ReportFilterMapper filterMapper;

    @Override
    public ReportDTO toDto(Report entity) {
        ReportDTO dto = ReportDTO.builder()
                .id(entity.getId())
                .name(entity.getName())
                .label(entity.getLabel())
                .description(entity.getDescription())
                .sqlQuery(entity.getSqlQuery())
                .sqlQueryWithGrouping(entity.getSqlQueryWithGrouping())
                .createdOn(entity.getCreatedOn())
                .updatedOn(entity.getUpdatedOn())
                .columns(columnMapper.toDtoList(entity.getColumns()))
                .groups(groupMapper.toDtoList(entity.getGroups()))
                .filters(filterMapper.toDtoList(entity.getFilters()))
                .filterRule(entity.getFilterRule())
                .build();
        if (Objects.nonNull(entity.getReportType())) {
            ReportTypeDTO rt = ReportTypeDTO.builder()
                    .id(entity.getReportType().getId()).name(entity.getReportType().getName())
                    .build();
            dto.setReportType(rt);
        }
        return dto;
    }

    @Override
    public Report toEntity(ReportDTO dto) {
        Report entity = Report.builder()
                .id(dto.getId())
                .name(dto.getName())
                .label(dto.getLabel())
                .description(dto.getDescription())
                .sqlQuery(dto.getSqlQuery())
                .sqlQueryWithGrouping(dto.getSqlQueryWithGrouping())
                .columns(columnMapper.toEntityList(dto.getColumns()))
                .groups(groupMapper.toEntityList(dto.getGroups()))
                .filters(filterMapper.toEntityList(dto.getFilters()))
                .filterRule(dto.getFilterRule())
                .build();
        if (Objects.nonNull(dto.getReportType())) {
            ReportType rt = ReportType.builder().id(dto.getReportType().getId()).build();
            entity.setReportType(rt);
        }
        entity.getColumns().forEach(c -> c.setReport(entity));
        entity.getGroups().forEach(g -> g.setReport(entity));
        entity.getFilters().forEach(f -> f.setReport(entity));
        return entity;
    }
}