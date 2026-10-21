package com.example.MiniFaceBook.entities;

import jakarta.persistence.*;

@Entity
public class FriendRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private int idRequest;
    @ManyToOne
    private User userSender;
    @ManyToOne
    private User userReceiver;
    private String status;

    public FriendRequest() {
    }

    public FriendRequest(User userSender, User userReceiver, String status) {
        this.userSender = userSender;
        this.userReceiver = userReceiver;
        this.status = status;
    }

    public int getIdRequest() {
        return idRequest;
    }

    public void setIdRequest(int idRequest) {
        this.idRequest = idRequest;
    }

    public User getUserSender() {
        return userSender;
    }

    public void setUserSender(User userSender) {
        this.userSender = userSender;
    }

    public User getUserReceiver() {
        return userReceiver;
    }

    public void setUserReceiver(User userReceiver) {
        this.userReceiver = userReceiver;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    @Override
    public String toString() {
        return "FriendRequest{" +
                "idRequest=" + idRequest +
                ", status='" + status + '\'' +
                '}';
    }
}
