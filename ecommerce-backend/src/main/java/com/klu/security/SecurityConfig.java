package com.klu.security;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter) {

        this.jwtAuthenticationFilter =
                jwtAuthenticationFilter;
    }

    // =========================================
    // AUTHENTICATION MANAGER
    // =========================================

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration)
            throws Exception {

        return configuration.getAuthenticationManager();
    }

    // =========================================
    // SECURITY CONFIGURATION
    // =========================================

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http)
            throws Exception {

        http

            // CORS
            .cors(cors ->
                cors.configurationSource(
                    corsConfigurationSource()
                )
            )

            // Disable CSRF for REST API
            .csrf(csrf -> csrf.disable())

            // JWT is stateless
            .sessionManagement(session ->
                session.sessionCreationPolicy(
                    SessionCreationPolicy.STATELESS
                )
            )

            // =====================================
            // AUTHORIZATION
            // =====================================

            .authorizeHttpRequests(auth -> auth

                // CORS preflight
                .requestMatchers(
                    HttpMethod.OPTIONS,
                    "/**"
                ).permitAll()

                // Signup / Signin
                .requestMatchers(
                    "/api/auth/**"
                ).permitAll()

                // Razorpay webhook
                .requestMatchers(
                    "/api/payment/webhook"
                ).permitAll()

                // WebSocket handshake
                .requestMatchers(
                    "/ws-smartcart/**"
                ).permitAll()

                // View products - everyone
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/products/**"
                ).permitAll()

                // Add product - ADMIN
                .requestMatchers(
                    HttpMethod.POST,
                    "/api/products/**"
                ).hasRole("ADMIN")

                // Update product - ADMIN
                .requestMatchers(
                    HttpMethod.PUT,
                    "/api/products/**"
                ).hasRole("ADMIN")

                // Delete product - ADMIN
                .requestMatchers(
                    HttpMethod.DELETE,
                    "/api/products/**"
                ).hasRole("ADMIN")

                // Create order - logged-in USER/ADMIN
                .requestMatchers(
                    HttpMethod.POST,
                    "/api/orders"
                ).authenticated()

                // Create Razorpay payment
                .requestMatchers(
                    HttpMethod.POST,
                    "/api/payment/create/**"
                ).authenticated()

                // Verify Razorpay payment
                .requestMatchers(
                    HttpMethod.POST,
                    "/api/payment/verify"
                ).authenticated()

                // Background jobs
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/jobs"
                ).authenticated()

                // Everything else requires JWT
                .anyRequest().authenticated()
            )

            // =====================================
            // ADD JWT FILTER
            // =====================================

            .addFilterBefore(
                jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }

    // =========================================
    // CORS CONFIGURATION
    // =========================================

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration =
                new CorsConfiguration();

        configuration.setAllowedOrigins(
                List.of(
                    "http://localhost:5173",
                    "http://localhost:5174",
                     "https://m-tech-e-commerce-deployment-psi.vercel.app"
                )
        );

        configuration.setAllowedMethods(
                List.of(
                    "GET",
                    "POST",
                    "PUT",
                    "DELETE",
                    "OPTIONS"
                )
        );

        configuration.setAllowedHeaders(
                List.of(
                    "Authorization",
                    "Content-Type",
                    "X-User-Email"
                )
        );

        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration
        );

        return source;
    }
}
