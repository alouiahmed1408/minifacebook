package com.example.MiniFaceBook.repositories;

import com.example.MiniFaceBook.entities.Message;
import com.example.MiniFaceBook.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MessageRepo extends JpaRepository<Message,Integer> {

    Message findById(int id);
    List<Message> findByUserSenderAndUserReceiver(User u1, User u2);

    // Both directions in ONE query, in chronological order (id breaks ties)
    @Query("select m from Message m " +
           "where (m.userSender = :a and m.userReceiver = :b) " +
           "   or (m.userSender = :b and m.userReceiver = :a) " +
           "order by m.dateEnvoi asc, m.idMessage asc")
    List<Message> findConversation(@Param("a") User a, @Param("b") User b);
    List<Message> findByUserReceiverAndIsReadFalse(User receiver);
}
