package com.example.MiniFaceBook.servicecs;

import com.example.MiniFaceBook.entities.Like;
import com.example.MiniFaceBook.entities.Post;
import com.example.MiniFaceBook.entities.User;
import com.example.MiniFaceBook.repositories.LikeRepo;
import com.example.MiniFaceBook.repositories.PostRepo;
import com.example.MiniFaceBook.repositories.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LikeService implements ILikeService {

    @Autowired
    LikeRepo likeRepo;

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private PostRepo postRepo;

    @Override
    public List<Like> getLikesByPost(int postId) {
        Post p = postRepo.findById(postId);
        return likeRepo.findAllByPost(p);
    }

    @Override
    public boolean addLike(int userId, int postId) {
        User u = userRepo.findById(userId).orElse(null);
        Post p = postRepo.findById(postId);

        if (u == null || p == null) return false;
        if (likeRepo.findByUserAndPost(u, p) != null) return false;

        Like like = new Like();
        like.setPost(p);
        like.setUser(u);
        likeRepo.save(like);
        return true;
    }

    @Override
    public boolean removeLike(int userId, int postId) {
        User u = userRepo.findById(userId).orElse(null);
        Post p = postRepo.findById(postId);

        if (u == null || p == null) return false;

        Like like = likeRepo.findByUserAndPost(u, p);
        if (like == null) return false;

        likeRepo.delete(like);
        return true;
    }
}
