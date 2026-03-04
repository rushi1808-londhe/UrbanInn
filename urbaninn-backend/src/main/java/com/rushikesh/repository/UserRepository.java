package com.rushikesh.repository;

import com.rushikesh.entity.User;
import com.rushikesh.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    List<User> findByHotelId(Long hotelId);
    List<User> findByHotelIdAndRole(Long hotelId, Role role);
    boolean existsByEmail(String email);
}