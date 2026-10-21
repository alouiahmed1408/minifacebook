package com.example.MiniFaceBook.repositories;

import com.example.MiniFaceBook.entities.Like;
import com.example.MiniFaceBook.entities.Post;
import com.example.MiniFaceBook.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LikeRepo extends JpaRepository<Like,Integer> {
        public List<Like> findAllByUser(User u);
        public List<Like> findAllByPost(Post p);
        public Like findById(int id);
        public Like findByUserAndPost(User u, Post p);

}
