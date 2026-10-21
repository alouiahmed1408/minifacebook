package com.example.MiniFaceBook;

import com.example.MiniFaceBook.entities.Post;
import com.example.MiniFaceBook.entities.User;
import com.example.MiniFaceBook.repositories.PostRepo;
import com.example.MiniFaceBook.repositories.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

@SpringBootApplication
public class MiniFaceBookApplication implements CommandLineRunner {

	public static void main(String[] args) {
		SpringApplication.run(MiniFaceBookApplication.class, args);
	}
	@Autowired
	private UserRepo userRepo;
	@Autowired
	private PostRepo postRepo;
	@Autowired
	private PasswordEncoder passwordEncoder;
	@Value("${app.seed.enabled:true}")
	private boolean seedEnabled;

	@Override
	public void run(String... args) throws Exception{

		// demo data: only when enabled AND the database is still empty
		if (!seedEnabled || userRepo.count() > 0) {
			return;
		}



		User u1=new User( "Khalil",  "alouiahmed.1408@gmail.com",  passwordEncoder.encode("sabrixD"),  "Life goes on",  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTGEOjCR1mr-ukriVfbG4HAZhqFGXqcy1Oaqw&s");

		userRepo.save(u1);
		User u2=new User( "Khalil",  "aloui@gmail.com",  passwordEncoder.encode("abdou"),  "Life goes on",  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTGEOjCR1mr-ukriVfbG4HAZhqFGXqcy1Oaqw&s");

		userRepo.save(u2);
		System.out.println(u1.toString());
		List<User> users = userRepo.findAll();
		Post post1 = new Post();
		post1.setContent("My First Post");
		post1.setContent("This is the content of my first post!");
		post1.setAuthor(u2);
		postRepo.save(post1);

		Post post2 = new Post("Another Post");
		post2.setAuthor(u2);
		postRepo.save(post2);
		List<Post> posts=postRepo.findAll();

		for (User u : users) {
			System.out.println(u.toString());
		}
		for (Post p : posts) {
			System.out.println(p.toString());
		}
	}

}
