package com.example.MiniFaceBook.repositories;

import com.example.MiniFaceBook.entities.Comment;
import com.example.MiniFaceBook.entities.Post;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepo extends JpaRepository<Comment,Integer> {
    Comment findById(int id);
    List<Comment> findByPost(Post post);
}
