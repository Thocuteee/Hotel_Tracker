package com.hoteltracker.service.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "web_configs")
@Data
@NoArgsConstructor
public class WebConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "brand_name", nullable = false)
    private String brandName;

    @Column(name = "logo_url")
    private String logoUrl;

    @Column(name = "hotline")
    private String hotline;

    @Column(name = "hero_video_url")
    private String heroVideoUrl;

    @Column(name = "promo_text")
    private String promoText;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
}
