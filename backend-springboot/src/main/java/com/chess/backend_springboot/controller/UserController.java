package com.chess.backend_springboot.controller;

import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.chess.backend_springboot.model.User;
import com.chess.backend_springboot.repository.UserRepository;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "https://chess-engine-project.vercel.app", allowCredentials = "true") // <--- ADD THIS LINE
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // 1. REGISTRATION ENDPOINT
    @PostMapping("/register")
    public ResponseEntity<String> registerUser(@RequestBody User user) {
        if (userRepository.existsByUsername(user.getUsername())) {
            return ResponseEntity.badRequest().body("Username already exists!");
        }
        
        // Save the new user to the H2 Database
        userRepository.save(user);
        return ResponseEntity.ok("User registered successfully!");
    }

    // 2. LOGIN ENDPOINT
    @PostMapping("/login")
    public ResponseEntity<User> loginUser(@RequestBody User loginRequest) {
        Optional<User> userOptional = userRepository.findByUsername(loginRequest.getUsername());
        
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            // In a production app, we would hash this password. For now, we do a direct check.
            if (user.getPassword().equals(loginRequest.getPassword())) {
                return ResponseEntity.ok(user); // Send the user profile (and Elo rating) back to React
            }
        }
        return ResponseEntity.status(401).build(); // 401 Unauthorized
    }
    // 3. UPDATE ELO RATING (TROPHY SYSTEM)
    @PostMapping("/update-rating")
    public ResponseEntity<User> updateRating(@RequestBody GameResultRequest request) {
        Optional<User> userOptional = userRepository.findByUsername(request.getUsername());
        
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            user.setGamesPlayed(user.getGamesPlayed() + 1);
            
            // Standard Trophy Math
            if ("win".equalsIgnoreCase(request.getOutcome())) {
                user.setEloRating(user.getEloRating() + 30);
                user.setWins(user.getWins() + 1);
            } else if ("loss".equalsIgnoreCase(request.getOutcome())) {
                // Prevent Elo from dropping below 0
                user.setEloRating(Math.max(0, user.getEloRating() - 30));
                user.setLosses(user.getLosses() + 1);
            }
            
            // Save the new stats back to the database
            userRepository.save(user);
            
            // Return the updated profile to React
            return ResponseEntity.ok(user);
        }
        return ResponseEntity.notFound().build();
    }
}