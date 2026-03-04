package com.rushikesh.controller;

import com.rushikesh.dto.*;
import com.rushikesh.enums.OrderStatus;
import com.rushikesh.service.KitchenService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/kitchen")
@PreAuthorize("hasRole('KITCHEN_STAFF')")
@RequiredArgsConstructor
public class KitchenController {

    private final KitchenService kitchenService;

    // ══════════════════════════════════════
    //  ORDER QUEUE
    // ══════════════════════════════════════

    // GET /api/kitchen/orders
    // Returns all active orders (PLACED, CONFIRMED, PREPARING, READY)
    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<List<FoodOrderResponse>>> getActiveOrders() {
        List<FoodOrderResponse> orders = kitchenService.getActiveOrders();
        return ResponseEntity.ok(
            ApiResponse.success("Active orders fetched", orders));
    }

    // GET /api/kitchen/orders/all
    // Full order history for today
    @GetMapping("/orders/all")
    public ResponseEntity<ApiResponse<List<FoodOrderResponse>>> getAllOrders() {
        List<FoodOrderResponse> orders = kitchenService.getAllOrders();
        return ResponseEntity.ok(
            ApiResponse.success("All orders fetched", orders));
    }

    // GET /api/kitchen/orders/status/{status}
    // Filter by status — e.g. only PLACED orders (new orders)
    @GetMapping("/orders/status/{status}")
    public ResponseEntity<ApiResponse<List<FoodOrderResponse>>> getOrdersByStatus(
            @PathVariable OrderStatus status) {
        List<FoodOrderResponse> orders =
            kitchenService.getOrdersByStatus(status);
        return ResponseEntity.ok(
            ApiResponse.success("Orders fetched", orders));
    }

    // GET /api/kitchen/orders/{orderId}
    @GetMapping("/orders/{orderId}")
    public ResponseEntity<ApiResponse<FoodOrderResponse>> getOrderById(
            @PathVariable Long orderId) {
        FoodOrderResponse order = kitchenService.getOrderById(orderId);
        return ResponseEntity.ok(
            ApiResponse.success("Order fetched", order));
    }

    // ══════════════════════════════════════
    //  ORDER STATUS UPDATES
    // ══════════════════════════════════════

    // PATCH /api/kitchen/orders/{orderId}/status
    // Kitchen staff updates order as they work on it
    @PatchMapping("/orders/{orderId}/status")
    public ResponseEntity<ApiResponse<FoodOrderResponse>> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam OrderStatus status) {
        FoodOrderResponse order =
            kitchenService.updateOrderStatus(orderId, status);
        return ResponseEntity.ok(
            ApiResponse.success("Order status updated to " +
                status.name(), order));
    }
}


