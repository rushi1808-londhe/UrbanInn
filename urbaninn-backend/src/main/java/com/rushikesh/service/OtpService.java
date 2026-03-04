package com.rushikesh.service;

import com.rushikesh.config.OtpProperties;
import com.rushikesh.entity.GuestSession;
import com.rushikesh.repository.GuestSessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class OtpService {

    private final OtpProperties otpProperties;
    private final GuestSessionRepository guestSessionRepository;
    private final SecureRandom secureRandom = new SecureRandom();

    // ── Generate and save OTP to guest session ──
    public String generateAndSaveOtp(GuestSession guestSession) {
        String otp = generateOtp();

        guestSession.setOtpCode(otp);
        guestSession.setOtpExpiresAt(
            LocalDateTime.now().plusMinutes(otpProperties.getExpiryMinutes())
        );
        guestSessionRepository.save(guestSession);

        // TODO: In production, send via Twilio/MSG91
        // For development, log to console
        log.info("====================================");
        log.info("OTP for {} : {}", guestSession.getPhoneNumber(), otp);
        log.info("====================================");

        return otp;
    }

    // ── Verify OTP ──
    public boolean verifyOtp(GuestSession guestSession, String inputOtp) {
        if (guestSession.getOtpCode() == null) {
            log.warn("No OTP found for guest session {}", guestSession.getId());
            return false;
        }

        if (LocalDateTime.now().isAfter(guestSession.getOtpExpiresAt())) {
            log.warn("OTP expired for guest session {}", guestSession.getId());
            return false;
        }

        boolean valid = guestSession.getOtpCode().equals(inputOtp);

        if (valid) {
            // clear OTP after successful verification
            guestSession.setOtpCode(null);
            guestSession.setOtpExpiresAt(null);
            guestSessionRepository.save(guestSession);
        }

        return valid;
    }

    // ── Generate numeric OTP ──
    private String generateOtp() {
        int length = otpProperties.getLength();
        StringBuilder otp = new StringBuilder();
        for (int i = 0; i < length; i++) {
            otp.append(secureRandom.nextInt(10));
        }
        return otp.toString();
    }
}