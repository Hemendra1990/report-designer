package com.reportdesigner.controller;

import com.reportdesigner.model.Widget;
import com.reportdesigner.service.DashboardService;
import com.reportdesigner.service.WidgetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/widgets")
public class WidgetController {

    private final WidgetService widgetService;
    private final DashboardService dashboardService;

    @Autowired
    public WidgetController(WidgetService widgetService, DashboardService dashboardService) {
        this.widgetService = widgetService;
        this.dashboardService = dashboardService;
    }

    @GetMapping
    public ResponseEntity<List<Widget>> getAllWidgets() {
        return ResponseEntity.ok(widgetService.findAll());
    }

    @GetMapping("/dashboard/{dashboardId}")
    public ResponseEntity<List<Widget>> getWidgetsByDashboard(@PathVariable UUID dashboardId) {
        return dashboardService.findById(dashboardId)
                .map(dashboard -> ResponseEntity.ok(widgetService.findByDashboard(dashboard)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/dashboard/{dashboardId}/active")
    public ResponseEntity<List<Widget>> getActiveWidgetsByDashboard(@PathVariable UUID dashboardId) {
        return dashboardService.findById(dashboardId)
                .map(dashboard -> ResponseEntity.ok(widgetService.findByDashboardAndActive(dashboard, true)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<Widget>> getWidgetsByType(@PathVariable String type) {
        return ResponseEntity.ok(widgetService.findByType(type));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Widget> getWidgetById(@PathVariable UUID id) {
        return widgetService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Widget> createWidget(@RequestBody Widget widget) {
        try {
            Widget created = widgetService.create(widget);
            return new ResponseEntity<>(created, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Widget> updateWidget(@PathVariable UUID id, @RequestBody Widget widget) {
        try {
            Widget updated = widgetService.update(id, widget);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWidget(@PathVariable UUID id) {
        try {
            widgetService.softDelete(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/execute")
    public ResponseEntity<List<Map<String, Object>>> executeWidget(@PathVariable UUID id) {
        try {
            List<Widget> widgets = widgetService.executeWidget(id);
            // For now, we're just returning an empty list
            // In a real implementation, we would return the query results
            return ResponseEntity.ok(List.of());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
} 