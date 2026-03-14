package com.chess.backend_springboot.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "tournament_matches")
public class TournamentMatch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long tournamentId;
    
    // Round 1 (Quarterfinals), Round 2 (Semifinals), Round 3 (Finals)
    private int roundNumber; 

    private String playerWhite;
    private String playerBlack;
    private String winner;
    
    // We can use the same Room code logic we built earlier!
    private String matchRoomCode; 

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getTournamentId() { return tournamentId; }
    public void setTournamentId(Long tournamentId) { this.tournamentId = tournamentId; }
    public int getRoundNumber() { return roundNumber; }
    public void setRoundNumber(int roundNumber) { this.roundNumber = roundNumber; }
    public String getPlayerWhite() { return playerWhite; }
    public void setPlayerWhite(String playerWhite) { this.playerWhite = playerWhite; }
    public String getPlayerBlack() { return playerBlack; }
    public void setPlayerBlack(String playerBlack) { this.playerBlack = playerBlack; }
    public String getWinner() { return winner; }
    public void setWinner(String winner) { this.winner = winner; }
    public String getMatchRoomCode() { return matchRoomCode; }
    public void setMatchRoomCode(String matchRoomCode) { this.matchRoomCode = matchRoomCode; }
    private String matchTheme = "standard";

    public String getMatchTheme() { return matchTheme; }
    public void setMatchTheme(String matchTheme) { this.matchTheme = matchTheme; }
}