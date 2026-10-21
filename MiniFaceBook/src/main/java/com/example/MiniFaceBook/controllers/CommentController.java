package com.example.MiniFaceBook.controllers;

import com.example.MiniFaceBook.entities.Comment;
import com.example.MiniFaceBook.servicecs.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = {"http://localhost:49557", "http://localhost:4200"})
@RestController
@RequestMapping("/comments")
public class CommentController {

    @Autowired
    private CommentService commentService;

    @PostMapping
    public ResponseEntity<Comment> addComment(@RequestParam int userId,
                                              @RequestParam int postId,
                                              @RequestBody String c) {
        Comment comment = commentService.addComment(userId, postId, c);
        if (comment == null) return ResponseEntity.badRequest().build();
        return ResponseEntity.status(HttpStatus.CREATED).body(comment);
    }

    @GetMapping("/post/{postId}")
    public List<Comment> getByPost(@PathVariable int postId) {
        return commentService.getCommentsByPost(postId);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable int id) {
        boolean deleted = commentService.deleteComment(id);
        return deleted
            ? ResponseEntity.noContent().build()
            : ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Comment> update(@PathVariable int id,
                                          @RequestParam String content) {
        Comment updated = commentService.updateComment(id, content);
        if (updated == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(updated);
    }
}
