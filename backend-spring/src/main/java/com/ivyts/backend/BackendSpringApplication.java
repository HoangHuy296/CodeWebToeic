package com.ivyts.backend;

import com.ivyts.backend.config.properties.AppCorsProperties;
import com.ivyts.backend.config.properties.JwtProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableConfigurationProperties({AppCorsProperties.class, JwtProperties.class})
@EnableJpaAuditing
public class BackendSpringApplication {

    public static void main(String[] args) {
        SpringApplication.run(BackendSpringApplication.class, args);
    }
}
