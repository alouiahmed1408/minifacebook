export interface User {
  id: number;
  nom: string;
  email: string;
  password?: string;
  bio?: string;
  photoProfile?: string;
}

export interface Post {
  idPost: number;
  content: string;
  image?: string;
  dateCreation: string;
  author: User;
  comments?: Comment[];
  likes?: Like[];
}

export interface Comment {
  idComment: number;
  content: string;
  dateCreation: string;
  user: User;
  post?: Post;
}

export interface Like {
  idLike: number;
  user: User;
  post?: Post;
}

export interface Message {
  idMessage: number;
  content: string;
  dateEnvoi: string;
  read: boolean;
  userSender: User;
  userReceiver: User;
}

export interface FriendRequest {
  idRequest: number;
  userSender: User;
  userReceiver: User;
  status: 'EN_ATTENTE' | 'ACCEPTEE' | 'REFUSEE';
}
