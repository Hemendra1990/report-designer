package com.reportdesigner.service.impl;

import com.reportdesigner.model.ReportType;
import com.reportdesigner.repository.ReportTypeRepository;
import com.reportdesigner.service.BaseServiceImpl;
import com.reportdesigner.service.ReportTypeService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class ReportTypeServiceImpl extends BaseServiceImpl<ReportType, ReportTypeRepository> implements ReportTypeService {

    public ReportTypeServiceImpl(ReportTypeRepository repository) {
        super(repository);
    }

    @Override
    public List<ReportType> findAllActive() {
        return repository.findByActiveTrue();
    }

    @Override
    public List<ReportType> findAllPublic() {
        return repository.findByIsPublicTrueAndActiveTrue();
    }

    @Override
    public Optional<ReportType> findByName(String name) {
        return repository.findAll().stream()
                .filter(reportType -> reportType.getName().equals(name))
                .findFirst();
    }

    @Override
    public boolean existsByName(String name) {
        return repository.existsByName(name);
    }

    @Override
    public ReportType create(ReportType reportType) {
        if (existsByName(reportType.getName())) {
            throw new IllegalArgumentException("Report type with name " + reportType.getName() + " already exists");
        }
        return save(reportType);
    }

    @Override
    public ReportType update(UUID id, ReportType reportType) {
        if (!existsById(id)) {
            throw new IllegalArgumentException("Report type with id " + id + " not found");
        }
        
        ReportType existingReportType = findById(id).orElseThrow();
        
        // Check if the name is being changed and if it already exists
        if (!existingReportType.getName().equals(reportType.getName()) && existsByName(reportType.getName())) {
            throw new IllegalArgumentException("Report type with name " + reportType.getName() + " already exists");
        }
        
        reportType.setId(existingReportType.getId());
        return save(reportType);
    }

    @Override
    public void softDelete(UUID id) {
        if (!existsById(id)) {
            throw new IllegalArgumentException("Report type with id " + id + " not found");
        }
        
        ReportType reportType = findById(id).orElseThrow();
        reportType.setActive(false);
        save(reportType);
    }
} 