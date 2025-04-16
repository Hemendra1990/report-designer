package com.reportdesigner.service.external;

import com.bipros.common.dto.AuthUserDTO;
import com.bipros.common.dto.response.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.HttpHeaders;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "designer-gateway", contextId = "identity-service", path = "/identity")
public interface IdentityServiceClient {
    @GetMapping("/user")
    AuthUserDTO getAuthUserDetails(@RequestParam("userEmail") String userEmail);

    @GetMapping("/organisation")
    ApiResponse getAllOrganisations(@RequestHeader(HttpHeaders.AUTHORIZATION) String authorizationHeader);
}