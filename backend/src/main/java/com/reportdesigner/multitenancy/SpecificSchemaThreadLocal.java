package com.reportdesigner.multitenancy;

import com.bipros.common.dto.AuthUserDTO;

public class SpecificSchemaThreadLocal {
    private SpecificSchemaThreadLocal() {
    }

    public static final ThreadLocal<String> SPECIFIC_SCHEMA = new ThreadLocal<>();
    public static final ThreadLocal<AuthUserDTO> AUTH_USER_DETAILS = new ThreadLocal<>();

    public static void setSpecificSchema(String value) {
        SpecificSchemaThreadLocal.SPECIFIC_SCHEMA.set(value);
    }

    public static String getSpecificSchema() {
        return SPECIFIC_SCHEMA.get();
    }

    public static void setAuthUserDetails(AuthUserDTO authUserDetails) {
        SpecificSchemaThreadLocal.AUTH_USER_DETAILS.set(authUserDetails);
    }

    public static AuthUserDTO getAuthUserDetails() {
        return AUTH_USER_DETAILS.get();
    }

    public static void clear() {
        SPECIFIC_SCHEMA.remove();
        AUTH_USER_DETAILS.remove();
    }
}