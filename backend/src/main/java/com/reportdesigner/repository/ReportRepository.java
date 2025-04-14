package com.reportdesigner.repository;

import com.reportdesigner.dto.ReportDTO;
import com.reportdesigner.model.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, String> {
    @Query("""
        SELECT new com.reportdesigner.dto.ReportDTO(
            r.id, r.name, r.label, r.reportType.name, r.reportType.primaryTable, r.reportType.usedTables)
        FROM Report r
    """)
    List<ReportDTO> findBasicDetails();

    boolean existsByNameAndIdNot(String name, String id);
    boolean existsByName(String name);
}
