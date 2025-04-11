package com.reportdesigner.repository;

import com.reportdesigner.model.ReportType;
import com.reportdesigner.model.ReportTypeConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface ReportTypeConfigRepository extends JpaRepository<ReportTypeConfig, String> {
    @Modifying
    @Transactional
    @Query("DELETE FROM ReportTypeConfig c WHERE c.reportType.id = :reportTypeId")
    void deleteByReportTypeId(String reportTypeId);
}
