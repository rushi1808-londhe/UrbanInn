package com.rushikesh.service;

import com.rushikesh.dto.*;
import com.rushikesh.entity.Hotel;
import com.rushikesh.entity.User;
import com.rushikesh.enums.Role;
import com.rushikesh.exception.BadRequestException;
import com.rushikesh.exception.ResourceNotFoundException;
import com.rushikesh.repository.GuestSessionRepository;
import com.rushikesh.repository.HotelRepository;
import com.rushikesh.repository.RoomRepository;
import com.rushikesh.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SuperAdminService {

    private final HotelRepository hotelRepository;
    private final UserRepository userRepository;
    private final RoomRepository roomRepository;
    private final GuestSessionRepository guestSessionRepository;
    private final PasswordEncoder passwordEncoder;

    // ══════════════════════════════════════
    //  HOTEL MANAGEMENT
    // ══════════════════════════════════════

    // Create hotel
    @Transactional
    public HotelResponse createHotel(HotelRequest request) {
        if (hotelRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException(
                "Hotel with this email already exists");
        }

        Hotel hotel = Hotel.builder()
                .name(request.getName())
                .address(request.getAddress())
                .city(request.getCity())
                .country(request.getCountry())
                .phone(request.getPhone())
                .email(request.getEmail())
                .active(true)
                .build();

        hotel = hotelRepository.save(hotel);
        log.info("Hotel created: {}", hotel.getName());
        return mapToHotelResponse(hotel);
    }

    // Get all hotels
    public List<HotelResponse> getAllHotels() {
        return hotelRepository.findAll()
                .stream()
                .map(this::mapToHotelResponse)
                .collect(Collectors.toList());
    }

    // Get hotel by ID
    public HotelResponse getHotelById(Long hotelId) {
        Hotel hotel = findHotelById(hotelId);
        return mapToHotelResponse(hotel);
    }

    // Update hotel
    @Transactional
    public HotelResponse updateHotel(Long hotelId, HotelRequest request) {
        Hotel hotel = findHotelById(hotelId);

        hotel.setName(request.getName());
        hotel.setAddress(request.getAddress());
        hotel.setCity(request.getCity());
        hotel.setCountry(request.getCountry());
        hotel.setPhone(request.getPhone());
        hotel.setEmail(request.getEmail());

        hotel = hotelRepository.save(hotel);
        log.info("Hotel updated: {}", hotel.getName());
        return mapToHotelResponse(hotel);
    }

    // Toggle hotel active/inactive
    @Transactional
    public HotelResponse toggleHotelStatus(Long hotelId) {
        Hotel hotel = findHotelById(hotelId);
        hotel.setActive(!hotel.isActive());
        hotel = hotelRepository.save(hotel);
        log.info("Hotel {} status: {}", hotel.getName(), hotel.isActive());
        return mapToHotelResponse(hotel);
    }

    // Delete hotel
    @Transactional
    public void deleteHotel(Long hotelId) {
        Hotel hotel = findHotelById(hotelId);
        hotelRepository.delete(hotel);
        log.info("Hotel deleted: {}", hotel.getName());
    }

    // ══════════════════════════════════════
    //  STAFF / USER MANAGEMENT
    // ══════════════════════════════════════

    // Create any staff user (hotel admin, receptionist, kitchen, etc.)
    @Transactional
    public StaffResponse createStaff(CreateStaffRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException(
                "User with this email already exists");
        }

        // SUPER_ADMIN doesn't need a hotel
        if (request.getRole() != Role.SUPER_ADMIN && request.getHotelId() == null) {
            throw new BadRequestException(
                "Hotel ID is required for this role");
        }

        Hotel hotel = null;
        if (request.getHotelId() != null) {
            hotel = findHotelById(request.getHotelId());
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .hotel(hotel)
                .active(true)
                .build();

        user = userRepository.save(user);
        log.info("Staff created: {} ({})", user.getName(), user.getRole());
        return mapToStaffResponse(user);
    }

    // Get all staff
    public List<StaffResponse> getAllStaff() {
        return userRepository.findAll()
                .stream()
                .map(this::mapToStaffResponse)
                .collect(Collectors.toList());
    }

    // Get staff by hotel
    public List<StaffResponse> getStaffByHotel(Long hotelId) {
        findHotelById(hotelId); // validate hotel exists
        return userRepository.findByHotelId(hotelId)
                .stream()
                .map(this::mapToStaffResponse)
                .collect(Collectors.toList());
    }

    // Toggle staff active/inactive
    @Transactional
    public StaffResponse toggleStaffStatus(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                    new ResourceNotFoundException("User not found"));
        user.setActive(!user.isActive());
        user = userRepository.save(user);
        return mapToStaffResponse(user);
    }

    // Update staff
    @Transactional
    public StaffResponse updateStaff(Long userId, CreateStaffRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                    new ResourceNotFoundException("User not found"));

        user.setName(request.getName());
        user.setRole(request.getRole());

        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        if (request.getHotelId() != null) {
            Hotel hotel = findHotelById(request.getHotelId());
            user.setHotel(hotel);
        }

        user = userRepository.save(user);
        return mapToStaffResponse(user);
    }

    // Delete staff
    @Transactional
    public void deleteStaff(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                    new ResourceNotFoundException("User not found"));
        userRepository.delete(user);
        log.info("Staff deleted: {}", user.getEmail());
    }

    // ══════════════════════════════════════
    //  PRIVATE HELPERS
    // ══════════════════════════════════════

    private Hotel findHotelById(Long hotelId) {
        return hotelRepository.findById(hotelId)
                .orElseThrow(() ->
                    new ResourceNotFoundException(
                        "Hotel not found with id: " + hotelId));
    }

    private HotelResponse mapToHotelResponse(Hotel hotel) {
        int totalRooms = roomRepository.findByHotelId(hotel.getId()).size();
        int activeGuests = guestSessionRepository
                .findByHotelIdAndActiveTrue(hotel.getId()).size();

        return HotelResponse.builder()
                .id(hotel.getId())
                .name(hotel.getName())
                .address(hotel.getAddress())
                .city(hotel.getCity())
                .country(hotel.getCountry())
                .phone(hotel.getPhone())
                .email(hotel.getEmail())
                .active(hotel.isActive())
                .totalRooms(totalRooms)
                .activeGuests(activeGuests)
                .createdAt(hotel.getCreatedAt())
                .build();
    }

    private StaffResponse mapToStaffResponse(User user) {
        return StaffResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .hotelId(user.getHotel() != null ? user.getHotel().getId() : null)
                .hotelName(user.getHotel() != null ? user.getHotel().getName() : null)
                .active(user.isActive())
                .createdAt(user.getCreatedAt())
                .build();
    }
}