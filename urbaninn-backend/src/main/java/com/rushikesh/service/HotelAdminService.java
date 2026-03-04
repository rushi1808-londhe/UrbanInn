package com.rushikesh.service;

import com.rushikesh.dto.*;
import com.rushikesh.entity.*;
import com.rushikesh.enums.RoomStatus;
import com.rushikesh.exception.BadRequestException;
import com.rushikesh.exception.ResourceNotFoundException;
import com.rushikesh.repository.*;
import com.rushikesh.security.AuthHelper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class HotelAdminService {

    private final RoomRepository roomRepository;
    private final BillRepository billRepository;
    private final MenuItemRepository menuItemRepository;
    private final HotelRepository hotelRepository;
    private final GuestSessionRepository guestSessionRepository;
    private final UserRepository userRepository;
    private final AuthHelper authHelper;

    // ══════════════════════════════════════
    //  ROOM MANAGEMENT
    // ══════════════════════════════════════

    @Transactional
    public RoomResponse createRoom(RoomRequest request) {
        Long hotelId = authHelper.getCurrentUserHotelId();

        if (roomRepository.existsByHotelIdAndRoomNumber(
                hotelId, request.getRoomNumber())) {
            throw new BadRequestException(
                "Room number already exists in this hotel");
        }

        Hotel hotel = findHotelById(hotelId);

        Room room = Room.builder()
                .hotel(hotel)
                .roomNumber(request.getRoomNumber())
                .roomType(request.getRoomType())
                .floor(request.getFloor())
                .pricePerNight(request.getPricePerNight())
                .status(RoomStatus.AVAILABLE)
                .build();

        room = roomRepository.save(room);
        log.info("Room {} created in hotel {}", room.getRoomNumber(), hotelId);
        return mapToRoomResponse(room);
    }

    public List<RoomResponse> getAllRooms() {
        Long hotelId = authHelper.getCurrentUserHotelId();
        return roomRepository.findByHotelId(hotelId)
                .stream()
                .map(this::mapToRoomResponse)
                .collect(Collectors.toList());
    }

    public List<RoomResponse> getRoomsByStatus(RoomStatus status) {
        Long hotelId = authHelper.getCurrentUserHotelId();
        return roomRepository.findByHotelIdAndStatus(hotelId, status)
                .stream()
                .map(this::mapToRoomResponse)
                .collect(Collectors.toList());
    }

    public RoomResponse getRoomById(Long roomId) {
        Room room = findRoomById(roomId);
        return mapToRoomResponse(room);
    }

    @Transactional
    public RoomResponse updateRoom(Long roomId, RoomRequest request) {
        Room room = findRoomById(roomId);

        room.setRoomType(request.getRoomType());
        room.setFloor(request.getFloor());
        room.setPricePerNight(request.getPricePerNight());

        room = roomRepository.save(room);
        return mapToRoomResponse(room);
    }

    @Transactional
    public RoomResponse updateRoomStatus(Long roomId, RoomStatus status) {
        Room room = findRoomById(roomId);
        room.setStatus(status);
        room = roomRepository.save(room);
        log.info("Room {} status changed to {}", room.getRoomNumber(), status);
        return mapToRoomResponse(room);
    }

    @Transactional
    public void deleteRoom(Long roomId) {
        Room room = findRoomById(roomId);
        if (room.getStatus() == RoomStatus.OCCUPIED) {
            throw new BadRequestException(
                "Cannot delete an occupied room");
        }
        roomRepository.delete(room);
    }

    // ══════════════════════════════════════
    //  MENU MANAGEMENT
    // ══════════════════════════════════════

    @Transactional
    public MenuItemResponse createMenuItem(MenuItemRequest request) {
        Long hotelId = authHelper.getCurrentUserHotelId();
        Hotel hotel = findHotelById(hotelId);

        MenuItem item = MenuItem.builder()
                .hotel(hotel)
                .name(request.getName())
                .description(request.getDescription())
                .category(request.getCategory())
                .price(request.getPrice())
                .available(request.getAvailable())
                .vegetarian(request.getVegetarian())
                .imageUrl(request.getImageUrl())
                .build();

        item = menuItemRepository.save(item);
        log.info("Menu item {} created in hotel {}", item.getName(), hotelId);
        return mapToMenuItemResponse(item);
    }

    public List<MenuItemResponse> getAllMenuItems() {
        Long hotelId = authHelper.getCurrentUserHotelId();
        return menuItemRepository.findByHotelId(hotelId)
                .stream()
                .map(this::mapToMenuItemResponse)
                .collect(Collectors.toList());
    }

    public List<MenuItemResponse> getMenuItemsByCategory(String category) {
        Long hotelId = authHelper.getCurrentUserHotelId();
        return menuItemRepository.findByHotelIdAndCategory(hotelId, category)
                .stream()
                .map(this::mapToMenuItemResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public MenuItemResponse updateMenuItem(Long itemId, MenuItemRequest request) {
        MenuItem item = menuItemRepository.findById(itemId)
                .orElseThrow(() ->
                    new ResourceNotFoundException("Menu item not found"));

        item.setName(request.getName());
        item.setDescription(request.getDescription());
        item.setCategory(request.getCategory());
        item.setPrice(request.getPrice());
        item.setAvailable(request.getAvailable());
        item.setVegetarian(request.getVegetarian());
        item.setImageUrl(request.getImageUrl());

        item = menuItemRepository.save(item);
        return mapToMenuItemResponse(item);
    }

    @Transactional
    public MenuItemResponse toggleMenuItemAvailability(Long itemId) {
        MenuItem item = menuItemRepository.findById(itemId)
                .orElseThrow(() ->
                    new ResourceNotFoundException("Menu item not found"));
        item.setAvailable(!item.isAvailable());
        item = menuItemRepository.save(item);
        return mapToMenuItemResponse(item);
    }

    @Transactional
    public void deleteMenuItem(Long itemId) {
        MenuItem item = menuItemRepository.findById(itemId)
                .orElseThrow(() ->
                    new ResourceNotFoundException("Menu item not found"));
        menuItemRepository.delete(item);
    }

    // ══════════════════════════════════════
    //  DASHBOARD OVERVIEW
    // ══════════════════════════════════════

    public DashboardResponse getDashboard() {
        Long hotelId = authHelper.getCurrentUserHotelId();

        int totalRooms = roomRepository.findByHotelId(hotelId).size();
        int availableRooms = roomRepository
                .findByHotelIdAndStatus(hotelId, RoomStatus.AVAILABLE).size();
        int occupiedRooms = roomRepository
                .findByHotelIdAndStatus(hotelId, RoomStatus.OCCUPIED).size();
        int activeGuests = guestSessionRepository
                .findByHotelIdAndActiveTrue(hotelId).size();
        int totalStaff = userRepository.findByHotelId(hotelId).size();
        int totalMenuItems = menuItemRepository.findByHotelId(hotelId).size();

        return DashboardResponse.builder()
                .totalRooms(totalRooms)
                .availableRooms(availableRooms)
                .occupiedRooms(occupiedRooms)
                .activeGuests(activeGuests)
                .totalStaff(totalStaff)
                .totalMenuItems(totalMenuItems)
                .build();
    }

    // ══════════════════════════════════════
    //  PRIVATE HELPERS
    // ══════════════════════════════════════

    private Hotel findHotelById(Long hotelId) {
        return hotelRepository.findById(hotelId)
                .orElseThrow(() ->
                    new ResourceNotFoundException(
                        "Hotel not found: " + hotelId));
    }

    private Room findRoomById(Long roomId) {
        return roomRepository.findById(roomId)
                .orElseThrow(() ->
                    new ResourceNotFoundException(
                        "Room not found: " + roomId));
    }

    public RoomResponse mapToRoomResponse(Room room) {
        RoomResponse.RoomResponseBuilder builder = RoomResponse.builder()
                .id(room.getId())
                .roomNumber(room.getRoomNumber())
                .roomType(room.getRoomType())
                .floor(room.getFloor())
                .pricePerNight(room.getPricePerNight())
                .status(room.getStatus().name())
                .hotelId(room.getHotel().getId())
                .hotelName(room.getHotel().getName());

        // if occupied, attach guest info
        if (room.getStatus() == RoomStatus.OCCUPIED) {
            guestSessionRepository.findByRoomIdAndActiveTrue(room.getId())
                    .ifPresent(session -> {
                        builder.currentGuestName(session.getGuestName());
                        builder.currentGuestPhone(session.getPhoneNumber());
                        builder.currentGuestSessionId(session.getId());
                    });
        }

        return builder.build();
    }

    public MenuItemResponse mapToMenuItemResponse(MenuItem item) {
        return MenuItemResponse.builder()
                .id(item.getId())
                .name(item.getName())
                .description(item.getDescription())
                .category(item.getCategory())
                .price(item.getPrice())
                .available(item.isAvailable())
                .vegetarian(item.isVegetarian())
                .imageUrl(item.getImageUrl())
                .hotelId(item.getHotel().getId())
                .build();
    }
    
    public Map<String, Object> getRevenue() {
        Long hotelId = authHelper.getCurrentUserHotelId();
        LocalDate today = LocalDate.now();
        LocalDate weekStart = today.minusDays(7);
        LocalDate monthStart = today.withDayOfMonth(1);

        List<Bill> allBills = billRepository
            .findByGuestSession_Hotel_IdOrderByGeneratedAtDesc(
                hotelId);

        // Today
        double todayRoom = allBills.stream()
            .filter(b -> b.getGeneratedAt()
                .toLocalDate().equals(today))
            .mapToDouble(Bill::getRoomCharges).sum();
        double todayFood = allBills.stream()
            .filter(b -> b.getGeneratedAt()
                .toLocalDate().equals(today))
            .mapToDouble(Bill::getFoodCharges).sum();
        long todayCheckouts = allBills.stream()
            .filter(b -> b.getGeneratedAt()
                .toLocalDate().equals(today))
            .count();

        // This Week
        double weekRoom = allBills.stream()
            .filter(b -> !b.getGeneratedAt()
                .toLocalDate().isBefore(weekStart))
            .mapToDouble(Bill::getRoomCharges).sum();
        double weekFood = allBills.stream()
            .filter(b -> !b.getGeneratedAt()
                .toLocalDate().isBefore(weekStart))
            .mapToDouble(Bill::getFoodCharges).sum();
        long weekCheckouts = allBills.stream()
            .filter(b -> !b.getGeneratedAt()
                .toLocalDate().isBefore(weekStart))
            .count();

        // This Month
        double monthRoom = allBills.stream()
            .filter(b -> !b.getGeneratedAt()
                .toLocalDate().isBefore(monthStart))
            .mapToDouble(Bill::getRoomCharges).sum();
        double monthFood = allBills.stream()
            .filter(b -> !b.getGeneratedAt()
                .toLocalDate().isBefore(monthStart))
            .mapToDouble(Bill::getFoodCharges).sum();
        long monthCheckouts = allBills.stream()
            .filter(b -> !b.getGeneratedAt()
                .toLocalDate().isBefore(monthStart))
            .count();

        Map<String, Object> result = new java.util.HashMap<>();

        result.put("today", Map.of(
            "roomRevenue", todayRoom,
            "foodRevenue", todayFood,
            "total", todayRoom + todayFood,
            "checkouts", todayCheckouts
        ));
        result.put("week", Map.of(
            "roomRevenue", weekRoom,
            "foodRevenue", weekFood,
            "total", weekRoom + weekFood,
            "checkouts", weekCheckouts
        ));
        result.put("month", Map.of(
            "roomRevenue", monthRoom,
            "foodRevenue", monthFood,
            "total", monthRoom + monthFood,
            "checkouts", monthCheckouts
        ));

        return result;
    }
}