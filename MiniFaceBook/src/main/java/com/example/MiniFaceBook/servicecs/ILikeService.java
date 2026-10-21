package com.example.MiniFaceBook.servicecs;

import com.example.MiniFaceBook.entities.Like;
import com.example.MiniFaceBook.entities.Post;
import com.example.MiniFaceBook.entities.User;

import java.util.List;

public interface ILikeService {
    public List<Like> getLikesByPost(int postId) ;

    public boolean addLike(int userId,int postId);
    public boolean removeLike(int userId,int postId);

}
