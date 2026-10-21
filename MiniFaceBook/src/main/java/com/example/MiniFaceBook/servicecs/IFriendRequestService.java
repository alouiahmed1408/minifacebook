package com.example.MiniFaceBook.servicecs;

import com.example.MiniFaceBook.entities.FriendRequest;
import com.example.MiniFaceBook.entities.User;
import com.example.MiniFaceBook.repositories.FriendRequestRepo;

import java.util.List;
import java.util.Set;

public interface IFriendRequestService {
    public FriendRequest sendRequest(int senderId, int receiverId);
    public List<FriendRequest> getReceivedRequests(int userId);
    public List<FriendRequest> getSentRequests(int userId);
    public Set<User> getFriends(int userId);
    public void acceptRequest(int requestId);
    public void refuseRequest(int requestId);
    public void removeFriend(int userId, int friendId);
}
