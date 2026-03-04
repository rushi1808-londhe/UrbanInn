package com.rushikesh.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GuestRoomStatusResponse {
    private String roomNumber;
    private String roomType;
    private Integer floor;
    private String status;
    private String hotelName;
    private String guestName;
    private LocalDate checkInDate;
    private LocalDate expectedCheckOutDate;
    private Integer numberOfGuests;
}