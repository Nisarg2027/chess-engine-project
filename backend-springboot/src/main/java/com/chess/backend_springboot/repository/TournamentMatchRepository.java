package com.chess.backend_springboot.repository;

import com.chess.backend_springboot.model.TournamentMatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TournamentMatchRepository extends JpaRepository<TournamentMatch, Long> {
    List<TournamentMatch> findByTournamentId(Long tournamentId);
}