package com.reportdesigner.service.impl;

import com.reportdesigner.model.Report;
import com.reportdesigner.model.ReportType;
import com.reportdesigner.repository.ReportRepository;
import com.reportdesigner.service.BaseServiceImpl;
import com.reportdesigner.service.DuckDBService;
import com.reportdesigner.service.ReportService;
import com.reportdesigner.service.ReportTypeService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.SQLException;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class ReportServiceImpl extends BaseServiceImpl<Report, ReportRepository> implements ReportService {

    private final ReportTypeService reportTypeService;
    private final DuckDBService duckDBService;

    public ReportServiceImpl(ReportRepository repository, ReportTypeService reportTypeService, DuckDBService duckDBService) {
        super(repository);
        this.reportTypeService = reportTypeService;
        this.duckDBService = duckDBService;
    }

    @Override
    public List<Report> findByReportType(ReportType reportType) {
        return repository.findByReportType(reportType);
    }

    @Override
    public List<Report> findByReportTypeAndActive(ReportType reportType, boolean active) {
        return active ? repository.findByReportTypeAndActiveTrue(reportType) : repository.findByReportType(reportType);
    }

    @Override
    public List<Report> findAllPublic() {
        return repository.findByIsPublicTrueAndActiveTrue();
    }

    @Override
    public List<Report> findByDataSource(String dataSource) {
        return repository.findByDataSource(dataSource);
    }

    @Override
    public Optional<Report> findByNameAndReportType(String name, ReportType reportType) {
        return repository.findAll().stream()
                .filter(report -> report.getName().equals(name) && report.getReportType().equals(reportType))
                .findFirst();
    }

    @Override
    public boolean existsByNameAndReportType(String name, ReportType reportType) {
        return repository.existsByNameAndReportType(name, reportType);
    }

    @Override
    public Report create(Report report) {
        if (existsByNameAndReportType(report.getName(), report.getReportType())) {
            throw new IllegalArgumentException("Report with name " + report.getName() + " already exists for this report type");
        }
        return save(report);
    }

    @Override
    public Report update(UUID id, Report report) {
        if (!existsById(id)) {
            throw new IllegalArgumentException("Report with id " + id + " not found");
        }
        
        Report existingReport = findById(id).orElseThrow();
        
        // Check if the name is being changed and if it already exists for this report type
        if (!existingReport.getName().equals(report.getName()) && 
            existsByNameAndReportType(report.getName(), report.getReportType())) {
            throw new IllegalArgumentException("Report with name " + report.getName() + " already exists for this report type");
        }
        
        report.setId(existingReport.getId());
        return save(report);
    }

    @Override
    public void softDelete(UUID id) {
        if (!existsById(id)) {
            throw new IllegalArgumentException("Report with id " + id + " not found");
        }
        
        Report report = findById(id).orElseThrow();
        report.setActive(false);
        save(report);
    }

    @Override
    public List<Report> executeReport(UUID id) {
        if (!existsById(id)) {
            throw new IllegalArgumentException("Report with id " + id + " not found");
        }
        
        Report report = findById(id).orElseThrow();
        
        try {
            // Execute the report query using DuckDB
            List<Map<String, Object>> results = duckDBService.executeQueryAsList(
                report.getDataSource(),
                report.getQuery(),
                null // TODO: Parse and pass parameters from report.getParameters()
            );
            
            // For now, we're just returning the report itself
            // In a real implementation, we would return the query results
            return List.of(report);
        } catch (SQLException e) {
            throw new RuntimeException("Failed to execute report: " + e.getMessage(), e);
        }
    }
} 