package com.reportdesigner.multitenancy;

import com.bipros.common.dto.AuthUserDTO;

public class SignUpThreadLocal {

    private SignUpThreadLocal() {
    }

    public static final ThreadLocal<String> currentSchema = new ThreadLocal<>();

    public static final ThreadLocal<AuthUserDTO> authUserDto = new ThreadLocal<>();


    public static void setCurrentSchema(String currentSchema) {
        SignUpThreadLocal.currentSchema.set(currentSchema);
    }

    public static void setAuthUserDto(AuthUserDTO authUserDto) {
        SignUpThreadLocal.authUserDto.set(authUserDto);
    }


    public static String getCurrentSchema() {
        return currentSchema.get();
    }

    public static AuthUserDTO getAuthUserDto() {
        return authUserDto.get();
    }

    public static void clearDataSourceKey() {
        currentSchema.remove();
        authUserDto.remove();
    }
}