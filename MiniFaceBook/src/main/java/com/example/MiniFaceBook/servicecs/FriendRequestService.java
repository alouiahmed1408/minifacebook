package com.example.MiniFaceBook.servicecs;

import com.example.MiniFaceBook.entities.FriendRequest;
import com.example.MiniFaceBook.entities.User;
import com.example.MiniFaceBook.repositories.FriendRequestRepo;
import com.example.MiniFaceBook.repositories.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Set;

@Service
public class FriendRequestService implements IFriendRequestService {

    @Autowired
    private FriendRequestRepo friendRequestRepo;

    @Autowired
    private UserRepo userRepo;


    @Override
    public FriendRequest sendRequest(int senderId, int receiverId) {
        if (senderId == receiverId) return null;

        User sender   = userRepo.findById(senderId).orElse(null);
        User receiver = userRepo.findById(receiverId).orElse(null);
        if (sender == null || receiver == null) return null;


        boolean alreadyExists =
            friendRequestRepo.existsByUserSenderAndUserReceiver(sender, receiver) ||
            friendRequestRepo.existsByUserSenderAndUserReceiver(receiver, sender);
        if (alreadyExists) return null;

        if (sender.getFriends() != null && sender.getFriends().contains(receiver)) return null;

        FriendRequest request = new FriendRequest();
        request.setUserSender(sender);
        request.setUserReceiver(receiver);
        request.setStatus("EN_ATTENTE");

        return friendRequestRepo.save(request);
    }


    @Override
    public List<FriendRequest> getReceivedRequests(int userId) {
        User u = userRepo.findById(userId).orElse(null);
        if (u == null) return Collections.emptyList();
        return friendRequestRepo.findByUserReceiverAndStatus(u, "EN_ATTENTE");
    }

    @Override
    public List<FriendRequest> getSentRequests(int userId) {
        User u = userRepo.findById(userId).orElse(null);
        if (u == null) return Collections.emptyList();
        return friendRequestRepo.findByUserSenderAndStatus(u, "EN_ATTENTE");
    }

    @Override
    public Set<User> getFriends(int userId) {
        User user = userRepo.findById(userId).orElse(null);
        if (user == null) return Collections.emptySet();
        Set<User> friends = user.getFriends();
        return friends != null ? friends : Collections.emptySet();
    }


    @Override
    @Transactional
    public void acceptRequest(int requestId) {
        FriendRequest request = friendRequestRepo.findById(requestId).orElse(null);
        if (request == null) return;

        int senderId   = request.getUserSender().getId();
        int receiverId = request.getUserReceiver().getId();

        User sender   = userRepo.findById(senderId).orElse(null);
        User receiver = userRepo.findById(receiverId).orElse(null);
        if (sender == null || receiver == null) return;

        sender.getFriends().add(receiver);
        receiver.getFriends().add(sender);

        userRepo.save(sender);
        userRepo.save(receiver);

        friendRequestRepo.deleteById(requestId);
    }



    @Override
    @Transactional
    public void refuseRequest(int requestId) {
        if (friendRequestRepo.existsById(requestId)) {
            friendRequestRepo.deleteById(requestId);
        }
    }


    @Override
    @Transactional
    public void removeFriend(int userId, int friendId) {
        User user   = userRepo.findById(userId).orElse(null);
        User friend = userRepo.findById(friendId).orElse(null);
        if (user == null || friend == null) return;

        if (user.getFriends() != null)   user.getFriends().remove(friend);
        if (friend.getFriends() != null) friend.getFriends().remove(user);

        userRepo.save(user);
        userRepo.save(friend);
    }
}
