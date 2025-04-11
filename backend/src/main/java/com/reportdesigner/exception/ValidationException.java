package com.reportdesigner.exception;

import com.reportdesigner.constant.ErrorCode;
import org.springframework.http.HttpStatus;

public class ValidationException extends AppExceptionBase {

	private static final long serialVersionUID = 1L;

	public ValidationException(String message, ErrorCode errorCode, String reason){
        super(message, HttpStatus.BAD_REQUEST, errorCode, reason);
    }
}