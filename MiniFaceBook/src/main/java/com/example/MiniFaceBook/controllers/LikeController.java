package com.example.MiniFaceBook.controllers;

import com.example.MiniFaceBook.entities.Like;
import com.example.MiniFaceBook.servicecs.LikeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/posts")
public class LikeController {

    @Autowired
    LikeService likeService;

    @GetMapping("/post/{postId}")
    public List<Like> getByPost(@PathVariable int postId) {
        return likeService.getLikesByPost(postId);
    }

    @PostMapping("/{postId}/like")
    public ResponseEntity<Boolean> like(@PathVariable int postId,
                                        @RequestParam int userId) {
        boolean result = likeService.addLike(userId, postId);
        return result
            ? ResponseEntity.ok(true)
            : ResponseEntity.status(409).body(false);
    }

    @DeleteMapping("/{postId}/like")
    public ResponseEntity<Boolean> unlike(@PathVariable int postId,
                                          @RequestParam int userId) {
        boolean result = likeService.removeLike(userId, postId);
        return result
            ? ResponseEntity.ok(true)
            : ResponseEntity.notFound().build();
    }
}
