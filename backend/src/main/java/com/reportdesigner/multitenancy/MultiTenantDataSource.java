package com.reportdesigner.multitenancy;

import com.bipros.common.dto.AuthUserDTO;
import lombok.Getter;
import lombok.extern.log4j.Log4j2;
import org.apache.commons.lang3.StringUtils;
import org.springframework.jdbc.datasource.lookup.AbstractRoutingDataSource;

import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

@Getter
@Log4j2
public class MultiTenantDataSource extends AbstractRoutingDataSource {

    public static final String BIPROS_ADMIN = "BIPROS_ADMIN";
    public static final String BIPROS_DEFAULT_ADMINISTRATOR = "Bipros Default Administrator";
    public static final String DEFAULT = "default";
    private Map<Object, Object> targetDataSourceForHouseKeeping = new HashMap<>();

    public void setTargetDataSourceForHouseKeeping(Map<Object, Object> targetDataSourceForHouseKeeping) {
        this.targetDataSourceForHouseKeeping = targetDataSourceForHouseKeeping;
    }

    @Override
    protected Object determineCurrentLookupKey() {
        // Use a strategy to determine the current user or tenant identifier
        String currentUserOrTenant = determineCurrentUserOrTenant();
        log.info("currentUserOrTenant:-- "+ currentUserOrTenant);
        return currentUserOrTenant;
    }

    private static String determineCurrentUserOrTenant() {
        String currentSchema = SignUpThreadLocal.getCurrentSchema();
        AuthUserDTO authUserDetails = AuthorizationFilter.getAuthUserDetails() != null ? AuthorizationFilter.getAuthUserDetails(): SignUpThreadLocal.getAuthUserDto();
        if(StringUtils.isNotBlank(currentSchema) && Objects.nonNull(authUserDetails) && BIPROS_ADMIN.equals(authUserDetails.getRole().getRoleName())){
            return currentSchema;
        } else if(StringUtils.isNotBlank(currentSchema)){
            return currentSchema;
        } else if (StringUtils.isNotBlank(SpecificSchemaThreadLocal.getSpecificSchema())) {
            return SpecificSchemaThreadLocal.getSpecificSchema();
        } else if(Objects.nonNull(authUserDetails) && Objects.nonNull(authUserDetails.getOrganisation()) && Objects.nonNull(authUserDetails.getOrganisation().getSchemaName())){
            String schemaName = authUserDetails.getOrganisation().getSchemaName();
            if(StringUtils.isBlank(schemaName) || DEFAULT.equals(schemaName)) {
                return DEFAULT;
            }
            if(BIPROS_DEFAULT_ADMINISTRATOR.equals(authUserDetails.getProfile().getProfileName())){
                return DEFAULT;
            }
            return schemaName;
        }

        return DEFAULT; // Replace with actual logic
    }

    public static String getSubDomainName() {
        String currentSchema = determineCurrentUserOrTenant();
        if (DEFAULT.equals(currentSchema)) {
            return "bipcrm";
        }
        return currentSchema;
    }
}