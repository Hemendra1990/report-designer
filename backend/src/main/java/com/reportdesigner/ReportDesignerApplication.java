package com.reportdesigner;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeIn;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.security.SecuritySchemes;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients
@EnableJpaAuditing
@EnableConfigurationProperties
@EnableAsync
@OpenAPIDefinition(
        info = @Info(
                title = "Report Designer",
                version = "1.0.0",
                description = "",
                contact = @Contact(name = "Unity Sphere", email = "support@bipros.com", url = "http://bipros.unity-sphere.com")
        ),
        servers = {@Server(url = "http://14.141.154.146:8089"), @Server(url = "http://localhost:8089/rd")}
)
@SecuritySchemes({
        @SecurityScheme(type = SecuritySchemeType.HTTP,
                name = "bearerAuth",
                in = SecuritySchemeIn.HEADER,
                bearerFormat = "jwt",
                scheme = "bearer"
        )
})
public class ReportDesignerApplication {

    public static void main(String[] args) {
        SpringApplication.run(ReportDesignerApplication.class, args);
    }
} 