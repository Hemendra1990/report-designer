package com.reportdesigner.service.external;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.Set;

@FeignClient(name = "designer-gateway", path = "/builder", contextId = "app-builder")
public interface AppBuilderServiceClient {
    @GetMapping("/api/application/project-management/check-permission/{orgId}")
    public Boolean checkPermissionProjectManagementAppBySchema(@PathVariable String orgId);

    @GetMapping("/api/application/type/{appType}")
    Set<String> getOrgIdsByAppType(@PathVariable String appType);
}