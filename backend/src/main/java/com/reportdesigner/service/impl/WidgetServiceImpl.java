package com.reportdesigner.service.impl;

import com.reportdesigner.model.Dashboard;
import com.reportdesigner.model.Report;
import com.reportdesigner.model.Widget;
import com.reportdesigner.repository.WidgetRepository;
import com.reportdesigner.service.BaseServiceImpl;
import com.reportdesigner.service.DashboardService;
import com.reportdesigner.service.DuckDBService;
import com.reportdesigner.service.ReportService;
import com.reportdesigner.service.WidgetService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.SQLException;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class WidgetServiceImpl extends BaseServiceImpl<Widget, WidgetRepository> implements WidgetService {

    private final DashboardService dashboardService;
    private final ReportService reportService;
    private final DuckDBService duckDBService;

    public WidgetServiceImpl(WidgetRepository repository, DashboardService dashboardService, ReportService reportService, DuckDBService duckDBService) {
        super(repository);
        this.dashboardService = dashboardService;
        this.reportService = reportService;
        this.duckDBService = duckDBService;
    }

    @Override
    public List<Widget> findByDashboard(Dashboard dashboard) {
        return repository.findByDashboard(dashboard);
    }

    @Override
    public List<Widget> findByDashboardAndActive(Dashboard dashboard, boolean active) {
        return active ? repository.findByDashboardAndActiveTrue(dashboard) : repository.findByDashboard(dashboard);
    }

    @Override
    public List<Widget> findByReport(Report report) {
        return repository.findByReport(report);
    }

    @Override
    public List<Widget> findByReportAndActive(Report report, boolean active) {
        return active ? repository.findByReportAndActiveTrue(report) : repository.findByReport(report);
    }

    @Override
    public List<Widget> findByType(String type) {
        return repository.findByType(type);
    }

    @Override
    public boolean existsByNameAndDashboard(String name, Dashboard dashboard) {
        return repository.existsByNameAndDashboard(name, dashboard);
    }

    @Override
    public Widget create(Widget widget) {
        if (existsByNameAndDashboard(widget.getName(), widget.getDashboard())) {
            throw new IllegalArgumentException("Widget with name " + widget.getName() + " already exists for this dashboard");
        }
        return save(widget);
    }

    @Override
    public Widget update(UUID id, Widget widget) {
        if (!existsById(id)) {
            throw new IllegalArgumentException("Widget with id " + id + " not found");
        }
        
        Widget existingWidget = findById(id).orElseThrow();
        
        // Check if the name is being changed and if it already exists for this dashboard
        if (!existingWidget.getName().equals(widget.getName()) && 
            existsByNameAndDashboard(widget.getName(), widget.getDashboard())) {
            throw new IllegalArgumentException("Widget with name " + widget.getName() + " already exists for this dashboard");
        }
        
        widget.setId(existingWidget.getId());
        return save(widget);
    }

    @Override
    public void softDelete(UUID id) {
        if (!existsById(id)) {
            throw new IllegalArgumentException("Widget with id " + id + " not found");
        }
        
        Widget widget = findById(id).orElseThrow();
        widget.setActive(false);
        save(widget);
    }

    @Override
    public List<Widget> executeWidget(UUID id) {
        if (!existsById(id)) {
            throw new IllegalArgumentException("Widget with id " + id + " not found");
        }
        
        Widget widget = findById(id).orElseThrow();
        
        try {
            // Execute the widget query using DuckDB
            List<Map<String, Object>> results = duckDBService.executeQueryAsList(
                widget.getReport().getDataSource(),
                widget.getConfiguration(), // Assuming this contains the query
                null // TODO: Parse and pass parameters from widget.getFilters()
            );
            
            // For now, we're just returning the widget itself
            // In a real implementation, we would return the query results
            return List.of(widget);
        } catch (SQLException e) {
            throw new RuntimeException("Failed to execute widget: " + e.getMessage(), e);
        }
    }
} 