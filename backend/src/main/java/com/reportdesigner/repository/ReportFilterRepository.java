package com.reportdesigner.repository;

import com.reportdesigner.model.ReportFilter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface ReportFilterRepository extends JpaRepository<ReportFilter, String> {
    @Modifying
    @Transactional
    @Query("DELETE FROM ReportFilter r WHERE r.report.id = :reportId")
    void deleteByReportId(String reportId);
}
