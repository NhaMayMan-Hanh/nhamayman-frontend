"use client";

import { Reply, ThumbsUp } from "lucide-react";
import type { Comment } from "../type";

interface CommentItemProps {
   comment: Comment;
   parentPath?: string[];
   onReply: (parentPath: string[], userName: string) => void;
   formatTime: (date: Date | string) => string;
}

export function CommentItem({
   comment,
   parentPath = [],
   onReply,
   formatTime,
}: CommentItemProps) {
   if (comment.isDeleted) return null;

   const currentPath = [...parentPath, comment._id];
   const canReply = currentPath.length < 3;

   return (
      <div className="mb-6">
         <div className="flex gap-4">
            <img
               src={comment.userAvatar}
               alt={comment.userName}
               className="w-10 h-10 rounded-full shrink-0"
            />
            <div className="flex-1">
               <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                     <h4 className="font-semibold text-gray-900">
                        {comment.userName}
                     </h4>
                     <span className="text-sm text-gray-500">
                        {formatTime(comment.createdAt)}
                     </span>
                  </div>
                  <p className="text-gray-700 leading-relaxed mb-2">
                     {comment.content}
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                     <button className="flex items-center gap-1 text-gray-600 hover:text-pink-500 transition">
                        <ThumbsUp className="w-4 h-4" />
                        <span>{comment.likes}</span>
                     </button>
                     {canReply && (
                        <button
                           onClick={() =>
                              onReply(currentPath, comment.userName)
                           }
                           className="flex items-center gap-1 text-gray-600 hover:text-blue-500 transition"
                        >
                           <Reply className="w-4 h-4" />
                           <span>Trả lời</span>
                        </button>
                     )}
                  </div>
               </div>

               {/* Render replies with connecting line */}
               {comment.replies && comment.replies.length > 0 && (
                  <div className="relative mt-4">
                     {/* Vertical connecting line */}
                     <div className="absolute left-5 top-0 bottom-6 w-0.5 bg-gray-300" />

                     <div className="ml-6 space-y-4">
                        {comment.replies.map((reply) => (
                           <CommentItem
                              key={reply._id}
                              comment={reply}
                              parentPath={currentPath}
                              onReply={onReply}
                              formatTime={formatTime}
                           />
                        ))}
                     </div>
                  </div>
               )}
            </div>
         </div>
      </div>
   );
}
