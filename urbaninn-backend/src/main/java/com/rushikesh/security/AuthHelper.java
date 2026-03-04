package com.rushikesh.security;

import com.rushikesh.entity.User;
import com.rushikesh.exception.ResourceNotFoundException;
import com.rushikesh.exception.UnauthorizedException;
import com.rushikesh.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AuthHelper {

    private final UserRepository userRepository;

    // Get currently logged in User entity
    public User getCurrentUser() {
        Object principal = SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();

        String email;
        if (principal instanceof UserDetails userDetails) {
            email = userDetails.getUsername();
        } else {
            email = principal.toString();
        }

        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                    new ResourceNotFoundException("User not found"));
    }

    // Get hotel ID of currently logged-in staff
    public Long getCurrentUserHotelId() {
        User user = getCurrentUser();
        if (user.getHotel() == null) {
            throw new UnauthorizedException("No hotel assigned to this user");
        }
        return user.getHotel().getId();
    }
}