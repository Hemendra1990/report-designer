package com.reportdesigner.service.impl;

import com.reportdesigner.model.Dashboard;
import com.reportdesigner.model.Report;
import com.reportdesigner.repository.DashboardRepository;
import com.reportdesigner.service.BaseServiceImpl;
import com.reportdesigner.service.DashboardService;
import com.reportdesigner.service.ReportService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class DashboardServiceImpl extends BaseServiceImpl<Dashboard, DashboardRepository> implements DashboardService {

    private final ReportService reportService;

    public DashboardServiceImpl(DashboardRepository repository, ReportService reportService) {
        super(repository);
        this.reportService = reportService;
    }

    @Override
    public List<Dashboard> findByReport(Report report) {
        return repository.findByReport(report);
    }

    @Override
    public List<Dashboard> findByReportAndActive(Report report, boolean active) {
        return active ? repository.findByReportAndActiveTrue(report) : repository.findByReport(report);
    }

    @Override
    public List<Dashboard> findAllPublic() {
        return repository.findByIsPublicTrueAndActiveTrue();
    }

    @Override
    public List<Dashboard> findAllPublished() {
        return repository.findByIsPublishedTrueAndActiveTrue();
    }

    @Override
    public Optional<Dashboard> findByPublishUrl(String publishUrl) {
        return repository.findByPublishUrl(publishUrl);
    }

    @Override
    public boolean existsByNameAndReport(String name, Report report) {
        return repository.existsByNameAndReport(name, report);
    }

    @Override
    public Dashboard create(Dashboard dashboard) {
        if (existsByNameAndReport(dashboard.getName(), dashboard.getReport())) {
            throw new IllegalArgumentException("Dashboard with name " + dashboard.getName() + " already exists for this report");
        }
        return save(dashboard);
    }

    @Override
    public Dashboard update(UUID id, Dashboard dashboard) {
        if (!existsById(id)) {
            throw new IllegalArgumentException("Dashboard with id " + id + " not found");
        }
        
        Dashboard existingDashboard = findById(id).orElseThrow();
        
        // Check if the name is being changed and if it already exists for this report
        if (!existingDashboard.getName().equals(dashboard.getName()) && 
            existsByNameAndReport(dashboard.getName(), dashboard.getReport())) {
            throw new IllegalArgumentException("Dashboard with name " + dashboard.getName() + " already exists for this report");
        }
        
        dashboard.setId(existingDashboard.getId());
        return save(dashboard);
    }

    @Override
    public void softDelete(UUID id) {
        if (!existsById(id)) {
            throw new IllegalArgumentException("Dashboard with id " + id + " not found");
        }
        
        Dashboard dashboard = findById(id).orElseThrow();
        dashboard.setActive(false);
        save(dashboard);
    }

    @Override
    public Dashboard publish(UUID id) {
        if (!existsById(id)) {
            throw new IllegalArgumentException("Dashboard with id " + id + " not found");
        }
        
        Dashboard dashboard = findById(id).orElseThrow();
        dashboard.setPublished(true);
        return save(dashboard);
    }

    @Override
    public Dashboard unpublish(UUID id) {
        if (!existsById(id)) {
            throw new IllegalArgumentException("Dashboard with id " + id + " not found");
        }
        
        Dashboard dashboard = findById(id).orElseThrow();
        dashboard.setPublished(false);
        return save(dashboard);
    }
} 