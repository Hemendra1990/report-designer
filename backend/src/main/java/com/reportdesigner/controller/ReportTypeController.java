package com.reportdesigner.controller;

import com.reportdesigner.model.ReportType;
import com.reportdesigner.service.ReportTypeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/report-types")
public class ReportTypeController {

    private final ReportTypeService reportTypeService;

    @Autowired
    public ReportTypeController(ReportTypeService reportTypeService) {
        this.reportTypeService = reportTypeService;
    }

    @GetMapping
    public ResponseEntity<List<ReportType>> getAllReportTypes() {
        return ResponseEntity.ok(reportTypeService.findAll());
    }

    @GetMapping("/active")
    public ResponseEntity<List<ReportType>> getAllActiveReportTypes() {
        return ResponseEntity.ok(reportTypeService.findAllActive());
    }

    @GetMapping("/public")
    public ResponseEntity<List<ReportType>> getAllPublicReportTypes() {
        return ResponseEntity.ok(reportTypeService.findAllPublic());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReportType> getReportTypeById(@PathVariable UUID id) {
        return reportTypeService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/name/{name}")
    public ResponseEntity<ReportType> getReportTypeByName(@PathVariable String name) {
        return reportTypeService.findByName(name)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ReportType> createReportType(@RequestBody ReportType reportType) {
        try {
            ReportType created = reportTypeService.create(reportType);
            return new ResponseEntity<>(created, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ReportType> updateReportType(@PathVariable UUID id, @RequestBody ReportType reportType) {
        try {
            ReportType updated = reportTypeService.update(id, reportType);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReportType(@PathVariable UUID id) {
        try {
            reportTypeService.softDelete(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
} 