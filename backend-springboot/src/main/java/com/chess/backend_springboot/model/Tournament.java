package com.chess.backend_springboot.model;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "tournaments")
public class Tournament {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private LocalDateTime scheduledStartTime;
    
    // Status: PENDING, IN_PROGRESS, COMPLETED
    private String status = "PENDING"; 

    // A comma-separated list of the 8 registered usernames
    private String registeredPlayers = "";

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public LocalDateTime getScheduledStartTime() { return scheduledStartTime; }
    public void setScheduledStartTime(LocalDateTime scheduledStartTime) { this.scheduledStartTime = scheduledStartTime; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getRegisteredPlayers() { return registeredPlayers; }
    public void setRegisteredPlayers(String registeredPlayers) { this.registeredPlayers = registeredPlayers; }
    private String boardTheme = "standard";

    public String getBoardTheme() { return boardTheme; }
    public void setBoardTheme(String boardTheme) { this.boardTheme = boardTheme; }
}