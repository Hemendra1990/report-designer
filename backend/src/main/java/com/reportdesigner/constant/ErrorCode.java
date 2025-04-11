package com.reportdesigner.constant;

public enum ErrorCode {

    ERR_INVALID_REQUEST("INVALID_REQUEST"),
    ERR_PROCESSING("ERROR_IN_APPLICATION"),
    ERR_DB("DB_ERROR"),
    NOT_ALLOWED("NOT_ALLOWED"), EMPTY_OR_NULL_VALUE_FOUND("EMPTY_OR_NULL_VALUE_FOUND"),
    ERR_UNKNOWN("UNKNOWN_REASON"), ERR_RESOURCE_NOT_FOUND("RESOURCE_NOT_FOUND"), FORBIDDEN("FORBIDDEN");

    private String errorCodeValue;

    ErrorCode(String errorCodeValue){
        this.errorCodeValue = errorCodeValue;
    }

    @Override
    public String toString() {
        return errorCodeValue;
    }
}