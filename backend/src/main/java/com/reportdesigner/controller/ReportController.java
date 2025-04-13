package com.reportdesigner.controller;

import com.reportdesigner.dto.ApiResponse;
import com.reportdesigner.dto.ReportDTO;
import com.reportdesigner.exception.ValidationException;
import com.reportdesigner.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/report")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping
    public ApiResponse findAll() {
        List<ReportDTO> resp = reportService.findBasicDetails();
        return ApiResponse.builder()
                .status(HttpStatus.OK.toString())
                .data(resp)
                .message("All report details")
                .build();
    }

    @PostMapping
    public ApiResponse create(@RequestBody ReportDTO report) throws ValidationException {
        ReportDTO resp = reportService.create(report);
        return ApiResponse.builder()
                .status(HttpStatus.CREATED.toString())
                .data(resp)
                .message("Report created successfully")
                .build();
    }

    @PutMapping("/{id}")
    public ApiResponse update(@PathVariable String id, @RequestBody ReportDTO report) throws ValidationException {
        report.setId(id);
        ReportDTO resp = reportService.create(report);
        return ApiResponse.builder()
                .status(HttpStatus.CREATED.toString())
                .data(resp)
                .message("Report updated successfully")
                .build();
    }

    @GetMapping("/{reportId}")
    public ApiResponse getById(@PathVariable String reportId) throws ValidationException {
        ReportDTO resp = reportService.findById(reportId);
        return ApiResponse.builder()
                .status(HttpStatus.OK.toString())
                .data(resp)
                .message("Report details")
                .build();
    }
}
