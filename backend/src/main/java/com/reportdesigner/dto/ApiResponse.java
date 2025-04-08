package com.reportdesigner.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse extends BaseResponse {
    private Number total;
    private Object data;
    private Number totalPages;
    private Number pageNum;
    private Object columns;
    private Long errorCode;
    private Boolean isSuccess;
    private Number pageSize;

    public ApiResponse() {
        total = 0L;
        data = null;
        totalPages = null;
        pageNum = null;
        columns = null;
        pageSize = null;
    }

    @Builder
    public ApiResponse(Number total, Object data, Number totalPages, Number pageNum, String message, String status, Object columns, Long errorCode, Boolean isSuccess, Number pageSize) {
        this.setMessage(message);
        this.setStatus(status);
        this.total = total;
        this.data = data;
        this.totalPages = totalPages;
        this.pageNum = pageNum;
        this.columns = columns;
        this.errorCode = errorCode;
        this.isSuccess = isSuccess;
        this.pageSize = pageSize;
    }
}