package com.example.MiniFaceBook.servicecs;

import com.example.MiniFaceBook.entities.Comment;
import com.example.MiniFaceBook.entities.Post;
import com.example.MiniFaceBook.entities.User;
import com.example.MiniFaceBook.repositories.CommentRepo;
import com.example.MiniFaceBook.repositories.PostRepo;
import com.example.MiniFaceBook.repositories.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class CommentService implements ICommentService {

    @Autowired
    private CommentRepo commentRepo;

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private PostRepo postRepo;

    @Override
    public Comment addComment(int userId, int postId, String c) {
        User user = userRepo.findById(userId).orElse(null);
        Post post = postRepo.findById(postId);

        if (user == null || post == null) return null;

        Comment comment = new Comment();
        comment.setContent(c);
        comment.setUser(user);
        comment.setPost(post);
        comment.setDateCreation(LocalDate.now());
        return commentRepo.save(comment);
    }

    @Override
    public List<Comment> getCommentsByPost(int postId) {
        Post post = postRepo.findById(postId);
        return commentRepo.findByPost(post);
    }

    @Override
    public boolean deleteComment(int commentId) {
        Comment comment = commentRepo.findById(commentId);
        if (comment == null) return false;
        commentRepo.delete(comment);
        return true;
    }

    @Override
    public Comment updateComment(int commentId, String content) {
        Comment comment = commentRepo.findById(commentId);
        if (comment == null) return null;
        comment.setContent(content);
        comment.setDateCreation(LocalDate.now());
        return commentRepo.save(comment);
    }
}
