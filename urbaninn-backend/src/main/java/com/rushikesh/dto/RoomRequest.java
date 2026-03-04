package com.rushikesh.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class RoomRequest {

    @NotBlank(message = "Room number is required")
    private String roomNumber;

    @NotBlank(message = "Room type is required")
    private String roomType;       // SINGLE, DOUBLE, SUITE etc.

    @NotNull(message = "Floor is required")
    private Integer floor;

    @NotNull(message = "Price per night is required")
    private BigDecimal pricePerNight;
}