package com.example.MiniFaceBook.servicecs;

import com.example.MiniFaceBook.entities.Post;
import com.example.MiniFaceBook.entities.User;
import com.example.MiniFaceBook.repositories.PostRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;


@Service
public class PostService implements IPostService{

    @Autowired
    private PostRepo postRepo;

    @Override
    public List<Post> selectAll() {
        return postRepo.findAll();
    }

    @Override
    public Post findById(int id) {
        return postRepo.findById(id);
    }

    @Override
    public boolean add(Post p) {
        if(postRepo.findById(p.getIdPost())==null){
            postRepo.save(p);
            return true;
        }

        return false;
    }

    @Override
    public Post updatePost(int id, Post p) {
        Post pt=findById(id);
        pt.setIdPost(p.getIdPost());
        pt.setAuthor(p.getAuthor());
        pt.setComments(p.getComments());
        pt.setContent(p.getContent());
        pt.setImage(p.getImage());
        pt.setLikes(p.getLikes());
        pt.setDateCreation(p.getDateCreation());
        return pt;
    }

    @Override
    public boolean deletePost(int id) {
        if(postRepo.findById(id)==null){
            return false;
        }
        postRepo.deleteById(id);
        return true;
    }

    @Override
    public List<Post> findByDateCreation(LocalDate dateCreation) {
        return postRepo.findByDateCreation(dateCreation);
    }

    @Override
    public List<Post> findAllByAuthor(User u) {
        return postRepo.findAllByAuthor(u);
    }
}
