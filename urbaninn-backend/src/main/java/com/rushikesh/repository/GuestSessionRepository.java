package com.rushikesh.repository;

import com.rushikesh.entity.GuestSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GuestSessionRepository extends JpaRepository<GuestSession, Long> {

    // find active guest by phone + room number + hotel (used for OTP login)
    Optional<GuestSession> findByPhoneNumberAndRoom_RoomNumberAndHotelIdAndActiveTrue(
        String phoneNumber, String roomNumber, Long hotelId
    );

    // find active session by room
    Optional<GuestSession> findByRoomIdAndActiveTrue(Long roomId);

    // all active guests in a hotel
    List<GuestSession> findByHotelIdAndActiveTrue(Long hotelId);

    // find by phone in a hotel (active)
    Optional<GuestSession> findByPhoneNumberAndHotelIdAndActiveTrue(
        String phoneNumber, Long hotelId
    );
}