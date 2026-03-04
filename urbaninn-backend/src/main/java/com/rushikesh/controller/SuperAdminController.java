package com.rushikesh.controller;

import com.rushikesh.dto.*;
import com.rushikesh.service.SuperAdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/superadmin")
@PreAuthorize("hasRole('SUPER_ADMIN')")
@RequiredArgsConstructor
public class SuperAdminController {

    private final SuperAdminService superAdminService;

    // ══════════════════════════════════════
    //  HOTEL ENDPOINTS
    // ══════════════════════════════════════

    // POST /api/superadmin/hotels
    @PostMapping("/hotels")
    public ResponseEntity<ApiResponse<HotelResponse>> createHotel(
            @Valid @RequestBody HotelRequest request) {
        HotelResponse hotel = superAdminService.createHotel(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Hotel created successfully", hotel));
    }

    // GET /api/superadmin/hotels
    @GetMapping("/hotels")
    public ResponseEntity<ApiResponse<List<HotelResponse>>> getAllHotels() {
        List<HotelResponse> hotels = superAdminService.getAllHotels();
        return ResponseEntity.ok(
            ApiResponse.success("Hotels fetched successfully", hotels));
    }

    // GET /api/superadmin/hotels/{hotelId}
    @GetMapping("/hotels/{hotelId}")
    public ResponseEntity<ApiResponse<HotelResponse>> getHotel(
            @PathVariable Long hotelId) {
        HotelResponse hotel = superAdminService.getHotelById(hotelId);
        return ResponseEntity.ok(
            ApiResponse.success("Hotel fetched successfully", hotel));
    }

    // PUT /api/superadmin/hotels/{hotelId}
    @PutMapping("/hotels/{hotelId}")
    public ResponseEntity<ApiResponse<HotelResponse>> updateHotel(
            @PathVariable Long hotelId,
            @Valid @RequestBody HotelRequest request) {
        HotelResponse hotel = superAdminService.updateHotel(hotelId, request);
        return ResponseEntity.ok(
            ApiResponse.success("Hotel updated successfully", hotel));
    }

    // PATCH /api/superadmin/hotels/{hotelId}/toggle-status
    @PatchMapping("/hotels/{hotelId}/toggle-status")
    public ResponseEntity<ApiResponse<HotelResponse>> toggleHotelStatus(
            @PathVariable Long hotelId) {
        HotelResponse hotel = superAdminService.toggleHotelStatus(hotelId);
        return ResponseEntity.ok(
            ApiResponse.success("Hotel status updated", hotel));
    }

    // DELETE /api/superadmin/hotels/{hotelId}
    @DeleteMapping("/hotels/{hotelId}")
    public ResponseEntity<ApiResponse<Void>> deleteHotel(
            @PathVariable Long hotelId) {
        superAdminService.deleteHotel(hotelId);
        return ResponseEntity.ok(
            ApiResponse.success("Hotel deleted successfully"));
    }

    // ══════════════════════════════════════
    //  STAFF ENDPOINTS
    // ══════════════════════════════════════

    // POST /api/superadmin/staff
    @PostMapping("/staff")
    public ResponseEntity<ApiResponse<StaffResponse>> createStaff(
            @Valid @RequestBody CreateStaffRequest request) {
        StaffResponse staff = superAdminService.createStaff(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Staff created successfully", staff));
    }

    // GET /api/superadmin/staff
    @GetMapping("/staff")
    public ResponseEntity<ApiResponse<List<StaffResponse>>> getAllStaff() {
        List<StaffResponse> staff = superAdminService.getAllStaff();
        return ResponseEntity.ok(
            ApiResponse.success("Staff fetched successfully", staff));
    }

    // GET /api/superadmin/staff/hotel/{hotelId}
    @GetMapping("/staff/hotel/{hotelId}")
    public ResponseEntity<ApiResponse<List<StaffResponse>>> getStaffByHotel(
            @PathVariable Long hotelId) {
        List<StaffResponse> staff = superAdminService.getStaffByHotel(hotelId);
        return ResponseEntity.ok(
            ApiResponse.success("Staff fetched successfully", staff));
    }

    // PUT /api/superadmin/staff/{userId}
    @PutMapping("/staff/{userId}")
    public ResponseEntity<ApiResponse<StaffResponse>> updateStaff(
            @PathVariable Long userId,
            @Valid @RequestBody CreateStaffRequest request) {
        StaffResponse staff = superAdminService.updateStaff(userId, request);
        return ResponseEntity.ok(
            ApiResponse.success("Staff updated successfully", staff));
    }

    // PATCH /api/superadmin/staff/{userId}/toggle-status
    @PatchMapping("/staff/{userId}/toggle-status")
    public ResponseEntity<ApiResponse<StaffResponse>> toggleStaffStatus(
            @PathVariable Long userId) {
        StaffResponse staff = superAdminService.toggleStaffStatus(userId);
        return ResponseEntity.ok(
            ApiResponse.success("Staff status updated", staff));
    }

    // DELETE /api/superadmin/staff/{userId}
    @DeleteMapping("/staff/{userId}")
    public ResponseEntity<ApiResponse<Void>> deleteStaff(
            @PathVariable Long userId) {
        superAdminService.deleteStaff(userId);
        return ResponseEntity.ok(
            ApiResponse.success("Staff deleted successfully"));
    }
}
