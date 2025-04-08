package com.reportdesigner.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public abstract class BaseResponse {
    private String status;
    private String message;
}