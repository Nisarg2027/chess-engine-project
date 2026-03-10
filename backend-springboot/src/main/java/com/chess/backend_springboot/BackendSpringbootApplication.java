package com.chess.backend_springboot;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import com.chess.backend_springboot.ml.DataGenerator;
@SpringBootApplication
public class BackendSpringbootApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendSpringbootApplication.class, args);
	}
	@Bean
	public CommandLineRunner runDataGenerator() {
		return args -> {
            System.out.println("Starting the ML Pipeline...");
            DataGenerator.generateDataset("src/main/resources/Kasparov.pgn", "chess_dataset.csv");
        };
	}
}


