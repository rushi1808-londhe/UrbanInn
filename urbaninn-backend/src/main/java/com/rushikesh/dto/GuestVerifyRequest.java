package com.rushikesh.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class GuestVerifyRequest {

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[0-9]{10}$", message = "Phone must be 10 digits")
    private String phoneNumber;

    @NotBlank(message = "OTP is required")
    private String otp;

    @NotBlank(message = "Room number is required")
    private String roomNumber;

    @NotNull(message = "Hotel ID is required")
    private Long hotelId;
}