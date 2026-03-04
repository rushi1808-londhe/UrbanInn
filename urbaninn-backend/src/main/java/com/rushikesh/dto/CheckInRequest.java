package com.rushikesh.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CheckInRequest {

    @NotBlank(message = "Guest name is required")
    private String guestName;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[0-9]{10}$", message = "Phone must be 10 digits")
    private String phoneNumber;

    private String email;

    @NotBlank(message = "ID proof is required")
    private String idProof;

    @NotBlank(message = "ID type is required")
    private String idType;       // PASSPORT, AADHAR, DRIVING_LICENSE etc.

    @NotNull(message = "Room ID is required")
    private Long roomId;

    @NotNull(message = "Number of guests is required")
    private Integer numberOfGuests;

    @NotNull(message = "Check-in date is required")
    private LocalDate checkInDate;

    @NotNull(message = "Expected check-out date is required")
    private LocalDate expectedCheckOutDate;
}