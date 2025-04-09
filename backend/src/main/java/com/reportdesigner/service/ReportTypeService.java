package com.reportdesigner.service;

import com.google.common.base.Preconditions;
import com.reportdesigner.constant.ErrorCode;
import com.reportdesigner.dto.ReportTypeConfigDTO;
import com.reportdesigner.dto.ReportTypeDTO;
import com.reportdesigner.dto.ReportTypeLayoutDTO;
import com.reportdesigner.exception.ValidationException;
import com.reportdesigner.mapper.ReportTypeConfigMapper;
import com.reportdesigner.mapper.ReportTypeMapper;
import com.reportdesigner.model.ReportType;
import com.reportdesigner.repository.ReportTypeConfigRepository;
import com.reportdesigner.repository.ReportTypeLayoutRepository;
import com.reportdesigner.repository.ReportTypeRepository;
import com.reportdesigner.util.ReportUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;

import java.util.*;
import java.util.stream.Collectors;

@Log4j2
@Service
@RequiredArgsConstructor
public class ReportTypeService {
    private final ReportTypeRepository reportTypeRepository;
    private final ReportTypeConfigRepository reportTypeConfigRepository;
    private final ReportTypeLayoutRepository reportTypeLayoutRepository;

    private final ReportTypeMapper reportTypeMapper;
    private final ReportTypeConfigMapper reportTypeConfigMapper;

    private final ReportUtil reportUtil;

    @Transactional
    public ReportTypeDTO create(ReportTypeDTO reportTypeDTO) throws ValidationException {
        try {
            String label = reportTypeDTO.getLabel();
            Preconditions.checkArgument(StringUtils.isNotBlank(label), "Label can not be empty");
            String name = reportUtil.generateNameFromLabel(label);
            reportTypeDTO.setName(name);
            String reportTypeId = reportTypeDTO.getId();
            if (StringUtils.isNotBlank(reportTypeId)) {
                Preconditions.checkArgument(reportTypeRepository.existsByNameAndIdNot(reportTypeDTO.getName(), reportTypeId), "Report Type with same name exist");
            } else {
                Preconditions.checkArgument(!reportTypeRepository.existsByName(reportTypeDTO.getName()), "Report Type with same name exist");
            }
            Preconditions.checkArgument(StringUtils.isNotBlank(reportTypeDTO.getPrimaryTable()), "At-least one table need to select");
            List<ReportTypeConfigDTO> dtoConfigList = reportTypeDTO.getConfigList();
            Preconditions.checkArgument(!CollectionUtils.isEmpty(dtoConfigList), "At-least one configuration need to be set");
            Set<String> usedTables = new HashSet<>();
            dtoConfigList.forEach(config -> {
                Preconditions.checkArgument(StringUtils.isNotBlank(config.getJoinType()), "Join Type can not be empty");
                Preconditions.checkArgument(StringUtils.isNotBlank(config.getPrimaryTableId()), "Primary Table Id can not be empty");
                Preconditions.checkArgument(StringUtils.isNotBlank(config.getPrimaryTableName()), "Primary Table can not be empty");
                Preconditions.checkArgument(StringUtils.isNotBlank(config.getPrimaryTableDisplayName()), "Primary Table Display Name can not be empty");
                Preconditions.checkArgument(StringUtils.isNotBlank(config.getFromColumn()), "Join Column can not be empty");
                Preconditions.checkArgument(StringUtils.isNotBlank(config.getJoinTableName()), "Join Table can not be empty");
                Preconditions.checkArgument(StringUtils.isNotBlank(config.getJoinTableDisplayName()), "Join Table display can not be empty");
                Preconditions.checkArgument(StringUtils.isNotBlank(config.getReferColumn()), "Refer Column can not be empty");
                Preconditions.checkNotNull(config.getSortOrder(), "Configuration Order can not be empty");

                usedTables.add(config.getPrimaryTableDisplayName());
                usedTables.add(config.getJoinTableDisplayName());
            });
            // delete config if any
            if (StringUtils.isNotBlank(reportTypeId)) {
                reportTypeConfigRepository.deleteByReportTypeId(reportTypeId);
            }

            reportTypeDTO.setUsedTables(usedTables.stream().toList());
            String cteQuery = generateCTEQuery(reportTypeDTO.getName(), reportTypeDTO.getPrimaryTable(), dtoConfigList, reportTypeDTO.getLayoutList());
            reportTypeDTO.setCteQuery(cteQuery);

            ReportType reportType = reportTypeMapper.toEntity(reportTypeDTO);
            ReportType savedReportType = reportTypeRepository.save(reportType);
            reportTypeDTO.setId(savedReportType.getId());
            return reportTypeDTO;
        } catch (Exception ex) {
            throw new ValidationException(ex.getMessage(), ErrorCode.ERR_PROCESSING, "ReportTypeService.create");
        }
    }

    private String generateCTEQuery(String name, String primaryTableName, List<ReportTypeConfigDTO> dtoConfigList, List<ReportTypeLayoutDTO> layoutList) {
        dtoConfigList.sort(Comparator.comparingInt(ReportTypeConfigDTO::getSortOrder));

        StringBuilder cteBuilder = new StringBuilder();
        cteBuilder.append("WITH ").append(name).append(" AS (\n"); //TODO naming cov check

        // SELECT clause
        cteBuilder.append("SELECT ");
        String selectClause = layoutList.stream()
                .map(layout -> layout.getTableName() + "." + layout.getColumnName())
                .collect(Collectors.joining(", "));
        cteBuilder.append(selectClause).append("\n");

        // FROM and JOINs
        cteBuilder.append("FROM ").append(primaryTableName).append(" ").append(primaryTableName).append("\n");

        dtoConfigList.forEach(config ->
                cteBuilder.append(config.getJoinType()).append(" ")
                        .append(config.getJoinTableName()).append(" ").append(config.getJoinTableName()).append(" ON ")
                        .append(config.getPrimaryTableName()).append(".").append(config.getFromColumn())
                        .append(" = ").append(config.getJoinTableName()).append(".").append(config.getReferColumn()).append("\n")
        );

        cteBuilder.append(")\n");

        return cteBuilder.toString();
    }

    public List<ReportTypeDTO> getAllReportType() {
        return reportTypeRepository.findAll().stream()
                .map(reportType -> reportTypeMapper.toBasicDto(reportType)).toList();
    }

    @Transactional
    public ReportTypeDTO getReportTypeById(String reportTypeId) throws ValidationException {
        try {
            Preconditions.checkArgument(StringUtils.isNotBlank(reportTypeId), "Report type id can not be empty");
            Optional<ReportType> byId = reportTypeRepository.findById(reportTypeId);
            if (byId.isPresent()) {
                return reportTypeMapper.toDto(byId.get());
            }
            return null;
        } catch (Exception ex) {
            throw new ValidationException(ex.getMessage(), ErrorCode.ERR_PROCESSING, "ReportTypeService.getReportTypeById");
        }
    }

    public void updateLayoutStatus(List<ReportTypeLayoutDTO> layoutList) {
        Map<Boolean, List<String>> result = layoutList.stream()
                .collect(Collectors.groupingBy(ReportTypeLayoutDTO::getActive,Collectors.mapping(ReportTypeLayoutDTO::getId, Collectors.toList())));

        result.forEach((key, value) -> reportTypeLayoutRepository.updateLayoutColumnStatus(value, key));
    }
}
