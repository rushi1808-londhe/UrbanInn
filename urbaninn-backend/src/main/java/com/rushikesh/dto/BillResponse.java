package com.rushikesh.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BillResponse {

    private Long id;
    private Long sessionId;

    // Guest Info
    private String guestName;
    private String phoneNumber;
    private String roomNumber;
    private String roomType;
    private String idType;
    private String idProof;

    // Hotel Info
    private String hotelName;

    // Stay Info
    private LocalDateTime checkInDate;
    private LocalDateTime checkOutDate;
    private Integer numberOfNights;
    private Double pricePerNight;
    private Double roomCharges;

    // Food Orders
    private List<FoodOrderResponse> foodOrders;
    private Double foodCharges;

    // Services taken
    private List<ServiceRequestResponse> services;

    // Total
    private Double totalAmount;
    private LocalDateTime generatedAt;
}