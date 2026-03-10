package com.chess.backend_springboot.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.chess.backend_springboot.model.Tournament;

@Repository
public interface TournamentRepository extends JpaRepository<Tournament, Long> {
}