package com.rushikesh.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FoodOrderResponse {
    private Long id;
    private String status;
    private BigDecimal totalAmount;
    private String specialInstructions;
    private LocalDateTime placedAt;
    private LocalDateTime updatedAt;

    // guest info
    private Long guestSessionId;
    private String guestName;
    private String roomNumber;
    private Long hotelId;

    // items
    private List<OrderItemResponse> items;
}