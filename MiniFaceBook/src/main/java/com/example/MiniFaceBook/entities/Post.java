package com.example.MiniFaceBook.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import javax.xml.crypto.Data;
import java.time.LocalDate;
import java.util.List;

@Entity
public class Post {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private int idPost;
    private String content;
    private String image;
    private LocalDate dateCreation;
    @ManyToOne
    @JoinColumn(name ="user_id")
    private User author;
    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Comment> comments;
    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Like> likes;

    public Post() {
    }

    public Post(String content) {
        this.content = content;
    }

    public Post(List<Like> likes, List<Comment> comments, User author, LocalDate dateCreation, String image, String content) {
        this.likes = likes;
        this.comments = comments;
        this.author = author;
        this.dateCreation = dateCreation;
        this.image = image;
        this.content = content;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public LocalDate getDateCreation() {
        return dateCreation;
    }

    public void setDateCreation(LocalDate dateCreation) {
        this.dateCreation = dateCreation;
    }

    public User getAuthor() {
        return author;
    }

    public void setAuthor(User author) {
        this.author = author;
    }

    public List<Comment> getComments() {
        return comments;
    }

    public void setComments(List<Comment> comments) {
        this.comments = comments;
    }

    public List<Like> getLikes() {
        return likes;
    }

    public void setLikes(List<Like> likes) {
        this.likes = likes;
    }

    public int getIdPost() {
        return idPost;
    }

    public void setIdPost(int idPost) {
        this.idPost = idPost;
    }

    @Override
    public String toString() {
        return "Post{" +
                "idPost=" + idPost +
                ", content='" + content + '\'' +
                ", image='" + image + '\'' +
                ", dateCreation=" + dateCreation +
                ", author=" + author +
                '}';
    }
}
