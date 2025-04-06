package com.reportdesigner.controller;

import com.reportdesigner.model.Report;
import com.reportdesigner.model.ReportType;
import com.reportdesigner.service.ReportService;
import com.reportdesigner.service.ReportTypeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;
    private final ReportTypeService reportTypeService;

    @Autowired
    public ReportController(ReportService reportService, ReportTypeService reportTypeService) {
        this.reportService = reportService;
        this.reportTypeService = reportTypeService;
    }

    @GetMapping
    public ResponseEntity<List<Report>> getAllReports() {
        return ResponseEntity.ok(reportService.findAll());
    }

    @GetMapping("/public")
    public ResponseEntity<List<Report>> getAllPublicReports() {
        return ResponseEntity.ok(reportService.findAllPublic());
    }

    @GetMapping("/type/{reportTypeId}")
    public ResponseEntity<List<Report>> getReportsByType(@PathVariable UUID reportTypeId) {
        return reportTypeService.findById(reportTypeId)
                .map(reportType -> ResponseEntity.ok(reportService.findByReportType(reportType)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/type/{reportTypeId}/active")
    public ResponseEntity<List<Report>> getActiveReportsByType(@PathVariable UUID reportTypeId) {
        return reportTypeService.findById(reportTypeId)
                .map(reportType -> ResponseEntity.ok(reportService.findByReportTypeAndActive(reportType, true)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/datasource/{dataSource}")
    public ResponseEntity<List<Report>> getReportsByDataSource(@PathVariable String dataSource) {
        return ResponseEntity.ok(reportService.findByDataSource(dataSource));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Report> getReportById(@PathVariable UUID id) {
        return reportService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Report> createReport(@RequestBody Report report) {
        try {
            Report created = reportService.create(report);
            return new ResponseEntity<>(created, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Report> updateReport(@PathVariable UUID id, @RequestBody Report report) {
        try {
            Report updated = reportService.update(id, report);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReport(@PathVariable UUID id) {
        try {
            reportService.softDelete(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/execute")
    public ResponseEntity<List<Map<String, Object>>> executeReport(@PathVariable UUID id) {
        try {
            List<Report> reports = reportService.executeReport(id);
            // For now, we're just returning an empty list
            // In a real implementation, we would return the query results
            return ResponseEntity.ok(List.of());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
} 