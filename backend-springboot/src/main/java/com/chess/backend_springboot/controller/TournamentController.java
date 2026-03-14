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
import org.springframework.web.bind.annotation.DeleteMapping;
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
@CrossOrigin(origins = { "https://chess-engine-project.vercel.app",
        "http://localhost:5173" }, allowCredentials = "true")
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
        t.setBoardTheme(payload.getOrDefault("theme", "standard"));
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
        if (t == null)
            return ResponseEntity.badRequest().body("Tournament not found");

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

    // 4. ADMIN: Start the tournament and generate Round 1 bracket (HACKED FOR
    // 2-PLAYER TESTING)
    @PostMapping("/{id}/start")
    public ResponseEntity<?> startTournament(@PathVariable Long id) {
        Tournament t = tournamentRepo.findById(id).orElse(null);
        if (t == null) return ResponseEntity.badRequest().body("Tournament not found");

        // Clean up the player list to ensure no empty strings
        String[] rawPlayers = t.getRegisteredPlayers() != null ? t.getRegisteredPlayers().split(",") : new String[0];
        List<String> players = Arrays.stream(rawPlayers).filter(p -> !p.trim().isEmpty()).toList();
        
        int numPlayers = players.size();

        // Validate that we have a proper power of 2 for a clean bracket (2, 4, 8, or 16)
        boolean isPowerOfTwo = (numPlayers > 1) && ((numPlayers & (numPlayers - 1)) == 0);
        
        if (!isPowerOfTwo) {
            return ResponseEntity.badRequest().body("Cannot start: Tournaments require exactly 2, 4, 8, or 16 players. You currently have " + numPlayers + ".");
        }

        // Shuffle players so matchups and colors are randomized
        List<String> shuffledPlayers = new ArrayList<>(players);
        Collections.shuffle(shuffledPlayers);

        // Generate Round 1 Matchups
        for (int i = 0; i < shuffledPlayers.size(); i += 2) {
            TournamentMatch match = new TournamentMatch();
            match.setTournamentId(t.getId());
            match.setRoundNumber(1);
            match.setPlayerWhite(shuffledPlayers.get(i));
            match.setPlayerBlack(shuffledPlayers.get(i + 1));
            match.setMatchTheme(t.getBoardTheme() != null ? t.getBoardTheme() : "standard");
            
            // Generate a random 4-letter room code for this match
            String roomCode = UUID.randomUUID().toString().substring(0, 4).toUpperCase();
            match.setMatchRoomCode(roomCode);
            
            matchRepo.save(match);
        }

        t.setStatus("IN_PROGRESS");
        tournamentRepo.save(t);

        return ResponseEntity.ok("Tournament started with " + numPlayers + " players! Round 1 generated."); 
    }

    // 5. ANYONE: Get matches for a tournament
    @GetMapping("/{id}/matches")
    public ResponseEntity<List<TournamentMatch>> getTournamentMatches(@PathVariable Long id) {
        return ResponseEntity.ok(matchRepo.findByTournamentId(id));
    }

    // 6. SYSTEM: Record match result and advance bracket
    @PostMapping("/match/{roomCode}/result")
    public ResponseEntity<?> reportMatchResult(@PathVariable String roomCode,
            @RequestBody Map<String, String> payload) {
        TournamentMatch match = matchRepo.findByMatchRoomCode(roomCode).orElse(null);
        if (match == null)
            return ResponseEntity.badRequest().body("Match not found");

        // Prevent double saving if both players try to report the result
        if (match.getWinner() != null)
            return ResponseEntity.ok("Result already recorded");

        // Replace matchRepo.save(match); with this:
        match.setWinner(payload.get("winner"));
        matchRepo.saveAndFlush(match); // Forces PostgreSQL to update instantly

        // Check if all matches in this round are finished
        List<TournamentMatch> roundMatches = matchRepo.findByTournamentId(match.getTournamentId()).stream()
                .filter(m -> m.getRoundNumber() == match.getRoundNumber())
                .toList();

        boolean allComplete = roundMatches.stream().allMatch(m -> m.getWinner() != null);

        if (allComplete) {
            if (roundMatches.size() == 1) {
                // If there was only 1 match, that was the Finals! Tournament over.
                Tournament t = tournamentRepo.findById(match.getTournamentId()).orElse(null);
                if (t != null) {
                    t.setStatus("COMPLETED - Winner: " + match.getWinner());
                    tournamentRepo.save(t);
                }
            } else {
                // Generate the next round! Pair up the winners.
                List<String> winners = roundMatches.stream().map(TournamentMatch::getWinner).toList();
                for (int i = 0; i < winners.size(); i += 2) {
                    TournamentMatch nextMatch = new TournamentMatch();
                    Tournament t = tournamentRepo.findById(match.getTournamentId()).orElse(null);
                    nextMatch.setMatchTheme(t != null ? t.getBoardTheme() : "standard");
                    nextMatch.setTournamentId(match.getTournamentId());
                    nextMatch.setRoundNumber(match.getRoundNumber() + 1);
                    nextMatch.setPlayerWhite(winners.get(i));
                    nextMatch.setPlayerBlack(winners.get(i + 1));
                    nextMatch.setMatchRoomCode(UUID.randomUUID().toString().substring(0, 4).toUpperCase());
                    matchRepo.save(nextMatch);
                }
            }
        }
        return ResponseEntity.ok("Match recorded");
    }
    
    // 7. ADMIN: Delete a tournament and all its matches
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTournament(@PathVariable Long id) {
        Tournament t = tournamentRepo.findById(id).orElse(null);
        if (t == null) return ResponseEntity.badRequest().body("Tournament not found");

        // Delete all matches associated with this tournament first to prevent database errors
        List<TournamentMatch> matches = matchRepo.findByTournamentId(id);
        matchRepo.deleteAll(matches);

        // Delete the tournament itself
        tournamentRepo.delete(t);

        return ResponseEntity.ok("Tournament deleted successfully");
    }
}