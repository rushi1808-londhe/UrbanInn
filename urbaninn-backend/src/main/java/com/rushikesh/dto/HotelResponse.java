package com.rushikesh.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HotelResponse {
    private Long id;
    private String name;
    private String address;
    private String city;
    private String country;
    private String phone;
    private String email;
    private boolean active;
    private int totalRooms;
    private int activeGuests;
    private LocalDateTime createdAt;
}