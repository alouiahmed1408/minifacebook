package com.example.MiniFaceBook.repositories;

import com.example.MiniFaceBook.entities.Post;
import com.example.MiniFaceBook.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface PostRepo extends JpaRepository<Post,Integer> {
    public List<Post> findByDateCreation(LocalDate dateCreation);
    public Post findById(int id);
    public List<Post> findAllByAuthor(User u);
}
