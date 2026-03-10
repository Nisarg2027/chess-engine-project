package com.chess.backend_springboot.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "users") // "user" is a reserved keyword in some databases, so we use "users"
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    // Feature 1: The Trophy/Rating System
    private int eloRating = 1200; // Everyone starts at 1200 Elo
    private int gamesPlayed = 0;
    private int wins = 0;
    private int losses = 0;

    // --- Getters and Setters ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public int getEloRating() { return eloRating; }
    public void setEloRating(int eloRating) { this.eloRating = eloRating; }

    public int getGamesPlayed() { return gamesPlayed; }
    public void setGamesPlayed(int gamesPlayed) { this.gamesPlayed = gamesPlayed; }

    public int getWins() { return wins; }
    public void setWins(int wins) { this.wins = wins; }

    public int getLosses() { return losses; }
    public void setLosses(int losses) { this.losses = losses; }

    // ROLE_PLAYER or ROLE_ADMIN
    private String role = "ROLE_PLAYER"; 

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}