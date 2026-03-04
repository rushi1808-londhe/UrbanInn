package com.rushikesh.controller;

import com.rushikesh.dto.*;
import com.rushikesh.enums.RoomStatus;
import com.rushikesh.service.HotelAdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('HOTEL_ADMIN')")
@RequiredArgsConstructor
public class HotelAdminController {

    private final HotelAdminService hotelAdminService;

    // ══════════════════════════════════════
    //  DASHBOARD
    // ══════════════════════════════════════

    // GET /api/admin/dashboard
    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashboardResponse>> getDashboard() {
        DashboardResponse dashboard = hotelAdminService.getDashboard();
        return ResponseEntity.ok(
            ApiResponse.success("Dashboard fetched", dashboard));
    }

    // ══════════════════════════════════════
    //  ROOM ENDPOINTS
    // ══════════════════════════════════════

    // POST /api/admin/rooms
    @PostMapping("/rooms")
    public ResponseEntity<ApiResponse<RoomResponse>> createRoom(
            @Valid @RequestBody RoomRequest request) {
        RoomResponse room = hotelAdminService.createRoom(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Room created successfully", room));
    }

    // GET /api/admin/rooms
    @GetMapping("/rooms")
    public ResponseEntity<ApiResponse<List<RoomResponse>>> getAllRooms() {
        List<RoomResponse> rooms = hotelAdminService.getAllRooms();
        return ResponseEntity.ok(
            ApiResponse.success("Rooms fetched successfully", rooms));
    }

    // GET /api/admin/rooms/status/{status}
    @GetMapping("/rooms/status/{status}")
    public ResponseEntity<ApiResponse<List<RoomResponse>>> getRoomsByStatus(
            @PathVariable RoomStatus status) {
        List<RoomResponse> rooms = hotelAdminService.getRoomsByStatus(status);
        return ResponseEntity.ok(
            ApiResponse.success("Rooms fetched successfully", rooms));
    }

    // GET /api/admin/rooms/{roomId}
    @GetMapping("/rooms/{roomId}")
    public ResponseEntity<ApiResponse<RoomResponse>> getRoomById(
            @PathVariable Long roomId) {
        RoomResponse room = hotelAdminService.getRoomById(roomId);
        return ResponseEntity.ok(
            ApiResponse.success("Room fetched successfully", room));
    }

    // PUT /api/admin/rooms/{roomId}
    @PutMapping("/rooms/{roomId}")
    public ResponseEntity<ApiResponse<RoomResponse>> updateRoom(
            @PathVariable Long roomId,
            @Valid @RequestBody RoomRequest request) {
        RoomResponse room = hotelAdminService.updateRoom(roomId, request);
        return ResponseEntity.ok(
            ApiResponse.success("Room updated successfully", room));
    }

    // PATCH /api/admin/rooms/{roomId}/status
    @PatchMapping("/rooms/{roomId}/status")
    public ResponseEntity<ApiResponse<RoomResponse>> updateRoomStatus(
            @PathVariable Long roomId,
            @RequestParam RoomStatus status) {
        RoomResponse room = hotelAdminService.updateRoomStatus(roomId, status);
        return ResponseEntity.ok(
            ApiResponse.success("Room status updated", room));
    }

    // DELETE /api/admin/rooms/{roomId}
    @DeleteMapping("/rooms/{roomId}")
    public ResponseEntity<ApiResponse<Void>> deleteRoom(
            @PathVariable Long roomId) {
        hotelAdminService.deleteRoom(roomId);
        return ResponseEntity.ok(
            ApiResponse.success("Room deleted successfully"));
    }

    // ══════════════════════════════════════
    //  MENU ENDPOINTS
    // ══════════════════════════════════════

    // POST /api/admin/menu
    @PostMapping("/menu")
    public ResponseEntity<ApiResponse<MenuItemResponse>> createMenuItem(
            @Valid @RequestBody MenuItemRequest request) {
        MenuItemResponse item = hotelAdminService.createMenuItem(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Menu item created successfully", item));
    }

    // GET /api/admin/menu
    @GetMapping("/menu")
    public ResponseEntity<ApiResponse<List<MenuItemResponse>>> getAllMenuItems() {
        List<MenuItemResponse> items = hotelAdminService.getAllMenuItems();
        return ResponseEntity.ok(
            ApiResponse.success("Menu items fetched successfully", items));
    }

    // GET /api/admin/menu/category/{category}
    @GetMapping("/menu/category/{category}")
    public ResponseEntity<ApiResponse<List<MenuItemResponse>>> getMenuByCategory(
            @PathVariable String category) {
        List<MenuItemResponse> items =
            hotelAdminService.getMenuItemsByCategory(category);
        return ResponseEntity.ok(
            ApiResponse.success("Menu items fetched successfully", items));
    }

    // PUT /api/admin/menu/{itemId}
    @PutMapping("/menu/{itemId}")
    public ResponseEntity<ApiResponse<MenuItemResponse>> updateMenuItem(
            @PathVariable Long itemId,
            @Valid @RequestBody MenuItemRequest request) {
        MenuItemResponse item = hotelAdminService.updateMenuItem(itemId, request);
        return ResponseEntity.ok(
            ApiResponse.success("Menu item updated successfully", item));
    }

    // PATCH /api/admin/menu/{itemId}/toggle-availability
    @PatchMapping("/menu/{itemId}/toggle-availability")
    public ResponseEntity<ApiResponse<MenuItemResponse>> toggleAvailability(
            @PathVariable Long itemId) {
        MenuItemResponse item =
            hotelAdminService.toggleMenuItemAvailability(itemId);
        return ResponseEntity.ok(
            ApiResponse.success("Menu item availability updated", item));
    }

    // DELETE /api/admin/menu/{itemId}
    @DeleteMapping("/menu/{itemId}")
    public ResponseEntity<ApiResponse<Void>> deleteMenuItem(
            @PathVariable Long itemId) {
        hotelAdminService.deleteMenuItem(itemId);
        return ResponseEntity.ok(
            ApiResponse.success("Menu item deleted successfully"));
    }
    
    @GetMapping("/revenue")
    public ResponseEntity<ApiResponse<Map<String, Object>>>
            getRevenue() {
        return ResponseEntity.ok(ApiResponse.success(
            "Revenue fetched",
            hotelAdminService.getRevenue()));
    }
}
