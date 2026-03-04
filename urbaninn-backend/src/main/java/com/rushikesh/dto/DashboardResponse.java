package com.rushikesh.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {
    private int totalRooms;
    private int availableRooms;
    private int occupiedRooms;
    private int activeGuests;
    private int totalStaff;
    private int totalMenuItems;
}