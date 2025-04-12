package com.reportdesigner.service;

import com.google.common.base.Preconditions;
import com.reportdesigner.constant.ErrorCode;
import com.reportdesigner.dto.ReportDTO;
import com.reportdesigner.exception.ValidationException;
import com.reportdesigner.mapper.ReportMapper;
import com.reportdesigner.model.Report;
import com.reportdesigner.model.ReportColumn;
import com.reportdesigner.model.ReportFilter;
import com.reportdesigner.model.ReportGroup;
import com.reportdesigner.model.ReportType;
import com.reportdesigner.repository.ReportColumnRepository;
import com.reportdesigner.repository.ReportFilterRepository;
import com.reportdesigner.repository.ReportGroupRepository;
import com.reportdesigner.repository.ReportRepository;
import com.reportdesigner.repository.ReportTypeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Log4j2
@Service
@RequiredArgsConstructor
public class ReportService {
    private final ReportMapper reportMapper;

    private final ReportRepository reportRepository;
    private final ReportColumnRepository reportColumnRepository;
    private final ReportGroupRepository reportGroupRepository;
    private final ReportFilterRepository reportFilterRepository;
    private final ReportTypeRepository reportTypeRepository;

    public ReportDTO create(ReportDTO reportDTO) throws ValidationException {
        try {
            Preconditions.checkArgument(StringUtils.isNotBlank(reportDTO.getName()), "Report name is required");
            Preconditions.checkNotNull(reportDTO.getReportType(), "Report should belongs to a Report type");
            Preconditions.checkArgument(StringUtils.isNotBlank(reportDTO.getReportType().getId()), "Invalid report type");
            Optional<ReportType> reportTypeOpt = reportTypeRepository.findById(reportDTO.getReportType().getId());
            Preconditions.checkArgument(reportTypeOpt.isPresent(), "Invalid report type");
            Preconditions.checkArgument(!CollectionUtils.isEmpty(reportDTO.getColumns()), "Report should have at least one column");

            if (StringUtils.isNotBlank(reportDTO.getId())) {
                reportColumnRepository.deleteByReportId(reportDTO.getId());
                reportGroupRepository.deleteByReportId(reportDTO.getId());
                reportFilterRepository.deleteByReportId(reportDTO.getId());
            }

            Report report = reportMapper.toEntity(reportDTO);
            report = reportRepository.save(report);

            reportDTO.setId(report.getId());
            return reportDTO;
        } catch (Exception ex) {
            log.error(ex);
            throw new ValidationException(ex.getMessage(), ErrorCode.ERR_PROCESSING, "ReportService.create");
        }
    }

    public ReportDTO findById(String id) throws ValidationException {
        return reportRepository.findById(id).map(reportMapper::toDto)
                .orElseThrow(() -> new ValidationException("Report not found", ErrorCode.EMPTY_OR_NULL_VALUE_FOUND, "ReportService.getById"));
    }

    public List<ReportDTO> findBasicDetails() {
        return reportRepository.findBasicDetails();
    }
}
