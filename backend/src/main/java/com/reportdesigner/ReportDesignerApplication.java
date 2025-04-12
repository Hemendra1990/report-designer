package com.reportdesigner;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableJpaAuditing
@EnableConfigurationProperties
public class ReportDesignerApplication {

    public static void main(String[] args) {
        SpringApplication.run(ReportDesignerApplication.class, args);
    }
} 