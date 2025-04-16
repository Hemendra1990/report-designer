package com.reportdesigner.multitenancy;

import com.bipros.common.dto.AuthUserDTO;
import com.bipros.common.exception.UnAuthorizedException;
import com.reportdesigner.service.external.IdentityServiceClient;
import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.Objects;

@Log4j2
@Component
@RequiredArgsConstructor
public class AuthorizationFilter implements Filter {
    private final IdentityServiceClient identityServiceClient;
    private static final ThreadLocal<AuthUserDTO> authUserDetailsThreadLocal = new InheritableThreadLocal<>();
    private static final ThreadLocal<String> bearerTokenThreadLocal = new InheritableThreadLocal<>();


    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain filterChain) throws IOException, ServletException {
        try {

            HttpServletRequest httpServletRequest = (HttpServletRequest) request;
            String bearerToken = httpServletRequest.getHeader("Authorization");
            if (StringUtils.isBlank(bearerToken) || !bearerToken.startsWith("Bearer ") || StringUtils.isBlank(bearerToken.substring(7))) {
                log.error("Error in AuthorizationFilter, Reason: Token not provided");
                filterChain.doFilter(httpServletRequest, response);
                throw new UnAuthorizedException("Authorization header is missing");
            }
            bearerTokenThreadLocal.set(bearerToken);
            String loggedInUser = httpServletRequest.getHeader("loggedInUser");
            log.info("loggedInUser: {}", loggedInUser);
            if (StringUtils.isBlank(loggedInUser)) {
                throw new UnAuthorizedException("Apis should be called by the gateway only.");
            }
            AuthUserDTO authUserDetails = identityServiceClient.getAuthUserDetails(loggedInUser);
            authUserDetailsThreadLocal.set(authUserDetails);
            filterChain.doFilter(httpServletRequest, response);
        } finally {
            authUserDetailsThreadLocal.remove();
            bearerTokenThreadLocal.remove();
        }
    }

    public static AuthUserDTO getAuthUserDetails() {
        return authUserDetailsThreadLocal.get();
    }

    public static String getBearerToken() {
        return bearerTokenThreadLocal.get();
    }

    public static ZoneOffset getUserTimeZoneOffset() {
        return ZonedDateTime.now(getUserTimeZone()).getOffset();
    }

    public static ZoneId getUserTimeZone() {
        AuthUserDTO authUserDetails = getAuthUserDetails();
        if (Objects.nonNull(authUserDetails) && StringUtils.isNotBlank(authUserDetails.getTimeZone())) {
            return ZoneId.of(authUserDetails.getTimeZone());
        } else if (Objects.nonNull(authUserDetails) && StringUtils.isNotBlank(authUserDetails.getOrganisation().getTimeZone())) {
            return ZoneId.of(authUserDetails.getOrganisation().getTimeZone());
        } else {
            return ZoneId.systemDefault();
        }
    }
}