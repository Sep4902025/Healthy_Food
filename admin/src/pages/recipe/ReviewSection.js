import React, { useEffect, useState } from "react";
import { Star, Heart, Trash2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { toast } from "react-toastify";
import commentService from "../../services/comment.service";
import { useSelector } from "react-redux";
import { selectAuth } from "../../store/selectors/authSelectors";
import FemaleUser from "../../assets/images/FemaleUser.png";

const ReviewSection = ({ recipeId, dishId }) => {
  const [reviews, setReviews] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(5);
  const user = useSelector(selectAuth)?.user;
  const userId = user?._id;
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    setReviews([]);
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

        const combinedReviews = [];
        const reviewMap = new Map();

        ratings.forEach((rating) => {
          if (rating.userId && rating.userId._id) {
            reviewMap.set(rating.userId._id, {
              userId: rating.userId._id,
              email: rating.userId.email,
              star: rating.star,
              comments: [],
            });
          }
        });

        comments.forEach((comment) => {
          if (reviewMap.has(comment.userId)) {
            reviewMap.get(comment.userId).comments.push(comment);
          } else {
            reviewMap.set(comment.userId, {
              userId: comment.userId,
              email: "Anonymous",
              star: null,
              comments: [comment],
            });
          }
        });

        const sortedReviews = Array.from(reviewMap.values()).map((review) => ({
          ...review,
          comments: review.comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)), // Sắp xếp comment mới nhất lên đầu
        }));
        
        setReviews(sortedReviews);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };

    fetchReviews();
  }, [recipeId, dishId]);

  const handleDeleteComment = async (commentId) => {
    try {
      await commentService.deleteComment(commentId);
      setReviews((prevReviews) =>
        prevReviews.map((review) => ({
          ...review,
          comments: review.comments.filter((comment) => comment._id !== commentId),
        }))
      );
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
        setReviews((prev) =>
          prev.map((review) =>
            review.userId === userId ? { ...review, star: ratingValue } : review
          )
        );
      } else {
        toast.error("Error submitting rating");
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
    }
  };

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;
    try {
      const response = await commentService.addComment(dishId, newComment, userId);
      const newCommentData = response.data;

      setNewComment("");

      setReviews((prev) => {
        const updatedReviews = prev.map((review) => {
          if (review.userId === userId) {
            return {
              ...review,
              comments: [newCommentData, ...review.comments], // Đẩy bình luận mới lên đầu
            };
          }
          return review;
        });
      
        if (!updatedReviews.some((review) => review.userId === userId)) {
          updatedReviews.unshift({ // Thêm vào đầu danh sách review
            userId,
            email: user.email,
            star: null,
            comments: [newCommentData],
          });
        }
      
        return updatedReviews;
      });
      
      toast.success("Comment added successfully! 😊");
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment. Please try again! ❌");
    }
  };

  const handleLikeComment = async (commentId) => {
    try {
      await commentService.toggleLikeComment(commentId, userId);
      setReviews((prevReviews) =>
        prevReviews.map((review) => ({
          ...review,
          comments: review.comments.map((comment) =>
            comment._id === commentId
              ? {
                  ...comment,
                  isLiked: !comment.isLiked,
                  likeCount: comment.isLiked ? comment.likeCount - 1 : comment.likeCount + 1,
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
        {reviews.length === 0 ? (
          <p className="text-gray-500 text-center mt-4">No ratings or comments yet.</p>
        ) : (
          <div className="space-y-6 mt-4">
            {reviews.map((review) => (
              <div key={review.userId} className="p-4 border rounded-lg bg-white shadow-md">
                <div className="flex items-center gap-3">
                  <img src={FemaleUser} alt="User" className="w-10 h-10 rounded-full border" />
                  <div>
                    <p className="font-semibold text-lg">{review.email}</p>
                    {review.star && (
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={20}
                            className={
                              review.star >= star
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-300"
                            }
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  {review.comments.map((comment) => (
                    <div
                      key={comment._id}
                      className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm"
                    >
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
                  ))}
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
