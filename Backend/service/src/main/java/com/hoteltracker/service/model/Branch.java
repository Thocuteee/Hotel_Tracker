package com.hoteltracker.service.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "branches")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Branch {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Column(nullable = false, length = 255)
    private String address;

    @Column(length = 20)
    private String phone;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "image_url")
    private String imageUrl;
}
