package com.example.MiniFaceBook.repositories;

import com.example.MiniFaceBook.entities.FriendRequest;
import com.example.MiniFaceBook.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FriendRequestRepo extends JpaRepository<FriendRequest,Integer> {
    public List<FriendRequest> findAllByUserSender(User sender);
    boolean existsByUserSenderAndUserReceiver(User sender, User receiver);

    public List<FriendRequest> findByUserReceiverAndStatus(User user, String statues);
    public List<FriendRequest> findByUserSenderAndStatus(User user, String statues);
}
