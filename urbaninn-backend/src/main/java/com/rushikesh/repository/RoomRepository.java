package com.rushikesh.repository;

import com.rushikesh.entity.Room;
import com.rushikesh.enums.RoomStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {
    List<Room> findByHotelId(Long hotelId);
    List<Room> findByHotelIdAndStatus(Long hotelId, RoomStatus status);
    Optional<Room> findByHotelIdAndRoomNumber(Long hotelId, String roomNumber);
    boolean existsByHotelIdAndRoomNumber(Long hotelId, String roomNumber);
}