package com.rushikesh.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);

        try {
            // ── Guest token handling ──
            if (jwtUtil.isGuestToken(token)) {
                String phoneNumber = jwtUtil.extractSubject(token);

                if (phoneNumber != null && !jwtUtil.isTokenExpired(token)
                        && SecurityContextHolder.getContext().getAuthentication() == null) {

                    Long guestSessionId = ((Number) jwtUtil.extractClaim(token, "guestSessionId")).longValue();
                    Long hotelId = ((Number) jwtUtil.extractClaim(token, "hotelId")).longValue();

                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(
                                    phoneNumber,
                                    null,
                                    List.of(new SimpleGrantedAuthority("ROLE_GUEST"))
                            );

                    // store guest context in request for controllers to use
                    request.setAttribute("guestSessionId", guestSessionId);
                    request.setAttribute("hotelId", hotelId);
                    request.setAttribute("phoneNumber", phoneNumber);

                    authToken.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                    );
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }

            } else {
                // ── Staff/Admin token handling ──
                String email = jwtUtil.extractSubject(token);

                if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    UserDetails userDetails = userDetailsService.loadUserByUsername(email);

                    if (jwtUtil.validateToken(token, userDetails.getUsername())) {
                        UsernamePasswordAuthenticationToken authToken =
                                new UsernamePasswordAuthenticationToken(
                                        userDetails,
                                        null,
                                        userDetails.getAuthorities()
                                );
                        authToken.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request)
                        );
                        SecurityContextHolder.getContext().setAuthentication(authToken);
                    }
                }
            }

        } catch (Exception e) {
            log.error("JWT Auth Filter error: {}", e.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}