package ar.uba.fi.ingsoft1.todo_template.controller;

import ar.uba.fi.ingsoft1.todo_template.model.Experience;
import ar.uba.fi.ingsoft1.todo_template.repository.ExperienceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/experiences")
@CrossOrigin(origins = "*")
public class ExperienceController {
    
    @Autowired
    private ExperienceRepository experienceRepository;
    
    @GetMapping("/search")
    public ResponseEntity<List<Experience>> searchExperiences(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) BigDecimal minRating) {
        
        // Si category o location son "all", los convertimos a null
        String categoryFilter = (category != null && category.equals("all")) ? null : category;
        String locationFilter = (location != null && location.equals("all")) ? null : location;
        
        List<Experience> experiences = experienceRepository.searchExperiences(
            q, categoryFilter, locationFilter, minPrice, maxPrice, minRating
        );
        
        return ResponseEntity.ok(experiences);
    }
    
    @GetMapping
    public ResponseEntity<List<Experience>> getAllExperiences() {
        List<Experience> experiences = experienceRepository.findAll();
        return ResponseEntity.ok(experiences);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Experience> getExperienceById(@PathVariable Long id) {
        return experienceRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public ResponseEntity<Experience> createExperience(@RequestBody Experience experience) {
        Experience savedExperience = experienceRepository.save(experience);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedExperience);
    }
    
    @GetMapping("/locations")
    public ResponseEntity<List<String>> getAllLocations() {
        List<String> locations = experienceRepository.findAllLocations();
        return ResponseEntity.ok(locations);
    }
    
    @GetMapping("/categories")
    public ResponseEntity<List<String>> getAllCategories() {
        List<String> categories = experienceRepository.findAllCategories();
        return ResponseEntity.ok(categories);
    }
    
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of(
            "status", "OK",
            "message", "Backend funcionando correctamente"
        ));
    }
}