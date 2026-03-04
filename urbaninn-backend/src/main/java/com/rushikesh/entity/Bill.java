package com.rushikesh.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "bills")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Bill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "guest_session_id")
    private GuestSession guestSession;

    @Column(name = "room_charges")
    private Double roomCharges;

    @Column(name = "food_charges")
    private Double foodCharges;

    @Column(name = "total_amount")
    private Double totalAmount;

    @Column(name = "generated_at")
    private LocalDateTime generatedAt;

    @Column(name = "checked_out_at")
    private LocalDateTime checkedOutAt;
}