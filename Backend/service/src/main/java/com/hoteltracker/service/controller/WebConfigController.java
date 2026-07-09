package com.hoteltracker.service.controller;

import com.hoteltracker.service.model.WebConfig;
import com.hoteltracker.service.repositories.WebConfigRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/public/web-config")
@RequiredArgsConstructor
public class WebConfigController {

    private final WebConfigRepository webConfigRepository;

    @GetMapping
    public ResponseEntity<WebConfig> getLatestConfig() {
        List<WebConfig> configs = webConfigRepository.findAll();
        if (configs.isEmpty()) {
            WebConfig defaultConfig = new WebConfig();
            defaultConfig.setBrandName("Lumiere Stay");
            defaultConfig.setHeroVideoUrl("https://cdn.pixabay.com/video/2021/08/25/86278-592982852_large.mp4");
            return ResponseEntity.ok(defaultConfig);
        }
        return ResponseEntity.ok(configs.get(configs.size() - 1));
    }
}
