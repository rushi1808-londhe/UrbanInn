package com.rushikesh.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GuestSessionResponse {
    private Long id;
    private String guestName;
    private String phoneNumber;
    private String email;
    private String idProof;
    private String idType;
    private Integer numberOfGuests;
    private LocalDate checkInDate;
    private LocalDate expectedCheckOutDate;
    private LocalDate actualCheckOutDate;
    private boolean active;

    // room info
    private Long roomId;
    private String roomNumber;
    private String roomType;
    private String roomStatus;

    // hotel info
    private Long hotelId;
    private String hotelName;

    // checked in by
    private String checkedInByName;
    private LocalDateTime createdAt;
}