package com.reportdesigner.repository;

import com.reportdesigner.model.Dashboard;
import com.reportdesigner.model.Report;
import com.reportdesigner.model.Widget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface WidgetRepository extends JpaRepository<Widget, UUID> {
    List<Widget> findByDashboard(Dashboard dashboard);
    List<Widget> findByDashboardAndActiveTrue(Dashboard dashboard);
    List<Widget> findByReport(Report report);
    List<Widget> findByReportAndActiveTrue(Report report);
    List<Widget> findByType(String type);
    boolean existsByNameAndDashboard(String name, Dashboard dashboard);
} 