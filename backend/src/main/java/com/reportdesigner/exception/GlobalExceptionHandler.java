package com.reportdesigner.exception;

import com.reportdesigner.constant.ErrorCode;
import com.reportdesigner.dto.ErrorResponse;
import org.hibernate.service.spi.ServiceException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.validation.ObjectError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler({ValidationException.class, ServiceException.class, DataAccessException.class, MethodArgumentNotValidException.class})
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public final ResponseEntity<ErrorResponse> handleException(Exception ex){
        HttpStatus status = HttpStatus.INTERNAL_SERVER_ERROR;
        ErrorResponse errorResponse = new ErrorResponse();
        if(ex instanceof  DataAccessException){
            errorResponse.setMessage("Server processing exception during request");
            errorResponse.setErrorCode(ErrorCode.ERR_DB.toString());
            errorResponse.setErrorReason(ex.getMessage());
            logger.error("DB error - {}", ex.getMessage(), ex);
        } else if (ex instanceof  AppExceptionBase) {
            AppExceptionBase appException = (AppExceptionBase) ex;
            if (appException.getStatus() != null) {
                status = appException.getStatus();
            }
            errorResponse.setMessage(ex.getMessage());
            errorResponse.setErrorCode(appException.getErrorCode().toString());
            errorResponse.setErrorReason(appException.getErrorReason());
        } else if (ex instanceof  MethodArgumentNotValidException) {
            MethodArgumentNotValidException exception = (MethodArgumentNotValidException) ex;
            List<ObjectError> allErrors = exception.getBindingResult().getAllErrors();
            String className = exception.getParameter().getMethod().getDeclaringClass().getName();
            String methodName = exception.getParameter().getMethod().getName();
            String field = ((FieldError) allErrors.get(0)).getField();
            errorResponse.setMessage(field + " " + allErrors.get(0).getDefaultMessage());
            errorResponse.setErrorCode(ErrorCode.ERR_INVALID_REQUEST.name());
            errorResponse.setErrorReason(className.substring(className.lastIndexOf(".") + 1) + "." + methodName);
        } else {
            errorResponse.setMessage(ex.getMessage());
            errorResponse.setErrorCode(ErrorCode.ERR_UNKNOWN.toString());
            errorResponse.setErrorReason(ex.getCause()!=null?ex.getCause().toString():"unknown");
        }
        errorResponse.setStatus(status.toString());
        return new ResponseEntity<>(errorResponse, status);
    }
}