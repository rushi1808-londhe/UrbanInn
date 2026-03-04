package com.rushikesh.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GuestLoginResponse {
    private String token;
    private String guestName;
    private String roomNumber;
    private String roomType;
    private String hotelName;
    private Long sessionId;
}