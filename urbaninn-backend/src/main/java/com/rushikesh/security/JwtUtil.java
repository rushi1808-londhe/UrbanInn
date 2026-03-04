package com.rushikesh.security;

import com.rushikesh.config.JwtProperties;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtUtil {

    private final JwtProperties jwtProperties;

    private SecretKey getSigningKey() {
        byte[] keyBytes = hexStringToByteArray(jwtProperties.getSecret());
        return Keys.hmacShaKeyFor(keyBytes);
    }

    // ── Generate token for staff/admin (email based) ──
    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("type", "STAFF");
        return buildToken(claims, userDetails.getUsername(), jwtProperties.getExpirationMs());
    }

    // ── Generate token for guest (phone based) ──
    public String generateGuestToken(String phoneNumber,
            Long guestSessionId, Long hotelId,
            String roomNumber) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("type", "GUEST");
        claims.put("guestSessionId", guestSessionId);
        claims.put("hotelId", hotelId);
        claims.put("roomNumber", roomNumber);
        return buildToken(claims, phoneNumber,
            jwtProperties.getGuestExpirationMs());
    }

    private String buildToken(Map<String, Object> claims, String subject, long expiration) {
        return Jwts.builder()
                .claims(claims)
                .subject(subject)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey())
                .compact();
    }

    // ── Extract subject (email or phone) ──
    public String extractSubject(String token) {
        return parseClaims(token).getSubject();
    }

    // ── Extract any claim ──
    public Object extractClaim(String token, String claimKey) {
        return parseClaims(token).get(claimKey);
    }

    // ── Validate token ──
    public boolean validateToken(String token, String subject) {
        try {
            String extracted = extractSubject(token);
            return extracted.equals(subject) && !isTokenExpired(token);
        } catch (JwtException | IllegalArgumentException e) {
            log.warn("Invalid JWT: {}", e.getMessage());
            return false;
        }
    }

    public boolean isTokenExpired(String token) {
        return parseClaims(token).getExpiration().before(new Date());
    }

    public boolean isGuestToken(String token) {
        Object type = extractClaim(token, "type");
        return "GUEST".equals(type);
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    // ── Hex string to byte array ──
    private byte[] hexStringToByteArray(String hex) {
        int len = hex.length();
        byte[] data = new byte[len / 2];
        for (int i = 0; i < len; i += 2) {
            data[i / 2] = (byte) ((Character.digit(hex.charAt(i), 16) << 4)
                    + Character.digit(hex.charAt(i + 1), 16));
        }
        return data;
    }
}