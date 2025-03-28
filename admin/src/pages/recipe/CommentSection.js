import React, { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import { Heart } from "lucide-react";
import CommentsService from "../../services/comment.service";
import { useSelector } from "react-redux";
import { selectAuth } from "../../store/selectors/authSelectors";

const CommentSection = ({ dishId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const userId = useSelector(selectAuth)?.user?._id;

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await CommentsService.getCommentsByDishId(dishId);
        const cmts = response.data.map((comment) => ({
          ...comment,
          isLiked: comment.likedBy.includes(userId),
        }));
        setComments(cmts);
      } catch (error) {
        console.error("Error loading comments:", error);
      }
    };

    fetchComments();
  }, [dishId]);

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;
    try {
      const response = await CommentsService.addComment(dishId, newComment, userId);
      setComments([...comments, response.data]);
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleLikeComment = async (commentId) => {
    try {
      const updatedComment = await CommentsService.toggleLikeComment(commentId, userId);
      setComments(
        comments.map((comment) =>
          comment._id === commentId
            ? {
                ...comment,
                isLiked: !comment.isLiked,
                likeCount: comment.isLiked ? comment.likeCount - 1 : comment.likeCount + 1,
              }
            : comment
        )
      );
    } catch (error) {
      console.error("Error liking comment:", error);
    }
  };

  return (
    <div className="w-full max-w-3xl mt-6 bg-white p-6 rounded-lg shadow-md">
    
      <h2 className="text-2xl font-semibold mb-4">Comments</h2>
      <div className="mb-4">
        <textarea
          className="w-full p-2 border rounded-lg"
          rows="3"
          placeholder="Enter your comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <Button className="mt-2 bg-blue-500 text-white" onClick={handleCommentSubmit}>
          Submit Comment
        </Button>
      </div>
      {comments.length === 0 ? (
        <p className="text-gray-500 text-center">No comments yet.</p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment._id}
              className="p-3 border rounded-lg bg-white shadow flex justify-between items-center"
            >
              <p className="text-gray-800">{comment.text}</p>
              <button
                onClick={() => handleLikeComment(comment._id)}
                className="flex items-center space-x-1"
              >
                <Heart
                  size={20}
                  className={comment.isLiked ? "fill-red-500 stroke-red-500" : "stroke-gray-500"}
                />
                <span>{comment.likeCount}</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentSection;
