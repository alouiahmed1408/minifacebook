package com.example.MiniFaceBook.servicecs;


import com.example.MiniFaceBook.entities.User;

import java.util.List;


public interface IUserService {
    public List<User> selectAll();
    public boolean add(User u);
    public User selectById(int id);
    public User updateUser(int id, User u);
    public List<User> findAllByNom(String nom);
    public boolean deleteUser(int id);
    public User FinfByEmailAndPassword(String email,String password);
}
