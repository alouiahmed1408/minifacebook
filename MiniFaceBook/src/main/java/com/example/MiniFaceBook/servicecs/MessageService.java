package com.example.MiniFaceBook.servicecs;

import com.example.MiniFaceBook.entities.Message;
import com.example.MiniFaceBook.entities.User;
import com.example.MiniFaceBook.repositories.MessageRepo;
import com.example.MiniFaceBook.repositories.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

@Service
public class MessageService implements IMessageService {

    @Autowired
    UserRepo userRepo;

    @Autowired
    MessageRepo messageRepo;


    @Override
    public Message sendMessage(int senderId, int receiverId, String content) {
        User sender   = userRepo.findById(senderId).orElse(null);
        User receiver = userRepo.findById(receiverId).orElse(null);

        if (sender == null || receiver == null) return null;

        Message m = new Message();
        m.setContent(content);
        m.setDateEnvoi(Instant.now());
        m.setRead(false);
        m.setUserSender(sender);
        m.setUserReceiver(receiver);

        return messageRepo.save(m);
    }


    @Override
    public List<Message> getConversation(int user1, int user2) {
        User u1 = userRepo.findById(user1).orElse(null);
        User u2 = userRepo.findById(user2).orElse(null);

        if (u1 == null || u2 == null) return Collections.emptyList();

        return messageRepo.findConversation(u1, u2);
    }


    @Override
    @Transactional
    public void markAsRead(int messageId) {
        Message m= messageRepo.findById(messageId);
        m.setRead(true);
        messageRepo.save(m);
    }


    @Override
    public List<Message> getUnreadMessages(int userId) {
        User receiver = userRepo.findById(userId).orElse(null);
        if (receiver == null) return Collections.emptyList();
        List<Message> result = messageRepo.findByUserReceiverAndIsReadFalse(receiver);
        return result != null ? result : Collections.emptyList();
    }


    @Override
    public boolean deleteMessage(int messageId) {
        if (!messageRepo.existsById(messageId)) {
            return false;
        }
        messageRepo.deleteById(messageId);
        return true;
    }
}
