import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DishesService from "./../../services/nutritionist/dishesServices";
import { Button } from "../../components/ui/button";
import CommentsService from "./../../services/comment.service";
import { Heart } from "lucide-react";
import { useSelector } from "react-redux";
import { selectAuth } from "./../../store/selectors/authSelectors";

const DishDetail = () => {
  const { dishId } = useParams();
  const navigate = useNavigate();
  const [dish, setDish] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const userId = useSelector(selectAuth)?.user?._id;

  useEffect(() => {
    const fetchDishDetails = async () => {
      try {
        const response = await DishesService.getDishById(dishId);
        console.log("Fetched Dish:", response.data); // Debug API response
        setDish(response.data);
      } catch (error) {
        console.error("Error loading dish details:", error);
      }
    };

    const fetchComments = async () => {
      try {
        const response = await CommentsService.getCommentsByDishId(dishId);

        const cmts = response.data.map((comment) => ({
          ...comment,
          isLiked: comment.likedBy.includes(userId),
        }));
        setComments(cmts);

        console.log("Fetched Comments:", cmts); // Debug API response
      } catch (error) {
        console.error("Error loading comments:", error);
      }
    };

    fetchDishDetails();
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
                likedBy: comment.isLiked
                  ? comment.likedBy.filter((id) => id !== userId) // Remove user from likedBy when unliking
                  : [...comment.likedBy, userId], // Add user to likedBy when liking
              }
            : comment
        )
      );
    } catch (error) {
      console.error("Error liking comment:", error);
    }
  };

  if (!dish) return <p>Error, no dish</p>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen flex flex-col items-center">
      <h1 className="text-3xl font-bold text-center mb-4">{dish.name}</h1>
      <img
        src={dish.imageUrl}
        alt={dish.name}
        className="w-full max-w-lg h-80 object-cover rounded-lg shadow-md"
      />
      <p className="text-gray-700 text-lg mt-4">{dish.description}</p>

      {dish.recipeId && (
        <Button
          className="mt-6 px-6 py-3 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition"
          onClick={() => navigate(`/${dish._id}/recipes/${dish.recipeId}`)}
        >
          View Recipe
        </Button>
      )}

      {/* Display Comments */}
      <div className="mt-8 w-full max-w-lg">
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
    </div>
  );
};

export default DishDetail;
