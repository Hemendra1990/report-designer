package com.reportdesigner.service;

import com.reportdesigner.model.Report;
import com.reportdesigner.model.ReportType;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

public interface ReportService extends BaseService<Report> {
    List<Report> findByReportType(ReportType reportType);
    List<Report> findByReportTypeAndActive(ReportType reportType, boolean active);
    List<Report> findAllPublic();
    List<Report> findByDataSource(String dataSource);
    Optional<Report> findByNameAndReportType(String name, ReportType reportType);
    boolean existsByNameAndReportType(String name, ReportType reportType);
    Report create(Report report);
    Report update(UUID id, Report report);
    void softDelete(UUID id);
    List<Map<String, Object>> executeReport(UUID id);
} 