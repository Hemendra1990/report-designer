package com.reportdesigner.exception;

import com.reportdesigner.constant.ErrorCode;
import lombok.Data;
import org.springframework.http.HttpStatus;

@Data
public abstract class AppExceptionBase extends Exception {

	private static final long serialVersionUID = 1L;
	private HttpStatus status;
    private ErrorCode errorCode;
    private String errorReason;

    public AppExceptionBase(String message){
        super(message);
    }

    public AppExceptionBase(String message, HttpStatus status, ErrorCode errorCode, String errorReason){
        super(message);
        this.status = status;
        this.errorCode = errorCode;
        this.errorReason = errorReason;
    }
}