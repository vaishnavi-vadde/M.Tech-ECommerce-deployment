package com.klu.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.klu.dto.AuthResponse;
import com.klu.dto.SigninRequest;
import com.klu.dto.SignupRequest;
import com.klu.model.User;
import com.klu.repository.UserRepository;
import com.klu.security.CustomUserDetailsService;
import com.klu.service.JwtService;
import com.klu.service.UserService;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(
    origins = {
        "http://localhost:5173",
        "http://localhost:5174"
    },
    allowCredentials = "true"
)
public class AuthController {

    private final UserService userService;
    private final CustomUserDetailsService userDetailsService;
    private final JwtService jwtService;
    private final UserRepository userRepository;

    public AuthController(
            UserService userService,
            CustomUserDetailsService userDetailsService,
            JwtService jwtService,
            UserRepository userRepository) {

        this.userService = userService;
        this.userDetailsService = userDetailsService;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    // ==============================
    // SIGNUP
    // ==============================

    @PostMapping("/signup")
    public ResponseEntity<String> signup(
            @RequestBody SignupRequest request) {

        return ResponseEntity.ok(
                userService.signup(request)
        );
    }

    // ==============================
    // SIGNIN - JWT
    // ==============================

    @PostMapping("/signin")
    public ResponseEntity<?> signin(
            @RequestBody SigninRequest request) {

        try {

            // Validate email and password
            AuthResponse response =
                    userService.signin(request);

            if (response == null) {

                return ResponseEntity
                        .status(401)
                        .body("Invalid email or password");
            }

            // Find actual user
            User user =
                    userRepository.findByEmail(
                            request.getEmail()
                    )
                    .orElseThrow(
                        () -> new RuntimeException(
                            "User not found"
                        )
                    );

            // Generate JWT
            String token =
                    jwtService.generateToken(user);

            // Return user information + JWT
            AuthResponse jwtResponse =
                    new AuthResponse(
                            user.getUserId(),
                            user.getName(),
                            user.getEmail(),
                            user.getRole(),
                            "Login successful",
                            token
                    );

            return ResponseEntity.ok(jwtResponse);

        } catch (Exception exception) {

            exception.printStackTrace();

            return ResponseEntity
                    .status(401)
                    .body("Invalid email or password");
        }
    }

    // ==============================
    // CURRENT USER
    // ==============================

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(
            org.springframework.security.core.Authentication authentication) {

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            return ResponseEntity
                    .status(401)
                    .body("Not authenticated");
        }

        String email =
                authentication.getName();

        User user =
                userRepository.findByEmail(email)
                .orElseThrow(
                    () -> new RuntimeException(
                        "User not found"
                    )
                );

        AuthResponse response =
                new AuthResponse(
                        user.getUserId(),
                        user.getName(),
                        user.getEmail(),
                        user.getRole(),
                        "Authenticated",
                        null
                );

        return ResponseEntity.ok(response);
    }

    // ==============================
    // LOGOUT
    // ==============================

    @PostMapping("/logout")
    public ResponseEntity<String> logout() {

        // JWT is stateless.
        // Frontend removes the token.

        return ResponseEntity.ok(
                "Logged out successfully"
        );
    }
}