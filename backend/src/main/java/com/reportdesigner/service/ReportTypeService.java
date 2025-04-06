package com.reportdesigner.service;

import com.reportdesigner.model.ReportType;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ReportTypeService extends BaseService<ReportType> {
    List<ReportType> findAllActive();
    List<ReportType> findAllPublic();
    Optional<ReportType> findByName(String name);
    boolean existsByName(String name);
    ReportType create(ReportType reportType);
    ReportType update(UUID id, ReportType reportType);
    void softDelete(UUID id);
} 