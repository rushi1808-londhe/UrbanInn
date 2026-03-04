package com.rushikesh.repository;

import com.rushikesh.entity.Bill;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface BillRepository
    extends JpaRepository<Bill, Long> {

    Optional<Bill> findByGuestSessionId(Long sessionId);
    List<Bill> findByGuestSession_Hotel_IdOrderByGeneratedAtDesc(
        Long hotelId);
}