package com.reportdesigner.mapper;

import com.reportdesigner.dto.ReportTypeDTO;
import com.reportdesigner.model.ReportType;
import com.reportdesigner.model.ReportTypeConfig;
import com.reportdesigner.model.ReportTypeLayout;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;

import java.util.List;

@Component
@RequiredArgsConstructor
public class ReportTypeMapper implements BaseMapper<ReportTypeDTO, ReportType> {
    private final ReportTypeConfigMapper reportTypeConfigMapper;
    private final ReportTypeLayoutMapper reportTypeLayoutMapper;

    @Override
    public ReportTypeDTO toDto(ReportType entity) {
        return ReportTypeDTO.builder()
                .id(entity.getId())
                .label(entity.getLabel())
                .name(entity.getName())
                .description(entity.getDescription())
                .primaryTableId(entity.getPrimaryTableId())
                .primaryTable(entity.getPrimaryTable())
                .primaryTableDisplayName(entity.getPrimaryTableDisplayName())
                .cteQuery(entity.getCteQuery())
                .usedTables(entity.getUsedTables())
                .configList(reportTypeConfigMapper.toDtoList(entity.getConfigList()))
                .layoutList(reportTypeLayoutMapper.toDtoList(entity.getLayoutList()))
                .build();
    }

    @Override
    public ReportType toEntity(ReportTypeDTO dto) {
        ReportType entity = ReportType.builder()
                .id(dto.getId())
                .label(dto.getLabel())
                .name(dto.getName())
                .description(dto.getDescription())
                .primaryTableId(dto.getPrimaryTableId())
                .primaryTable(dto.getPrimaryTable())
                .primaryTableDisplayName(dto.getPrimaryTableDisplayName())
                .cteQuery(dto.getCteQuery())
                .usedTables(dto.getUsedTables())
                .build();
        if (!CollectionUtils.isEmpty(dto.getConfigList())) {
            List<ReportTypeConfig> configList = reportTypeConfigMapper.toEntityList(dto.getConfigList());
            configList.forEach(config -> config.setReportType(entity));
            entity.setConfigList(configList);
        }
        if (!CollectionUtils.isEmpty(dto.getLayoutList())) {
            List<ReportTypeLayout> layoutList = reportTypeLayoutMapper.toEntityList(dto.getLayoutList());
            layoutList.forEach(config -> config.setReportType(entity));
            entity.setLayoutList(layoutList);
        }
        return entity;
    }

    public ReportTypeDTO toBasicDto(ReportType entity) {
        return ReportTypeDTO.builder()
                .id(entity.getId())
                .label(entity.getLabel())
                .name(entity.getName())
                .description(entity.getDescription())
                .primaryTableId(entity.getPrimaryTableId())
                .primaryTable(entity.getPrimaryTable())
                .primaryTableDisplayName(entity.getPrimaryTableDisplayName())
                .usedTables(entity.getUsedTables())
                .build();
    }
}
