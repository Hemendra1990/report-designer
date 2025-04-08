package com.reportdesigner.service;

import com.reportdesigner.model.Dashboard;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DashboardService extends BaseService<Dashboard> {
    List<Dashboard> findAllPublic();
    List<Dashboard> findAllPublished();
    Optional<Dashboard> findByPublishUrl(String publishUrl);
    Dashboard update(UUID id, Dashboard dashboard);
    void softDelete(UUID id);
    Dashboard publish(UUID id);
    Dashboard unpublish(UUID id);
} 