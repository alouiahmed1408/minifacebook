package com.example.MiniFaceBook.controllers;


import com.example.MiniFaceBook.entities.Post;
import com.example.MiniFaceBook.servicecs.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
@CrossOrigin(origins ={ "http://localhost:49557", "http://localhost:4200"})
@RestController
@RequestMapping("/posts")
public class PostController {
    @Autowired
    PostService postService;

    @GetMapping
    public List<Post> getAll(){
        return postService.selectAll();
    }
    @GetMapping("/{id}")
    public Post getOne(@PathVariable("id") int code){
        return postService.findById(code);
    }
    @GetMapping("/postbydatecreation")
    public List<Post> getOneParam(@RequestParam("date") LocalDate date){
        return postService.findByDateCreation(date);
    }
    @PostMapping
    public boolean addPost(@RequestBody Post p){
        return postService.add(p);
    }
    @PutMapping("/{id}")
    public Post updatePost(@RequestBody Post p, @PathVariable("id") int code){
        return postService.updatePost(code,p);
    }
    @DeleteMapping("/{id}")
    public boolean deletePost(@PathVariable("id") int id){
        return  postService.deletePost(id);
    }



}
