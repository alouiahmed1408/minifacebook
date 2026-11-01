package com.example.MiniFaceBook.controllers;


import com.example.MiniFaceBook.entities.Comment;
import com.example.MiniFaceBook.entities.Message;
import com.example.MiniFaceBook.servicecs.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/messages")
public class MessageController {

    @Autowired
    MessageService messageService;

    @GetMapping
    public List<Message> getConversation(@RequestParam int user1,
                                         @RequestParam int user2) {
        return messageService.getConversation(user1, user2);
    }

    @GetMapping("/unread/{id}")
    public List<Message> getUnreadMessages(@PathVariable("id") int receiverId) {
        return messageService.getUnreadMessages(receiverId);
    }

    @PostMapping
    public Message sendMessage(@RequestParam int senderId,
                               @RequestParam int receiverId,
                               @RequestBody String c) {
        return messageService.sendMessage(senderId, receiverId, c);
    }

    @DeleteMapping("/{id}")
    public boolean deleteMessage(@PathVariable("id") int messageId) {
        return messageService.deleteMessage(messageId);
    }

    @PutMapping("/{id}/read")
    public void markAsRead(@PathVariable("id") int messageId) {
        messageService.markAsRead(messageId);
    }
}
