package com.rushikesh.service;

import com.rushikesh.dto.*;
import com.rushikesh.entity.*;
import com.rushikesh.enums.OrderStatus;
import com.rushikesh.exception.BadRequestException;
import com.rushikesh.exception.ResourceNotFoundException;
import com.rushikesh.repository.*;
import com.rushikesh.security.AuthHelper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class KitchenService {

    private final FoodOrderRepository foodOrderRepository;
    private final AuthHelper authHelper;

    // ══════════════════════════════════════
    //  ORDER QUEUE
    // ══════════════════════════════════════

    // Get all active orders (everything except DELIVERED and CANCELLED)
    public List<FoodOrderResponse> getActiveOrders() {
        Long hotelId = authHelper.getCurrentUserHotelId();
        return foodOrderRepository
                .findByHotelIdAndStatusNotOrderByPlacedAtAsc(
                    hotelId, OrderStatus.DELIVERED)
                .stream()
                .filter(o -> o.getStatus() != OrderStatus.CANCELLED)
                .map(this::mapToFoodOrderResponse)
                .collect(Collectors.toList());
    }

    // Get orders by specific status
    public List<FoodOrderResponse> getOrdersByStatus(OrderStatus status) {
        Long hotelId = authHelper.getCurrentUserHotelId();
        return foodOrderRepository
                .findByHotelIdAndStatusNotOrderByPlacedAtAsc(
                    hotelId, OrderStatus.DELIVERED)
                .stream()
                .filter(o -> o.getStatus() == status)
                .map(this::mapToFoodOrderResponse)
                .collect(Collectors.toList());
    }

    // Get all orders for today (full history)
    public List<FoodOrderResponse> getAllOrders() {
        Long hotelId = authHelper.getCurrentUserHotelId();
        return foodOrderRepository
                .findByHotelIdOrderByPlacedAtDesc(hotelId)
                .stream()
                .map(this::mapToFoodOrderResponse)
                .collect(Collectors.toList());
    }

    // Get single order detail
    public FoodOrderResponse getOrderById(Long orderId) {
        FoodOrder order = findOrderById(orderId);
        return mapToFoodOrderResponse(order);
    }

    // ══════════════════════════════════════
    //  ORDER STATUS MANAGEMENT
    // ══════════════════════════════════════

    @Transactional
    public FoodOrderResponse updateOrderStatus(Long orderId, OrderStatus newStatus) {
        FoodOrder order = findOrderById(orderId);

        // validate status transition
        validateStatusTransition(order.getStatus(), newStatus);

        order.setStatus(newStatus);
        order = foodOrderRepository.save(order);

        log.info("Order {} status updated to {}", orderId, newStatus);
        return mapToFoodOrderResponse(order);
    }

    // ══════════════════════════════════════
    //  PRIVATE HELPERS
    // ══════════════════════════════════════

    private FoodOrder findOrderById(Long orderId) {
        return foodOrderRepository.findById(orderId)
                .orElseThrow(() ->
                    new ResourceNotFoundException(
                        "Order not found: " + orderId));
    }

    // Enforce logical order status flow:
    // PLACED → CONFIRMED → PREPARING → READY → DELIVERED
    private void validateStatusTransition(
            OrderStatus current, OrderStatus next) {

        if (current == OrderStatus.DELIVERED) {
            throw new BadRequestException(
                "Order is already delivered");
        }
        if (current == OrderStatus.CANCELLED) {
            throw new BadRequestException(
                "Cannot update a cancelled order");
        }

        boolean valid = switch (current) {
            case PLACED    -> next == OrderStatus.CONFIRMED
                           || next == OrderStatus.CANCELLED;
            case CONFIRMED -> next == OrderStatus.PREPARING
                           || next == OrderStatus.CANCELLED;
            case PREPARING -> next == OrderStatus.READY;
            case READY     -> next == OrderStatus.DELIVERED;
            default        -> false;
        };

        if (!valid) {
            throw new BadRequestException(
                "Invalid status transition: " + current + " → " + next);
        }
    }

    public FoodOrderResponse mapToFoodOrderResponse(FoodOrder order) {
        List<OrderItemResponse> items = order.getItems()
                .stream()
                .map(this::mapToOrderItemResponse)
                .collect(Collectors.toList());

        return FoodOrderResponse.builder()
                .id(order.getId())
                .status(order.getStatus().name())
                .totalAmount(order.getTotalAmount())
                .specialInstructions(order.getSpecialInstructions())
                .placedAt(order.getPlacedAt())
                .updatedAt(order.getUpdatedAt())
                .guestSessionId(order.getGuestSession().getId())
                .guestName(order.getGuestSession().getGuestName())
                .roomNumber(order.getGuestSession()
                    .getRoom().getRoomNumber())
                .hotelId(order.getHotel().getId())
                .items(items)
                .build();
    }

    private OrderItemResponse mapToOrderItemResponse(OrderItem item) {
        return OrderItemResponse.builder()
                .id(item.getId())
                .menuItemId(item.getMenuItem().getId())
                .menuItemName(item.getMenuItem().getName())
                .category(item.getMenuItem().getCategory())
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .subtotal(item.getUnitPrice().multiply(
                    java.math.BigDecimal.valueOf(item.getQuantity())))
                .build();
    }
}