package com.rushikesh.repository;

import com.rushikesh.entity.FoodOrder;
import com.rushikesh.enums.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FoodOrderRepository extends JpaRepository<FoodOrder, Long> {

    // kitchen staff — see all active orders for their hotel
    List<FoodOrder> findByHotelIdAndStatusNotOrderByPlacedAtAsc(
        Long hotelId, OrderStatus status
    );

    // guest — see their own orders
    List<FoodOrder> findByGuestSessionIdOrderByPlacedAtDesc(Long guestSessionId);

    // hotel admin — all orders
    List<FoodOrder> findByHotelIdOrderByPlacedAtDesc(Long hotelId);
}