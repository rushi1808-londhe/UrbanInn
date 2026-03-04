package com.rushikesh.repository;

import com.rushikesh.entity.ServiceRequest;
import com.rushikesh.enums.ServiceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceRequestRepository extends JpaRepository<ServiceRequest, Long> {

    // receptionist/admin — all pending requests for hotel
    List<ServiceRequest> findByHotelIdAndStatusOrderByRequestedAtAsc(
        Long hotelId, ServiceStatus status
    );

    // guest — their own requests
    List<ServiceRequest> findByGuestSessionIdOrderByRequestedAtDesc(Long guestSessionId);

    // all requests for a hotel
    List<ServiceRequest> findByHotelIdOrderByRequestedAtDesc(Long hotelId);
}