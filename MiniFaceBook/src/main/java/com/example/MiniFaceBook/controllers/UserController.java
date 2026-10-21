package com.example.MiniFaceBook.controllers;


import com.example.MiniFaceBook.dto.LoginRequest;
import com.example.MiniFaceBook.entities.User;
import com.example.MiniFaceBook.servicecs.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = {"http://localhost:49557", "http://localhost:4200"})
@RestController
public class UserController {

    @Autowired
    UserService userService;

    @GetMapping("/users")
    public List<User> getAll() { return userService.selectAll(); }

    @GetMapping("/users/{id}")
    public User getOne(@PathVariable("id") int code) { return userService.selectById(code); }

    @PostMapping("/login")
    public ResponseEntity<User> login(@RequestBody LoginRequest req) {
        User user = userService.FinfByEmailAndPassword(req.email(), req.password());
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(user);
    }

    @GetMapping("/userbyname")
    public List<User> searchByName(@RequestParam("nom") String nom) {
        return userService.findAllByNom(nom);
    }

    @PostMapping("/users")
    public boolean addUser(@RequestBody User u) {
        return userService.add(u);
    }

    @PutMapping("/users/{id}")
    public User updateUser(@RequestBody User u, @PathVariable("id") int code) {
        return userService.updateUser(code, u);
    }

    @DeleteMapping("/users/{id}")
    public boolean deleteUser(@PathVariable("id") int id) {
        return userService.deleteUser(id);
    }
}
