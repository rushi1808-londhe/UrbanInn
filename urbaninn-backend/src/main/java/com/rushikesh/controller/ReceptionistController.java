package com.rushikesh.controller;

import com.rushikesh.dto.*;
import com.rushikesh.enums.ServiceStatus;
import com.rushikesh.service.ReceptionistService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/receptionist")
@PreAuthorize("hasRole('RECEPTIONIST')")
@RequiredArgsConstructor
public class ReceptionistController {

    private final ReceptionistService receptionistService;

    // ══════════════════════════════════════
    //  CHECK-IN / CHECK-OUT
    // ══════════════════════════════════════

    // POST /api/receptionist/checkin
    @PostMapping("/checkin")
    public ResponseEntity<ApiResponse<GuestSessionResponse>> checkIn(
            @Valid @RequestBody CheckInRequest request) {
        GuestSessionResponse session = receptionistService.checkIn(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                    "Guest checked in successfully", session));
    }

    // PATCH /api/receptionist/checkout/{sessionId}
    @PatchMapping("/checkout/{sessionId}")
    public ResponseEntity<ApiResponse<BillResponse>> checkOut(
            @PathVariable Long sessionId) {
        BillResponse bill = receptionistService.checkOut(sessionId);
        return ResponseEntity.ok(
            ApiResponse.success(
                "Guest checked out successfully", bill));
    }

    // ══════════════════════════════════════
    //  GUEST MANAGEMENT
    // ══════════════════════════════════════

    // GET /api/receptionist/guests
    @GetMapping("/guests")
    public ResponseEntity<ApiResponse<List<GuestSessionResponse>>> getActiveGuests() {
        List<GuestSessionResponse> guests =
            receptionistService.getAllActiveGuests();
        return ResponseEntity.ok(
            ApiResponse.success("Active guests fetched", guests));
    }

    // GET /api/receptionist/guests/all
    @GetMapping("/guests/all")
    public ResponseEntity<ApiResponse<List<GuestSessionResponse>>> getAllGuests() {
        List<GuestSessionResponse> guests = receptionistService.getAllGuests();
        return ResponseEntity.ok(
            ApiResponse.success("All guests fetched", guests));
    }

    // GET /api/receptionist/guests/{sessionId}
    @GetMapping("/guests/{sessionId}")
    public ResponseEntity<ApiResponse<GuestSessionResponse>> getGuestById(
            @PathVariable Long sessionId) {
        GuestSessionResponse guest = receptionistService.getGuestById(sessionId);
        return ResponseEntity.ok(
            ApiResponse.success("Guest fetched", guest));
    }

    // GET /api/receptionist/guests/room/{roomId}
    @GetMapping("/guests/room/{roomId}")
    public ResponseEntity<ApiResponse<GuestSessionResponse>> getGuestByRoom(
            @PathVariable Long roomId) {
        GuestSessionResponse guest = receptionistService.getGuestByRoom(roomId);
        return ResponseEntity.ok(
            ApiResponse.success("Guest fetched", guest));
    }

    // ══════════════════════════════════════
    //  ROOMS OVERVIEW
    // ══════════════════════════════════════

    // GET /api/receptionist/rooms
    @GetMapping("/rooms")
    public ResponseEntity<ApiResponse<List<RoomResponse>>> getAllRooms() {
        List<RoomResponse> rooms = receptionistService.getAllRooms();
        return ResponseEntity.ok(
            ApiResponse.success("Rooms fetched", rooms));
    }

    // ══════════════════════════════════════
    //  SERVICE REQUESTS
    // ══════════════════════════════════════

    // GET /api/receptionist/service-requests
    @GetMapping("/service-requests")
    public ResponseEntity<ApiResponse<List<ServiceRequestResponse>>> getPending() {
        List<ServiceRequestResponse> requests =
            receptionistService.getPendingServiceRequests();
        return ResponseEntity.ok(
            ApiResponse.success("Pending service requests fetched", requests));
    }

    // GET /api/receptionist/service-requests/all
    @GetMapping("/service-requests/all")
    public ResponseEntity<ApiResponse<List<ServiceRequestResponse>>> getAll() {
        List<ServiceRequestResponse> requests =
            receptionistService.getAllServiceRequests();
        return ResponseEntity.ok(
            ApiResponse.success("All service requests fetched", requests));
    }

    // PATCH /api/receptionist/service-requests/{requestId}/status
    @PatchMapping("/service-requests/{requestId}/status")
    public ResponseEntity<ApiResponse<ServiceRequestResponse>> updateStatus(
            @PathVariable Long requestId,
            @RequestParam ServiceStatus status) {
        ServiceRequestResponse request =
            receptionistService.updateServiceRequestStatus(requestId, status);
        return ResponseEntity.ok(
            ApiResponse.success("Service request updated", request));
    }
    
    @GetMapping("/checkout/{sessionId}/bill")
    public ResponseEntity<ApiResponse<BillResponse>> getBill(
            @PathVariable Long sessionId) {
        return ResponseEntity.ok(ApiResponse.success(
            "Bill fetched",
            receptionistService.getBillBySession(sessionId)));
    }

    @GetMapping("/bills")
    public ResponseEntity<ApiResponse<List<BillResponse>>> getAllBills() {
        return ResponseEntity.ok(ApiResponse.success(
            "Bills fetched",
            receptionistService.getAllBills()));
    }
    
    @PatchMapping("/rooms/{roomId}/status")
    public ResponseEntity<ApiResponse<RoomResponse>>
            updateRoomStatus(
            @PathVariable Long roomId,
            @RequestParam String status) {
        return ResponseEntity.ok(ApiResponse.success(
            "Status updated",
            receptionistService.updateRoomStatus(
                roomId, status)));
    }
}
