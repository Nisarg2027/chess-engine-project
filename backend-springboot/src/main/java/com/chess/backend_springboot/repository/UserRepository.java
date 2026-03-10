package com.chess.backend_springboot.repository;

import com.chess.backend_springboot.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

// JpaRepository provides built-in methods like save(), findAll(), findById(), etc.
public interface UserRepository extends JpaRepository<User, Long> {
    
    // Spring magic: Just by naming the method this way, Spring writes the SQL query for us!
    Optional<User> findByUsername(String username);
    
    boolean existsByUsername(String username);
}