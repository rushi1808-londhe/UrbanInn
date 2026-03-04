package com.rushikesh.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomResponse {
    private Long id;
    private String roomNumber;
    private String roomType;
    private Integer floor;
    private BigDecimal pricePerNight;
    private String status;
    private Long hotelId;
    private String hotelName;

    // if occupied — show guest info
    private String currentGuestName;
    private String currentGuestPhone;
    private Long currentGuestSessionId;
}