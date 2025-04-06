package com.reportdesigner.repository;

import com.reportdesigner.model.ReportType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ReportTypeRepository extends JpaRepository<ReportType, UUID> {
    List<ReportType> findByActiveTrue();
    List<ReportType> findByIsPublicTrueAndActiveTrue();
    boolean existsByName(String name);
} 