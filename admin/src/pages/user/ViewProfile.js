import React, { useState, useEffect } from "react";
import {
  FaUser,
  FaEdit,
  FaShoppingCart,
  FaBan,
  FaKey,
  FaQuestionCircle,
  FaStar,
} from "react-icons/fa";
import { useSelector } from "react-redux";
import { selectUser } from "../../store/selectors/authSelectors";
import { useNavigate } from "react-router-dom";
import "./ViewProfile.css";

const ViewProfile = () => {
  const user = useSelector(selectUser);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [favoriteCategories, setFavoriteCategories] = useState([]);

  const handleNavigation = (path) => {
    navigate(path);
  };

  useEffect(() => {
    // Check if user exists
    if (!user) {
      navigate("/signin");
      return;
    }

    // Fetch mock reviews
    fetchMockReviews();
    // Fetch mock favorite categories
    fetchMockFavoriteCategories();
    setLoading(false);
  }, [user, navigate]);

  const fetchMockReviews = () => {
    // Mock reviews data
    setReviews([
      {
        id: 1,
        name: "Ankit Srivastava",
        rating: 4,
        comment:
          "excellent conversation with him... very knowledgeable personhappy to talk towith him",
      },
    ]);
  };

  const fetchMockFavoriteCategories = () => {
    // Mock favorite food categories
    setFavoriteCategories([
      { id: 1, name: "No-Calories" },
      { id: 2, name: "Breakfast" },
      { id: 3, name: "Lunch" },
      { id: 4, name: "Dinner" },
    ]);
  };

  const handleEditClick = () => {
    // Navigate to edit profile page with user data in state
    navigate(`/edituser/${user._id}`, { state: { user } });
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FaStar
          key={i}
          className={i <= rating ? "star-filled" : "star-empty"}
        />
      );
    }
    return stars;
  };

  const getFoodExperienceYears = () => {
    // Mock function to return food experience
    return 7;
  };

  const getAverageRating = () => {
    // Mock function to return average rating
    return 4.5;
  };

  const getRatingCount = () => {
    // Mock function to return rating count
    return 34;
  };

  // Calculate BMI
  const calculateBMI = () => {
    if (user) {
      const weight = parseFloat(user.weight) || 0;
      const height = parseFloat(user.height) || 0;
      return height > 0 ? (weight / (height * height)).toFixed(2) : "26.12";
    }
    return "26.12";
  };

  if (loading || !user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-sidebar">
        <div className="sidebar-header">
          <div className="profile-initial">
            {user.username ? user.username.charAt(0).toUpperCase() : "G"}
          </div>
          <h2>User Profile</h2>
        </div>

        <ul className="sidebar-menu">
          <li className="active">
            <FaUser className="menu-icon" />
            <span>Profile</span>
          </li>
          <li onClick={() => handleNavigation("/favoriteList")}>
            <FaShoppingCart className="menu-icon" />
            <span>Favorite Food</span>
          </li>
        </ul>
      </div>

      <div className="profile-content">
        <div className="profile-header">
          <h1>USER PROFILE</h1>
        </div>

        <div className="profile-main">
          <div className="profile-info-card">
            <div className="profile-info-section">
              <div className="profile-image-container">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt="Profile"
                    className="profile-image"
                  />
                ) : (
                  <div className="profile-image-placeholder">
                    <span>
                      {user.username
                        ? user.username.charAt(0).toUpperCase()
                        : ""}
                    </span>
                  </div>
                )}
              </div>

              <div className="user-info">
                <div className="info-row">
                  <div className="info-label">User Name</div>
                  <div className="info-value">{user.username || "Sid"}</div>
                </div>
                <div className="info-row">
                  <div className="info-label">Email</div>
                  <div className="info-value">
                    {user.email || "siddxd@growthx.com"}
                  </div>
                </div>
                <div className="info-row">
                  <div className="info-label">Phone Number</div>
                  <div className="info-value">
                    {user.phone || "+91 9965284573"}
                  </div>
                </div>
              </div>
            </div>

            <div className="profile-section nutrition-goal">
              <div className="section-header">
                <h3>Nutrition Goal</h3>
                <button className="edit-link">Edit</button>
              </div>
              <p className="section-content">
                Lorem ipsum dolor sit amet consectetur. Erat auctor a aliquam
                vel congue luctus. Leo diam cras neque mauris ac arcu elit ipsum
                dolor sit amet consectetur.
              </p>
            </div>

            <div className="profile-section body-measurements">
              <h3>Body Measurements</h3>

              <div className="measurements-grid">
                <div className="measurement-item">
                  <div className="measurement-label">Weight</div>
                  <div className="measurement-value">
                    {user.weight || "80"} Kg
                  </div>
                </div>
                <div className="measurement-item">
                  <div className="measurement-label">Height</div>
                  <div className="measurement-value">
                    {user.height || "1.75"} M
                  </div>
                </div>
                <div className="measurement-item">
                  <div className="measurement-label">BMI</div>
                  <div className="measurement-value">{calculateBMI()}</div>
                </div>
              </div>

              <div className="warning-box">
                <h3>Warning</h3>
                <p>You are too fast.</p>
              </div>
            </div>
          </div>

          <div className="profile-details-card">
            <div className="favorite-food-section">
              <h3>Favorite Food Details</h3>
              <p className="section-description">
                This are the professional details shown to users in the app.
              </p>

              <div className="favorite-categories">
                <h4>Kind of favorite food</h4>
                <div className="categories-grid">
                  {favoriteCategories.map((category) => (
                    <div key={category.id} className="category-item">
                      <span className="category-bullet">■</span>
                      <span className="category-name">{category.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="experience-section">
                <h4>Total Experience</h4>
                <div className="experience-badge">
                  <div className="experience-years">
                    {getFoodExperienceYears()} Years
                  </div>
                  <div className="experience-text">of food experience</div>
                </div>
              </div>

              <div className="ratings-section">
                <h4>Ratings</h4>
                <div className="rating-summary">
                  <div className="rating-number">
                    ★ {getAverageRating()} Stars
                  </div>
                  <div className="rating-text">
                    from {getRatingCount()} customers
                  </div>
                </div>
              </div>

              <div className="reviews-section">
                <h4>Customer Reviews</h4>
                {reviews.map((review) => (
                  <div key={review.id} className="review-item">
                    <div className="review-header">
                      <div className="reviewer-name">{review.name}</div>
                      <div className="review-stars">
                        {renderStars(review.rating)}
                      </div>
                    </div>
                    <p className="review-comment">{review.comment}</p>
                  </div>
                ))}
                <button className="see-all-reviews">See all reviews →</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewProfile;
