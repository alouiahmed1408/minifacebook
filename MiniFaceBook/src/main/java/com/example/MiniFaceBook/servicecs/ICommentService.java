package com.example.MiniFaceBook.servicecs;

import com.example.MiniFaceBook.entities.Comment;

import java.util.List;

public interface ICommentService {
    public boolean deleteComment(int commentId);
    public List<Comment> getCommentsByPost(int postId);
    public Comment addComment(int userId,int postId,String c);
    public Comment updateComment(int commentId, String content);
}
