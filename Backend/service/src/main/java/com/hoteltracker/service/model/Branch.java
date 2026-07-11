package com.hoteltracker.service.model;

import jakarta.persistence.*;
import lombok.*;
import com.hoteltracker.service.model.enums.PropertyType;
import com.hoteltracker.service.model.enums.BranchStatus;
import java.util.List;
import java.util.Set;

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

    @Enumerated(EnumType.STRING)
    @Column(name = "property_type")
    @Builder.Default
    private PropertyType propertyType = PropertyType.HOTEL;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    @Builder.Default
    private BranchStatus status = BranchStatus.ACTIVE;

    @Column(name = "star_rating")
    private Integer starRating;

    @Column(name = "email")
    private String email;

    @Column(name = "check_in_time")
    @Builder.Default
    private String checkInTime = "14:00";

    @Column(name = "check_out_time")
    @Builder.Default
    private String checkOutTime = "12:00";

    @Column(name = "website")
    private String website;

    @Column(name = "slug")
    private String slug;

    @Column(name = "gallery_images", columnDefinition = "TEXT")
    private String galleryImages;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "branch_services",
        joinColumns = @JoinColumn(name = "branch_id"),
        inverseJoinColumns = @JoinColumn(name = "service_id")
    )
    private Set<ServiceItem> services;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "branch_amenities",
        joinColumns = @JoinColumn(name = "branch_id"),
        inverseJoinColumns = @JoinColumn(name = "amenity_id")
    )
    private Set<Amenity> amenities;
}
