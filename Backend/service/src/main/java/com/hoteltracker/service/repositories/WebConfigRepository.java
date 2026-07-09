package com.hoteltracker.service.repositories;

import com.hoteltracker.service.model.WebConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
    public interface WebConfigRepository extends JpaRepository<WebConfig, Integer> {
}
