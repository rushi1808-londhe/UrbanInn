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
public class ServiceRequestResponse {
    private Long id;
    private String serviceType;
    private String status;
    private String notes;
    private Long guestSessionId;
    private String guestName;
    private String roomNumber;
    private Long hotelId;
    private LocalDateTime requestedAt;
    private LocalDateTime updatedAt;
    private LocalDateTime completedAt;
}