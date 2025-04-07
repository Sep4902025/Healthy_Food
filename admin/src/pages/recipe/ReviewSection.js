import React, { useEffect, useState } from "react";
import { Star, Heart, Trash2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { toast } from "react-toastify";
import commentService from "../../services/comment.service";
import { useSelector } from "react-redux";
import { selectAuth } from "../../store/selectors/authSelectors";
import FemaleUser from "../../assets/images/FemaleUser.png";

const ReviewSection = ({ recipeId, dishId }) => {
  const [comments, setComments] = useState([]); // Flat list of comments
  const [newComment, setNewComment] = useState("");
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(0); // Default to 0 (no rating)
  const [averageRating, setAverageRating] = useState(0); // Average rating for the recipe
  const user = useSelector(selectAuth)?.user;
  const userId = user?._id;
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    setComments([]);
    const fetchReviews = async () => {
      try {
        const [ratingsResponse, commentsResponse] = await Promise.all([
          commentService.getRatingsByRecipe(recipeId),
          commentService.getCommentsByDishId(dishId),
        ]);

        const ratings = ratingsResponse.data || [];
        const fetchedComments = commentsResponse.data || [];

        // Calculate average rating
        if (ratings.length > 0) {
          const totalRating = ratings.reduce((sum, rating) => sum + rating.star, 0);
          const avgRating = (totalRating / ratings.length).toFixed(1); // Round to 1 decimal place
          setAverageRating(avgRating);
        } else {
          setAverageRating(0);
        }

        // Find the logged-in user's rating (if any)
        const userRating = ratings.find(
          (rating) =>
            (typeof rating.userId === "object" ? rating.userId._id : rating.userId) === userId
        );
        if (userRating) {
          setSelectedRating(userRating.star);
        }

        // Transform comments into a flat list with user email
        const commentList = fetchedComments.map((comment) => {
          const commentUserId =
            typeof comment.userId === "object" ? comment.userId._id : comment.userId;
          const commentEmail =
            typeof comment.userId === "object" ? comment.userId.email : "Anonymous";
          return {
            _id: comment._id,
            userId: commentUserId,
            email: commentUserId === user?._id ? user.email : commentEmail, // Use logged-in user's email if it's their comment
            text: comment.text,
            likeCount: comment.likeCount,
            likedBy: comment.likedBy,
            isLiked: comment.likedBy.includes(userId),
            createdAt: comment.createdAt,
            updatedAt: comment.updatedAt,
          };
        });

        // Sort comments by createdAt timestamp (newest first)
        commentList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        setComments(commentList);
        console.log("Fetched Comments:", commentList);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };

    fetchReviews();
  }, [recipeId, dishId, userId, user?.email]);

  const handleDeleteComment = async (commentId) => {
    try {
      await commentService.deleteComment(commentId);
      setComments((prevComments) => prevComments.filter((comment) => comment._id !== commentId));
      toast.success("Comment deleted successfully! 🗑️");
    } catch (error) {
      toast.error("Failed to delete comment! ❌");
    }
  };

  const handleRateRecipe = async (ratingValue) => {
    try {
      const response = await commentService.rateRecipe(recipeId, userId, ratingValue);
      if (response.success) {
        toast.success("Thank you for your rating! 😍");
        setSelectedRating(ratingValue);

        // Refetch ratings to update average rating
        const ratingsResponse = await commentService.getRatingsByRecipe(recipeId);
        const ratings = ratingsResponse.data || [];
        if (ratings.length > 0) {
          const totalRating = ratings.reduce((sum, rating) => sum + rating.star, 0);
          const avgRating = (totalRating / ratings.length).toFixed(1);
          setAverageRating(avgRating);
        }
      } else {
        toast.error("Error submitting rating");
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
      toast.error("Failed to submit rating! ❌");
    }
  };

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;
    try {
      const response = await commentService.addComment(dishId, newComment, userId);
      const newCommentData = response.data;

      setNewComment("");

      // Add the new comment to the list
      setComments((prev) => [
        {
          _id: newCommentData._id,
          userId,
          email: user.email,
          text: newCommentData.text,
          likeCount: newCommentData.likeCount || 0,
          likedBy: newCommentData.likedBy || [],
          isLiked: false,
          createdAt: newCommentData.createdAt,
          updatedAt: newCommentData.updatedAt,
        },
        ...prev,
      ]);
      toast.success("Comment added successfully! 😊");
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment. Please try again! ❌");
    }
  };

  const handleLikeComment = async (commentId) => {
    try {
      await commentService.toggleLikeComment(commentId, userId);
      setComments((prevComments) =>
        prevComments.map((comment) =>
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
      <div className="bg-gray-100 p-4 rounded-xl shadow-md">
        <label className="block mb-2 text-lg font-semibold text-gray-700">Rate Now</label>
        <div className="flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={30}
              className={`cursor-pointer transition ${
                (hoverRating || selectedRating) >= star
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-gray-300"
              }`}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => handleRateRecipe(star)}
            />
          ))}
        </div>
      </div>

      <div className="mt-6 p-4 rounded-xl">
        {/* Display Average Rating */}
        <div className="flex items-center justify-center mb-4">
          <span className="text-lg font-semibold mr-2">Average Rating:</span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={20}
                className={
                  averageRating >= star ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                }
              />
            ))}
          </div>
          <span className="ml-2 text-lg">({averageRating})</span>
        </div>

        <h2 className="text-2xl font-semibold mb-4">Comments</h2>
        <textarea
          className="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400"
          rows="4"
          placeholder="Enter your comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <Button
          onClick={() => handleCommentSubmit()}
          className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-lg"
        >
          Submit Comment
        </Button>
        {comments.length === 0 ? (
          <p className="text-gray-500 text-center mt-4">No comments yet.</p>
        ) : (
          <div className="space-y-6 mt-4">
            {comments.map((comment) => (
              <div key={comment._id} className="p-4 border rounded-lg bg-white shadow-md">
                <div className="flex items-center gap-3">
                  <img src={FemaleUser} alt="User" className="w-10 h-10 rounded-full border" />
                  <div>
                    <p className="font-semibold text-lg">{comment.email}</p>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm">
                    <p className="text-gray-800 flex-1">{comment.text}</p>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleLikeComment(comment._id)}
                        className="flex items-center text-gray-600 hover:text-red-500"
                      >
                        <Heart
                          size={20}
                          className={
                            comment.isLiked ? "fill-red-500 stroke-red-500" : "stroke-gray-500"
                          }
                        />
                        <span className="ml-1 text-sm">{comment.likeCount}</span>
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => handleDeleteComment(comment._id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewSection;
