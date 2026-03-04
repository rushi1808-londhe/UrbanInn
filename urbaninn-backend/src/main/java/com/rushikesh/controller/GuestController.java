package com.rushikesh.controller;

import com.rushikesh.dto.*;
import com.rushikesh.service.GuestService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/guest")
@PreAuthorize("hasRole('GUEST')")
@RequiredArgsConstructor
public class GuestController {

    private final GuestService guestService;

    // ══════════════════════════════════════
    //  SESSION & ROOM
    // ══════════════════════════════════════

    // GET /api/guest/me
    // Guest views their own session info
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<GuestSessionResponse>> getMySession(
            HttpServletRequest request) {
        GuestSessionResponse session = guestService.getMySession(request);
        return ResponseEntity.ok(
            ApiResponse.success("Session fetched", session));
    }

    // GET /api/guest/room
    // Guest checks their room status
    @GetMapping("/room")
    public ResponseEntity<ApiResponse<GuestRoomStatusResponse>> getMyRoom(
            HttpServletRequest request) {
        GuestRoomStatusResponse room = guestService.getMyRoomStatus(request);
        return ResponseEntity.ok(
            ApiResponse.success("Room status fetched", room));
    }

    // ══════════════════════════════════════
    //  MENU
    // ══════════════════════════════════════

    // GET /api/guest/menu
    // View full available menu
    @GetMapping("/menu")
    public ResponseEntity<ApiResponse<List<MenuItemResponse>>> getMenu(
            HttpServletRequest request) {
        List<MenuItemResponse> menu = guestService.getMenu(request);
        return ResponseEntity.ok(
            ApiResponse.success("Menu fetched", menu));
    }

    // GET /api/guest/menu/category/{category}
    // View menu filtered by category
    @GetMapping("/menu/category/{category}")
    public ResponseEntity<ApiResponse<List<MenuItemResponse>>> getMenuByCategory(
            @PathVariable String category,
            HttpServletRequest request) {
        List<MenuItemResponse> menu =
            guestService.getMenuByCategory(category, request);
        return ResponseEntity.ok(
            ApiResponse.success("Menu fetched", menu));
    }

    // ══════════════════════════════════════
    //  FOOD ORDERS
    // ══════════════════════════════════════

    // POST /api/guest/orders
    // Guest places a food order
    @PostMapping("/orders")
    public ResponseEntity<ApiResponse<FoodOrderResponse>> placeOrder(
            @Valid @RequestBody PlaceOrderRequest orderRequest,
            HttpServletRequest request) {
        FoodOrderResponse order =
            guestService.placeOrder(orderRequest, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                    "Order placed successfully", order));
    }

    // GET /api/guest/orders
    // Guest views all their orders
    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<List<FoodOrderResponse>>> getMyOrders(
            HttpServletRequest request) {
        List<FoodOrderResponse> orders = guestService.getMyOrders(request);
        return ResponseEntity.ok(
            ApiResponse.success("Orders fetched", orders));
    }

    // GET /api/guest/orders/{orderId}
    // Guest tracks a specific order
    @GetMapping("/orders/{orderId}")
    public ResponseEntity<ApiResponse<FoodOrderResponse>> getOrderById(
            @PathVariable Long orderId,
            HttpServletRequest request) {
        FoodOrderResponse order =
            guestService.getOrderById(orderId, request);
        return ResponseEntity.ok(
            ApiResponse.success("Order fetched", order));
    }

    // PATCH /api/guest/orders/{orderId}/cancel
    // Guest cancels an order (only if still PLACED)
    @PatchMapping("/orders/{orderId}/cancel")
    public ResponseEntity<ApiResponse<FoodOrderResponse>> cancelOrder(
            @PathVariable Long orderId,
            HttpServletRequest request) {
        FoodOrderResponse order =
            guestService.cancelOrder(orderId, request);
        return ResponseEntity.ok(
            ApiResponse.success("Order cancelled", order));
    }

    // ══════════════════════════════════════
    //  SERVICE REQUESTS
    // ══════════════════════════════════════

    // POST /api/guest/services
    // Guest raises a service request
    @PostMapping("/services")
    public ResponseEntity<ApiResponse<ServiceRequestResponse>> requestService(
            @Valid @RequestBody ServiceRequestCreate serviceRequest,
            HttpServletRequest request) {
        ServiceRequestResponse response =
            guestService.createServiceRequest(serviceRequest, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                    "Service request submitted", response));
    }

    // GET /api/guest/services
    // Guest views all their service requests + status
    @GetMapping("/services")
    public ResponseEntity<ApiResponse<List<ServiceRequestResponse>>> getMyServices(
            HttpServletRequest request) {
        List<ServiceRequestResponse> services =
            guestService.getMyServiceRequests(request);
        return ResponseEntity.ok(
            ApiResponse.success("Service requests fetched", services));
    }
    
    @PatchMapping("/services/{id}/complete")
    public ResponseEntity<ApiResponse<ServiceRequestResponse>>
            markComplete(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(
            "Marked complete",
            guestService.markServiceCompleted(id)));
    }
}