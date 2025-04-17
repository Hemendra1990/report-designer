package com.reportdesigner.config;

import com.reportdesigner.multitenancy.AuthorizationFilter;
import feign.RequestInterceptor;
import feign.RequestTemplate;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;

import static com.bipros.common.utils.RouteValidator.isPublicApi;

@Configuration
public class FeignClientInterceptor implements RequestInterceptor {
    @Override
    public void apply(RequestTemplate requestTemplate) {
        // If the request is for secured api then we need to add Authorization header. Adding Authorization header for open api will cause 401 error.(Spring Security issue)
        if (!isPublicApi(requestTemplate.path())) {
            requestTemplate.header(HttpHeaders.AUTHORIZATION, AuthorizationFilter.getBearerToken());
        }
    }
}