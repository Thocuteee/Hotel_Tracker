package com.hoteltracker.service.controller;

import com.hoteltracker.service.model.WebConfig;
import com.hoteltracker.service.repositories.WebConfigRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/web-config")
@RequiredArgsConstructor
public class AdminWebConfigController {

    private final WebConfigRepository webConfigRepository;

    @PostMapping
    public ResponseEntity<WebConfig> saveConfig(@RequestBody WebConfig request) {
        WebConfig saved = webConfigRepository.save(request);
        return ResponseEntity.ok(saved);
    }
}
