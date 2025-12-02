export interface Blog {
   _id: string;
   name: string;
   img: string;
   like: number;
   likedBy: string[];
   slug: string;
   description: string;
   content?: string;
}

export interface Comment {
   _id: string;
   user: string;
   userName: string;
   userAvatar?: string;
   content: string;
   likes: number;
   likedBy: string[];
   isDeleted?: boolean;
   replies: Comment[];
   createdAt: Date;
}

export interface ExtendedBlog extends Blog {
   comments: Comment[];
}
