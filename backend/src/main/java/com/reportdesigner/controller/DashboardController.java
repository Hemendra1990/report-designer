package com.reportdesigner.controller;

import com.reportdesigner.model.Dashboard;
import com.reportdesigner.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/dashboards")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    public ResponseEntity<List<Dashboard>> getAllDashboards() {
        return ResponseEntity.ok(dashboardService.findAll());
    }

    @GetMapping("/public")
    public ResponseEntity<List<Dashboard>> getAllPublicDashboards() {
        return ResponseEntity.ok(dashboardService.findAllPublic());
    }

    @GetMapping("/published")
    public ResponseEntity<List<Dashboard>> getAllPublishedDashboards() {
        return ResponseEntity.ok(dashboardService.findAllPublished());
    }

    @GetMapping("/publish-url/{publishUrl}")
    public ResponseEntity<Dashboard> getDashboardByPublishUrl(@PathVariable String publishUrl) {
        return dashboardService.findByPublishUrl(publishUrl)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Dashboard> getDashboardById(@PathVariable UUID id) {
        return dashboardService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Dashboard> updateDashboard(@PathVariable UUID id, @RequestBody Dashboard dashboard) {
        try {
            Dashboard updated = dashboardService.update(id, dashboard);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDashboard(@PathVariable UUID id) {
        try {
            dashboardService.softDelete(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/publish")
    public ResponseEntity<Dashboard> publishDashboard(@PathVariable UUID id) {
        try {
            Dashboard published = dashboardService.publish(id);
            return ResponseEntity.ok(published);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/unpublish")
    public ResponseEntity<Dashboard> unpublishDashboard(@PathVariable UUID id) {
        try {
            Dashboard unpublished = dashboardService.unpublish(id);
            return ResponseEntity.ok(unpublished);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
} 