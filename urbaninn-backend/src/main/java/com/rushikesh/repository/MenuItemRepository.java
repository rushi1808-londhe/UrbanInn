package com.rushikesh.repository;

import com.rushikesh.entity.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {
    List<MenuItem> findByHotelIdAndAvailableTrue(Long hotelId);
    List<MenuItem> findByHotelId(Long hotelId);
    List<MenuItem> findByHotelIdAndCategory(Long hotelId, String category);
}