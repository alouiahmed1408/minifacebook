package com.example.MiniFaceBook.controllers;

import com.example.MiniFaceBook.entities.FriendRequest;
import com.example.MiniFaceBook.entities.User;
import com.example.MiniFaceBook.servicecs.FriendRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/friends")
@CrossOrigin(origins = {"*"})
public class FriendRequestController {

    @Autowired
    FriendRequestService friendRequestService;

    @GetMapping("/sent/{userId}")
    public List<FriendRequest> getSentRequests(@PathVariable int userId) {
        List<FriendRequest> result = friendRequestService.getSentRequests(userId);
        return result != null ? result : Collections.emptyList();
    }

    @GetMapping("/requests/{userId}")
    public List<FriendRequest> getReceivedRequests(@PathVariable int userId) {
        List<FriendRequest> result = friendRequestService.getReceivedRequests(userId);
        return result != null ? result : Collections.emptyList();
    }

    @GetMapping("/{userId}")
    public Set<User> getFriends(@PathVariable int userId) {
        Set<User> result = friendRequestService.getFriends(userId);
        return result != null ? result : Collections.emptySet();
    }

    @PostMapping("/{senderId}/{receiverId}")
    public ResponseEntity<FriendRequest> addRequest(@PathVariable int senderId,
                                                     @PathVariable int receiverId) {
        FriendRequest saved = friendRequestService.sendRequest(senderId, receiverId);
        if (saved == null) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.status(201).body(saved);
    }

    @PutMapping("/accept/{id}")
    public ResponseEntity<Void> accept(@PathVariable int id) {
        friendRequestService.acceptRequest(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/refuse/{id}")
    public ResponseEntity<Void> refuse(@PathVariable int id) {
        friendRequestService.refuseRequest(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{userId}/{friendId}")
    public ResponseEntity<Void> remove(@PathVariable int userId,
                                       @PathVariable int friendId) {
        friendRequestService.removeFriend(userId, friendId);
        return ResponseEntity.ok().build();
    }
}
