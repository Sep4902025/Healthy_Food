import React, { useEffect, useState } from "react";
import { Star, Heart, Trash2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { toast } from "react-toastify";
import commentService from "../../services/comment.service";
import { useSelector } from "react-redux";
import { selectAuth } from "../../store/selectors/authSelectors";
import FemaleUser from "../../assets/images/FemaleUser.png";
import { useNavigate } from "react-router-dom";
import useAuthCheck from "../../helpers/useAuthCheck";
const ReviewSection = ({ recipeId, dishId }) => {
  const [reviews, setReviews] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(5);
  const user = useSelector(selectAuth)?.user;
  const userId = user?._id;
  const isAdmin = user?.role === "admin";
  const navigate = useNavigate();
  const { checkLogin } = useAuthCheck(userId);

  const fetchReviews = async () => {
    try {
      const [ratingsResponse, commentsResponse] = await Promise.all([
        commentService.getRatingsByRecipe(recipeId),
        commentService.getCommentsByDishId(dishId),
      ]);

      const ratings = ratingsResponse.data;
      const comments = commentsResponse.data.map((comment) => ({
        ...comment,
        isLiked: comment.likedBy.includes(userId),
      }));

      const reviewMap = new Map();

      ratings.forEach((rating) => {
        if (rating.userId && rating.userId._id) {
          reviewMap.set(rating.userId._id, {
            userId: rating.userId._id,
            email: rating.userId.email,
            star: rating.star,
            comments: [],
          });

          // 👇 Nếu là user hiện tại thì set selectedRating
          if (rating.userId._id === userId) {
            setSelectedRating(rating.star);
          }
        }
      });

      comments.forEach((comment) => {
        if (reviewMap.has(comment.userId)) {
          reviewMap.get(comment.userId).comments.push(comment);
        } else {
          reviewMap.set(comment.userId, {
            userId: comment.userId,
            email: comment.userId.email || "Anonymous",
            star: null,
            comments: [comment],
          });
        }
      });

      const sortedReviews = Array.from(reviewMap.values()).map((review) => {
        const sortedComments = [...review.comments].sort((a, b) => {
          if (b.likeCount !== a.likeCount) {
            return b.likeCount - a.likeCount;
          }
          const updatedA = a.updatedAt || a.createdAt;
          const updatedB = b.updatedAt || b.createdAt;
          return new Date(updatedB) - new Date(updatedA);
        });

        return {
          ...review,
          comments: sortedComments,
        };
      });

      setReviews(sortedReviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [recipeId, dishId]);

  const handleDeleteComment = async (commentId) => {
    try {
      if (!checkLogin()) return;
      await commentService.deleteComment(commentId);
      setReviews((prevReviews) =>
        prevReviews.map((review) => ({
          ...review,
          comments: review.comments.filter(
            (comment) => comment._id !== commentId
          ),
        }))
      );
      toast.success("Comment deleted successfully! 🗑️");
    } catch (error) {
      toast.error("Failed to delete comment! ❌");
    }
  };

  const handleRateRecipe = async (ratingValue) => {
    try {
      if (!checkLogin()) return;

      const response = await commentService.rateRecipe(
        recipeId,
        userId,
        ratingValue
      );
      if (response.success) {
        toast.success("Thank you for your rating! 😍");
        setSelectedRating(ratingValue);
        fetchReviews();
      } else {
        toast.error("Error submitting rating");
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
    }
  };

  const handleCommentSubmit = async () => {
    if (!checkLogin()) return;
    if (!newComment.trim()) return;
    try {
      const response = await commentService.addComment(
        dishId,
        newComment,
        userId
      );
      const newCommentData = response.data;
      setNewComment("");

      let hasExistingReview = false;
      const updatedReviews = reviews.map((review) => {
        if (review.userId === userId) {
          hasExistingReview = true;
          return {
            ...review,
            comments: [newCommentData, ...review.comments],
          };
        }
        return review;
      });

      if (!hasExistingReview) {
        updatedReviews.unshift({
          userId,
          email: user.email,
          star: null,
          comments: [newCommentData],
        });
      }

      setReviews(updatedReviews);
      toast.success("Comment added successfully! 😊");
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment. Please try again! ❌");
    }
  };

  const handleLikeComment = async (commentId) => {
    try {
      if (!checkLogin()) return;
      await commentService.toggleLikeComment(commentId, userId);
      setReviews((prevReviews) =>
        prevReviews.map((review) => ({
          ...review,
          comments: review.comments.map((comment) =>
            comment._id === commentId
              ? {
                  ...comment,
                  isLiked: !comment.isLiked,
                  likeCount: comment.isLiked
                    ? comment.likeCount - 1
                    : comment.likeCount + 1,
                }
              : comment
          ),
        }))
      );
    } catch (error) {
      console.error("Error liking comment:", error);
    }
  };

  return (
    <div className="w-full max-w-3xl mt-6 bg-white p-6 rounded-lg shadow-md">
      <div className="bg-gray-100 p-4 rounded-xl shadow-md">
        <label className="block mb-2 text-lg font-semibold text-gray-700">
          Rate Now
        </label>
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
        <h2 className="text-2xl font-semibold mb-4">Comments</h2>
        <textarea
          className="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400"
          rows="4"
          placeholder="Enter your comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <Button
          onClick={handleCommentSubmit}
          className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-lg"
        >
          Submit Comment
        </Button>
  
        {reviews.length === 0 ? (
          <p className="text-gray-500 text-center mt-4">
            No ratings or comments yet.
          </p>
        ) : (
          <div className="space-y-6 mt-8">
            {reviews.flatMap((review) =>
              review.comments.map((comment) => (
                <div
                  key={comment._id}
                  className={`p-5 border border-gray-200 rounded-lg bg-white shadow-md ${
                    review.email === user?.email
                      ? "border-2 border-blue-500 bg-blue-100"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={FemaleUser}
                      alt="User"
                      className="w-12 h-12 rounded-full border-2 border-gray-300"
                    />
                    <div>
                      <p className="font-semibold text-md text-gray-800">
                        {review.email}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(comment.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
  
                  <div className="flex justify-between items-start">
                    <p className="text-base text-gray-800 leading-relaxed pr-4 flex-1 break-words">
                      {comment.text}
                    </p>
                    <div className="flex items-center gap-1 ml-4 flex-shrink-0">
                      <Heart
                        size={18}
                        color={comment.isLiked ? "red" : "gray"}
                        onClick={() => handleLikeComment(comment._id)}
                        className={`cursor-pointer ${
                          comment.isLiked ? "fill-red-500" : "fill-none"
                        }`}
                      />
                      <span>{comment.likeCount}</span>
                    </div>
                  </div>
  
                  {isAdmin && (
                    <div className="mt-3 flex justify-end">
                      <Button
                        variant="destructive"
                        size="sm"
                        className="text-gray-600 hover:text-red-600 focus:ring-2 focus:ring-red-500"
                        onClick={() => handleDeleteComment(comment._id)}
                      >
                        <Trash2 size={18} />
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
  
};

export default ReviewSection;
