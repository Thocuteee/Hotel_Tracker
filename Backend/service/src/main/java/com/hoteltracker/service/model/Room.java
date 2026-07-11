package com.hoteltracker.service.model;

import com.hoteltracker.service.model.enums.RoomBookingStatus;
import com.hoteltracker.service.model.enums.CleaningStatus;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "rooms")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Room {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "room_number", nullable = false, length = 10)
    private String roomNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_type_id", nullable = false)
    private RoomType roomType;

    @Enumerated(EnumType.STRING)
    @Column(name = "booking_status")
    @Builder.Default
    private RoomBookingStatus bookingStatus = RoomBookingStatus.AVAILABLE;

    @Enumerated(EnumType.STRING)
    @Column(name = "cleaning_status")
    @Builder.Default
    private CleaningStatus cleaningStatus = CleaningStatus.CLEAN;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(nullable = false)
    private Integer floor;

    public RoomBookingStatus getBookingStatus() {
        return bookingStatus != null ? bookingStatus : RoomBookingStatus.AVAILABLE;
    }

    public CleaningStatus getCleaningStatus() {
        return cleaningStatus != null ? cleaningStatus : CleaningStatus.CLEAN;
    }
}
