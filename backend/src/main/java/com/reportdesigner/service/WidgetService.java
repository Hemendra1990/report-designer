package com.reportdesigner.service;

import com.reportdesigner.model.Dashboard;
import com.reportdesigner.model.Report;
import com.reportdesigner.model.Widget;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface WidgetService extends BaseService<Widget> {
    List<Widget> findByDashboard(Dashboard dashboard);
    List<Widget> findByDashboardAndActive(Dashboard dashboard, boolean active);
    List<Widget> findByReport(Report report);
    List<Widget> findByReportAndActive(Report report, boolean active);
    List<Widget> findByType(String type);
    boolean existsByNameAndDashboard(String name, Dashboard dashboard);
    Widget create(Widget widget);
    Widget update(UUID id, Widget widget);
    void softDelete(UUID id);
    List<Widget> executeWidget(UUID id);
} 