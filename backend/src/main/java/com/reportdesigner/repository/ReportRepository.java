package com.reportdesigner.repository;

import com.reportdesigner.model.Report;
import com.reportdesigner.model.ReportType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ReportRepository extends JpaRepository<Report, UUID> {
    List<Report> findByReportType(ReportType reportType);
    List<Report> findByReportTypeAndActiveTrue(ReportType reportType);
    List<Report> findByIsPublicTrueAndActiveTrue();
    List<Report> findByDataSource(String dataSource);
    boolean existsByNameAndReportType(String name, ReportType reportType);
} 