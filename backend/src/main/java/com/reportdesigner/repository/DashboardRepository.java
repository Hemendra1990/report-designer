package com.reportdesigner.repository;

import com.reportdesigner.model.Dashboard;
import com.reportdesigner.model.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DashboardRepository extends JpaRepository<Dashboard, UUID> {
    List<Dashboard> findByReport(Report report);
    List<Dashboard> findByReportAndActiveTrue(Report report);
    List<Dashboard> findByIsPublicTrueAndActiveTrue();
    List<Dashboard> findByPublishedTrueAndActiveTrue();
    Optional<Dashboard> findByPublishUrl(String publishUrl);
    boolean existsByNameAndReport(String name, Report report);
} 