package com.rushikesh.controller;

import com.rushikesh.dto.*;
import com.rushikesh.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // POST /api/auth/login
    // Used by: SuperAdmin, HotelAdmin, Receptionist, KitchenStaff
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(
            @Valid @RequestBody LoginRequest request) {

        LoginResponse response = authService.staffLogin(request);
        return ResponseEntity.ok(
            ApiResponse.success("Login successful", response)
        );
    }

    @PostMapping("/guest/login")
    public ResponseEntity<ApiResponse<GuestLoginResponse>> guestLogin(
            @RequestBody GuestLoginRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
            "Login successful",
            authService.guestLogin(request)));
    }
    
    @GetMapping("/hotels")
    public ResponseEntity<ApiResponse<List<HotelResponse>>>
            getActiveHotels() {
        return ResponseEntity.ok(ApiResponse.success(
            "Hotels fetched",
            authService.getActiveHotels()));
    }
}
