package com.chess.backend_springboot.controller;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.chess.backend_springboot.model.Tournament;
import com.chess.backend_springboot.model.TournamentMatch;
import com.chess.backend_springboot.repository.TournamentMatchRepository;
import com.chess.backend_springboot.repository.TournamentRepository;

@RestController
@RequestMapping("/api/tournaments")
@CrossOrigin(origins = "https://chess-engine-project.vercel.app", allowCredentials = "true")
public class TournamentController {

    @Autowired
    private TournamentRepository tournamentRepo;

    @Autowired
    private TournamentMatchRepository matchRepo;

    // 1. ADMIN: Create a new tournament
    @PostMapping("/create")
    public ResponseEntity<?> createTournament(@RequestBody Map<String, String> payload) {
        Tournament t = new Tournament();
        t.setName(payload.get("name"));
        t.setScheduledStartTime(LocalDateTime.now().plusHours(1)); // Starts in 1 hour by default
        t.setStatus("PENDING");
        t.setRegisteredPlayers("");
        tournamentRepo.save(t);
        return ResponseEntity.ok(t);
    }

    // 2. PLAYER: Get all pending tournaments to join
    @GetMapping("/")
    public ResponseEntity<List<Tournament>> getAllTournaments() {
        return ResponseEntity.ok(tournamentRepo.findAll());
    }

    // 3. PLAYER: Register for a tournament
    @PostMapping("/{id}/register")
    public ResponseEntity<?> registerPlayer(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        Tournament t = tournamentRepo.findById(id).orElse(null);
        if (t == null) return ResponseEntity.badRequest().body("Tournament not found");
        
        String username = payload.get("username");
        String currentPlayers = t.getRegisteredPlayers();
        
        List<String> playerList = new ArrayList<>(Arrays.asList(currentPlayers.split(",")));
        playerList.removeIf(String::isEmpty); // Remove empty strings

        if (playerList.size() >= 8) {
            return ResponseEntity.badRequest().body("Tournament is full! (8/8 players)");
        }
        if (playerList.contains(username)) {
            return ResponseEntity.badRequest().body("You are already registered!");
        }

        playerList.add(username);
        t.setRegisteredPlayers(String.join(",", playerList));
        tournamentRepo.save(t);
        
        return ResponseEntity.ok(t);
    }

    // 4. ADMIN: Start the tournament and generate Round 1 bracket
    @PostMapping("/{id}/start")
    public ResponseEntity<?> startTournament(@PathVariable Long id) {
        Tournament t = tournamentRepo.findById(id).orElse(null);
        if (t == null) return ResponseEntity.badRequest().body("Tournament not found");

        String[] players = t.getRegisteredPlayers().split(",");
        if (players.length != 8) {
            return ResponseEntity.badRequest().body("Cannot start: Need exactly 8 players.");
        }

        // Shuffle players for random matchmaking
        List<String> shuffledPlayers = Arrays.asList(players);
        Collections.shuffle(shuffledPlayers);

        // Create 4 matches for Round 1
        for (int i = 0; i < 8; i += 2) {
            TournamentMatch match = new TournamentMatch();
            match.setTournamentId(t.getId());
            match.setRoundNumber(1);
            match.setPlayerWhite(shuffledPlayers.get(i));
            match.setPlayerBlack(shuffledPlayers.get(i + 1));
            
            // Generate a random 4-letter room code for this match
            String roomCode = UUID.randomUUID().toString().substring(0, 4).toUpperCase();
            match.setMatchRoomCode(roomCode);
            
            matchRepo.save(match);
        }

        t.setStatus("IN_PROGRESS");
        tournamentRepo.save(t);

        return ResponseEntity.ok("Tournament started! Brackets generated.");
    }

    // 5. ANYONE: Get matches for a tournament
    @GetMapping("/{id}/matches")
    public ResponseEntity<List<TournamentMatch>> getTournamentMatches(@PathVariable Long id) {
        return ResponseEntity.ok(matchRepo.findByTournamentId(id));
    }
}