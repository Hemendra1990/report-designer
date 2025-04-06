package com.reportdesigner.service;

import com.reportdesigner.model.Dashboard;
import com.reportdesigner.model.Report;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DashboardService extends BaseService<Dashboard> {
    List<Dashboard> findByReport(Report report);
    List<Dashboard> findByReportAndActive(Report report, boolean active);
    List<Dashboard> findAllPublic();
    List<Dashboard> findAllPublished();
    Optional<Dashboard> findByPublishUrl(String publishUrl);
    boolean existsByNameAndReport(String name, Report report);
    Dashboard create(Dashboard dashboard);
    Dashboard update(UUID id, Dashboard dashboard);
    void softDelete(UUID id);
    Dashboard publish(UUID id);
    Dashboard unpublish(UUID id);
} 