package com.rushikesh.service;

import com.rushikesh.dto.*;
import com.rushikesh.entity.GuestSession;
import com.rushikesh.entity.User;
import com.rushikesh.exception.BadRequestException;
import com.rushikesh.exception.ResourceNotFoundException;
import com.rushikesh.exception.UnauthorizedException;
import com.rushikesh.repository.GuestSessionRepository;
import com.rushikesh.repository.HotelRepository;
import com.rushikesh.repository.UserRepository;
import com.rushikesh.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final HotelRepository hotelRepository;
    private final GuestSessionRepository guestSessionRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    // ── Staff / Admin Login ──
    public LoginResponse staffLogin(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() ->
                    new UnauthorizedException("Invalid email or password"));

        if (!user.isActive()) {
            throw new UnauthorizedException("Account is disabled");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        // Build UserDetails-like object for token generation
        org.springframework.security.core.userdetails.User userDetails =
            new org.springframework.security.core.userdetails.User(
                user.getEmail(), user.getPassword(), java.util.List.of()
            );

        String token = jwtUtil.generateToken(userDetails);

        return LoginResponse.builder()
                .token(token)
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole().name())
                .hotelId(user.getHotel() != null ? user.getHotel().getId() : null)
                .build();
    }

    public GuestLoginResponse guestLogin(
            GuestLoginRequest request) {

        // find active session matching phone + room + hotel
        GuestSession session = guestSessionRepository
            .findByPhoneNumberAndHotelIdAndActiveTrue(
                request.getPhoneNumber(),
                request.getHotelId())
            .orElseThrow(() ->
                new ResourceNotFoundException(
                    "No active booking found for this " +
                    "phone number"));

        // verify room number matches
        if (!session.getRoom().getRoomNumber()
                .equals(request.getRoomNumber())) {
            throw new BadRequestException(
                "Room number does not match");
        }

        // generate JWT token
        String token = jwtUtil.generateGuestToken(
        	    session.getPhoneNumber(),
        	    session.getId(),
        	    session.getHotel().getId(),
        	    session.getRoom().getRoomNumber()); 

        return GuestLoginResponse.builder()
            .token(token)
            .guestName(session.getGuestName())
            .roomNumber(session.getRoom().getRoomNumber())
            .roomType(session.getRoom()
                .getRoomType().toString())
            .hotelName(session.getHotel().getName())
            .sessionId(session.getId())
            .build();
    }
    
    public List<HotelResponse> getActiveHotels() {
        return hotelRepository.findByActiveTrue()
            .stream()
            .map(h -> HotelResponse.builder()
                .id(h.getId())
                .name(h.getName())
                .city(h.getCity())
                .build())
            .collect(Collectors.toList());
    }
}