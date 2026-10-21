package com.example.MiniFaceBook.servicecs;

import com.example.MiniFaceBook.entities.Message;

import java.util.List;

public interface IMessageService {

    public Message sendMessage(int senderId, int receiverId, String content);
    public List<Message> getConversation(int user1, int user2);
    public void markAsRead(int messageId);
    public List<Message> getUnreadMessages(int userId) ;
    public boolean deleteMessage(int messageId);
    }
