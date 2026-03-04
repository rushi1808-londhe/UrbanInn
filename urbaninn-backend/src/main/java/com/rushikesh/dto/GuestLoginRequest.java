package com.rushikesh.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class GuestLoginRequest {

    @NotBlank(message = "Phone number is required")
    private String phoneNumber;

    @NotNull(message = "Room number is required")
    private String roomNumber;

    @NotNull(message = "Hotel ID is required")
    private Long hotelId;
}