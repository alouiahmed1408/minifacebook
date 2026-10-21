package com.example.MiniFaceBook.repositories;

import com.example.MiniFaceBook.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserRepo extends JpaRepository<User,Integer> {

    List<User> findByNom(String nom);

    User findByEmail(String email);

    User findByEmailAndPassword(String email, String password);
}
