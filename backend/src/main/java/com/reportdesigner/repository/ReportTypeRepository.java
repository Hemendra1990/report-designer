package com.reportdesigner.repository;

import com.reportdesigner.model.ReportType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReportTypeRepository extends JpaRepository<ReportType, String> {
    boolean existsByNameAndIdNot(String name, String id);
    boolean existsByName(String name);
}
