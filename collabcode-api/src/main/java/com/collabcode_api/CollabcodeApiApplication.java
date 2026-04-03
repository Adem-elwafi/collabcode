package com.collabcode_api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class CollabcodeApiApplication {

	public static void main(String[] args) {
		SpringApplication.run(CollabcodeApiApplication.class, args);
	}

}
