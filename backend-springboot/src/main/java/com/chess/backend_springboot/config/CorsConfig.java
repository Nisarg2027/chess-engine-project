package com.chess.backend_springboot.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**") // Apply to all endpoints in the app
                        .allowedOrigins("http://localhost:5173") // Explicitly allow your React frontend
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Explicitly allow the Preflight OPTIONS
                        .allowedHeaders("*")
                        .allowCredentials(true);
            }
        };
    }
}