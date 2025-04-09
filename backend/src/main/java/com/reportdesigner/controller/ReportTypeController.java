package com.reportdesigner.controller;

import com.reportdesigner.dto.ApiResponse;
import com.reportdesigner.dto.ReportTypeDTO;
import com.reportdesigner.dto.ReportTypeLayoutDTO;
import com.reportdesigner.exception.ValidationException;
import com.reportdesigner.service.ReportTypeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/report-type")
@RequiredArgsConstructor
public class ReportTypeController {

    private final ReportTypeService reportTypeService;

    @GetMapping
    public ApiResponse findAll() {
        List<ReportTypeDTO> resp = reportTypeService.getAllReportType();
        return ApiResponse.builder()
                .status(HttpStatus.OK.toString())
                .data(resp)
                .message("All report type")
                .build();
    }

    @PostMapping
    public ApiResponse create(@RequestBody ReportTypeDTO reportType) throws ValidationException {
        ReportTypeDTO resp = reportTypeService.saveOrUpdate(reportType);
        return ApiResponse.builder()
                .status(HttpStatus.CREATED.toString())
                .data(resp)
                .message("Report type created successfully")
                .build();
    }

    @GetMapping("/{reportTypeId}")
    public ApiResponse getById(@PathVariable String reportTypeId) throws ValidationException {
        ReportTypeDTO resp = reportTypeService.getReportTypeById(reportTypeId);
        return ApiResponse.builder()
                .status(HttpStatus.OK.toString())
                .data(resp)
                .message("Report type details")
                .build();
    }

    @PutMapping("/layout/update-status")
    public ApiResponse updateLayoutStatus(@RequestBody List<ReportTypeLayoutDTO> layoutList) {
        reportTypeService.updateLayoutStatus(layoutList);
        return ApiResponse.builder()
                .status(HttpStatus.CREATED.toString())
                .message("Report type layout updated successfully")
                .build();
    }

}
