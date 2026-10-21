package com.example.MiniFaceBook.servicecs;

import com.example.MiniFaceBook.entities.User;
import com.example.MiniFaceBook.repositories.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
public class UserService implements IUserService{
    @Autowired
    private UserRepo userRepo;

    @Autowired
    private PasswordEncoder passwordEncoder;


    @Override
    public List<User> selectAll() {
        return userRepo.findAll();
    }

    @Override
    public boolean add(User u) {

        if(userRepo.findByEmail(u.getEmail()) != null){
            return false;
        }
        if (u.getPassword() == null || u.getPassword().isBlank()) {
            return false;
        }

        u.setPassword(passwordEncoder.encode(u.getPassword()));
        userRepo.save(u);
        return true;
    }

    @Override
    public User selectById(int id) {
        return userRepo.findById(id).orElse(null);
    }

    @Override
    public User updateUser(int id, User u) {
        User ut = selectById(id);
        if (ut == null) return null;

        ut.setNom(u.getNom());
        ut.setBio(u.getBio());
        ut.setEmail(u.getEmail());
        ut.setPhotoProfile(u.getPhotoProfile());

        // password is optional on update: only change it when a new one is sent
        String newPwd = u.getPassword();
        if (newPwd != null && !newPwd.isBlank() && !isBcryptHash(newPwd)) {
            ut.setPassword(passwordEncoder.encode(newPwd));
        }
        return userRepo.save(ut);
    }

    @Override
    public List<User> findAllByNom(String nom) {
        return userRepo.findByNom(nom);
    }

    @Override
    public boolean deleteUser(int id) {

        userRepo.deleteById(id);
        return true;
    }

    @Override
    public User FinfByEmailAndPassword(String email, String password) {
        User user = userRepo.findByEmail(email);
        if (user == null || password == null) return null;

        String stored = user.getPassword();
        if (stored != null && isBcryptHash(stored)) {
            return passwordEncoder.matches(password, stored) ? user : null;
        }

        // Legacy account created before hashing existed: accept once, then upgrade to a hash.
        if (stored != null && stored.equals(password)) {
            user.setPassword(passwordEncoder.encode(password));
            return userRepo.save(user);
        }
        return null;
    }

    private boolean isBcryptHash(String value) {
        return value.startsWith("$2a$") || value.startsWith("$2b$") || value.startsWith("$2y$");
    }

}
