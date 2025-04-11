package com.reportdesigner.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ErrorResponse extends BaseResponse {
    private String errorCode;
    private String errorReason;
}