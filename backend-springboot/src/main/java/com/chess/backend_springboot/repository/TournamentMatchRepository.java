package com.chess.backend_springboot.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.chess.backend_springboot.model.TournamentMatch; // <-- Make sure to import Optional!

@Repository
public interface TournamentMatchRepository extends JpaRepository<TournamentMatch, Long> {
    List<TournamentMatch> findByTournamentId(Long tournamentId);
    
    // NEW: Find a match by its room code
    Optional<TournamentMatch> findByMatchRoomCode(String matchRoomCode);
}