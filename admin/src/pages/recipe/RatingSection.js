import React, { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { toast } from "react-toastify";
import commentService from "../../services/comment.service";
import { useSelector } from "react-redux";
import { selectAuth } from "../../store/selectors/authSelectors";
import FemaleUser from "../../assets/images/FemaleUser.png";

const RatingSection = ({ recipeId }) => {
  
  const [ratings, setRatings] = useState([]);
  const user = useSelector(selectAuth)?.user;

  const [hoverRating, setHoverRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(5);

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const response = await commentService.getRatingsByRecipe(recipeId);
        setRatings(response.data);
      } catch (error) {
        console.error("Error loading ratings:", error);
      }
    };
    fetchRatings();
  }, [recipeId]);

  const handleRateRecipe = async (ratingValue) => {
    try {
      const response = await commentService.rateRecipe(recipeId, user?._id, ratingValue);

      if (response.success) {
        toast.success(`Cảm ơn bạn đã đánh giá! 😍`);
        setRatings((prevRatings) => {
          const existingIndex = prevRatings.findIndex((r) => r.userId._id === user?._id);
          const newRating = {
            ...response.data.data,
            userId: { _id: user._id, email: user.email },
          };

          if (existingIndex !== -1) {
            const updatedRatings = [...prevRatings];
            updatedRatings[existingIndex] = newRating;
            return updatedRatings;
          }
          return [...prevRatings, newRating];
        });

        setSelectedRating(ratingValue);
      } else {
        toast.error("Error submitting rating");
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
    }
  };

  return (
    <div className="w-full max-w-3xl mt-6 bg-white p-6 rounded-lg shadow-md">
      {/* ⭐ Rating Input */}
      <div className="bg-gray-100 p-4 rounded-xl shadow-md">
        <label className="block mb-2 text-lg font-semibold text-gray-700">Đánh giá ngay</label>
        <div className="flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
            key={star}
            size={30} // Kích thước icon
            className={`cursor-pointer transition ${
              (hoverRating || selectedRating) >= star ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
            }`}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => handleRateRecipe(star)}
          />
          ))}
        </div>
      </div>

      {/* Reviews Display Section */}
      <div className="mt-6 bg-white p-4 rounded-xl shadow-md">
        <h3 className="text-xl font-bold text-gray-800 mb-4">📢 User Reviews</h3>
        {ratings.length === 0 ? (
          <p className="text-gray-500 text-center">No reviews yet.</p>
        ) : (
          ratings.map((review, index) => (
            <div key={index} className="border-b border-gray-200 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <img src={FemaleUser} alt="avatar" className="w-10 h-10 rounded-full border" />
                <div>
                  <p className="font-semibold text-gray-800">{review.userId?.email}</p>
                  <p className="text-sm text-gray-500 text-left">
                    {new Date(review.updatedAt || review.createdAt).toLocaleDateString("en-US", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <div className="flex mt-2">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={`text-2xl ${i < review.star ? "text-yellow-400" : "text-gray-300"}`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <p className="text-gray-700 mt-2">{review.comment}</p>
            </div>
          ))
        )}

        
      </div>
    </div>
  );
};

export default RatingSection;
