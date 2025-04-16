package com.reportdesigner.multitenancy;

import com.bipros.common.dto.response.ApiResponse;
import com.bipros.common.exception.ValidationException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping(value = "/api/multitenancy")
@RequiredArgsConstructor
public class MultiTenancyController {

    private final MultiTenancyService multiTenancyService;

    @PostMapping("/create-schema-and-initialize")
    public ApiResponse createAndInitializeSchema(@RequestParam String schemaName)
            throws ValidationException, IOException {
        String schema = multiTenancyService.createAndInitializeSchema(schemaName);
        return ApiResponse.builder()
                .message("Schema Created and initialized Successfully")
                .status(HttpStatus.OK.toString())
                .total(null)
                .data(schema).build();
    }

    @PostMapping("/create-org-schema")
    public ApiResponse createAndInitializeOrgSchema(HttpServletRequest request) {
        List<String> initializeOrgSchema = multiTenancyService.createAndInitializeOrgSchema(request);
        return ApiResponse.builder()
                .message("Schema Created and initialized Successfully")
                .status(HttpStatus.OK.toString())
                .total(null)
                .data(initializeOrgSchema).build();
    }
}