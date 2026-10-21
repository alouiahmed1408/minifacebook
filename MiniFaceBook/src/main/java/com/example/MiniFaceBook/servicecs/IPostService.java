package com.example.MiniFaceBook.servicecs;

import com.example.MiniFaceBook.entities.Post;
import com.example.MiniFaceBook.entities.User;

import java.time.LocalDate;
import java.util.List;

public interface IPostService {
    public List<Post> selectAll();
    public Post findById(int id);
    public boolean add(Post p);
    public Post updatePost(int id,Post p);
    public boolean deletePost(int id);
    public List<Post> findByDateCreation(LocalDate dateCreation);
    public List<Post> findAllByAuthor(User u);
}
