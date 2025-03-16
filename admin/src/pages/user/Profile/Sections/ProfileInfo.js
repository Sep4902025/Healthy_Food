import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { selectUser } from "../../../../store/selectors/authSelectors";
import { useNavigate } from "react-router-dom";
import femaleUser from "../../../../assets/images/FemaleUser.png";
import "@fortawesome/fontawesome-free/css/all.min.css";
import quizService from "../../../../services/quizService";

const ProfileInfo = () => {
  const user = useSelector(selectUser);
  const navigate = useNavigate();

  const [userPreference, setUserPreference] = useState([]);

  useEffect(() => {
    const fetchUserPreference = async () => {
      if (!user) {
        setUserPreference(null);
        return;
      }

      try {
        const response = await quizService.getUserPreference(user._id);
        if (response.data) {
          setUserPreference(response.data.data);

          console.log("User preference:", userPreference);
        } else {
          setUserPreference(null);
        }
      } catch (error) {
        console.error("Error fetching user preference:", error);
        setUserPreference(null);
      }
    };

    fetchUserPreference();
  }, [user]);

  if (!user) {
    navigate("/signin");
    return null;
  }

  const bmi =
    userPreference?.weight && userPreference?.height
      ? (
          userPreference.weight / Math.pow(userPreference.height / 100, 2)
        ).toFixed(2)
      : null;

  // Xác định thông báo cảnh báo
  const getWarningMessage = (bmi) => {
    if (!bmi) return "Chưa có dữ liệu để đánh giá!";
    if (bmi < 18.5) return "Bạn quá gầy, nên ăn nhiều hơn!";
    if (bmi >= 18.5 && bmi < 25) return "Cơ thể bạn đang ở trạng thái tốt!";
    if (bmi >= 25 && bmi < 30)
      return "Bạn hơi dư cân, nên điều chỉnh chế độ ăn uống!";
    return "Bạn cần kiểm soát cân nặng để tránh ảnh hưởng sức khỏe!";
  };

  return (
    <div clasName="user-container-nav">
      <div className="nav-container">
        <div className="nav-text">Edit Profile</div>
      </div>

      <div className="content-container">
        <div className="user-content">
          <div className="user-content-img">
            <img
              src={user.avatar_url || femaleUser}
              alt="User Avatar"
              className="user-img w-24 h-24 rounded-full border "
            />
            <div className="user-content-img-btn">
              <button className="btn-upload">Upload Photo</button>
            </div>
          </div>

          <div className="user-content-info">
            <table className="infor-table w-full border-collapse border-none">
              <tbody>
                <tr>
                  <td>
                    <h1 className="m-2 font-bold text-2xl text-black uppercase">
                      Your Profile
                    </h1>
                  </td>
                  <td colSpan="2" className="text-right">
                    <button className="m-2 table-edit-btn hover:bg-purple-600">
                      Edit
                    </button>
                  </td>
                </tr>
                <tr>
                  <td className="p-2 font-semibold border-none">Your name</td>
                  <td className="p-2 border-none">
                    <label className="w-full p-1 block text-gray-700">
                      {user.username}
                    </label>
                  </td>
                </tr>
                <tr>
                  <td className="p-2 font-semibold border-none">Email</td>
                  <td className="p-2 border-none">
                    <label className="w-full p-1 block text-gray-700">
                      {user.email}
                    </label>
                  </td>
                </tr>
                <tr>
                  <td className="p-2 font-semibold border-none">Phone</td>
                  <td className="p-2 border-none">
                    <label className="w-full p-1 block text-gray-700">
                      {userPreference?.phoneNumber}
                    </label>
                  </td>
                </tr>
                <tr>
                  <td className="p-2 font-semibold border-none">Gender</td>
                  <td className="p-2 border-none">
                    <label className="w-full p-1 block text-gray-700">
                      {userPreference?.gender}
                    </label>
                  </td>
                </tr>
                <tr>
                  <td className="p-2 font-semibold border-none">Age</td>
                  <td className="p-2 border-none">
                    <label className="w-full p-1 block text-gray-700">
                      {userPreference?.age}
                    </label>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="goal-container">
            <div className="goal-title">
              <div className="g-title">Nutrition Goal</div>

              <a href="/" class="g-link">
                Edit
              </a>
            </div>

            <div className="goal-content">
              <table className="w-full border-collapse">
                <tbody>
                  <tr>
                    <td className="p-2 font-semibold">Goal</td>
                    <td className="p-2">
                      <label className="w-full p-1">
                        {userPreference?.goal}
                      </label>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 font-semibold">Diet</td>
                    <td className="p-2">
                      <label className="w-full p-1">
                        {userPreference?.diet}
                      </label>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 font-semibold">Sleep Time</td>
                    <td className="p-2">
                      <label className="w-full p-1">
                        {userPreference?.sleepTime}
                      </label>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 font-semibold">Long of plan</td>
                    <td className="p-2">
                      <label className="w-full p-1">
                        {userPreference?.longOfPlan}
                      </label>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="body-container">
            <h3 className="body-title">Body Measurements</h3>
            <div class="body-content">
              <table className="w-full border-collapse">
                <tbody>
                  <tr>
                    <td className="p-2 font-semibold">Weight</td>
                    <td className="p-2">
                      <label className="w-full p-1">
                        {" "}
                        {userPreference?.weight} kg
                      </label>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 font-semibold">Height</td>
                    <td className="p-2">
                      <label className="w-full p-1">
                        {userPreference?.height} cm{" "}
                      </label>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 font-semibold">BMI</td>
                    <td className="p-2">
                      <label className="w-full p-1">
                        {bmi ? bmi : "Chưa có dữ liệu"}{" "}
                      </label>
                    </td>
                  </tr>
                </tbody>
              </table>

              <div
                className={`body-warning ${
                  bmi < 18.5
                    ? "bg-blue-200 text-blue-800"
                    : bmi >= 18.5 && bmi < 25
                    ? "bg-green-200 text-green-800"
                    : bmi >= 25 && bmi < 30
                    ? "bg-yellow-200 text-yellow-800"
                    : "bg-red-200 text-red-800"
                } p-4 rounded-lg`}
              >
                <div className="body-warning-title font-bold">Warning</div>
                <div className="body-warning-content">
                  {getWarningMessage(bmi)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="user-content-2">
          <div className="fa-detail-container">
            <div className="fa-title">Favorite Food Details</div>
            <div className="fa-content">
              <div className="fa-item">
                <img src="" alt="" />
                <div className="fa-item-name">
                  This are the professional details shown to users in the app.
                </div>
              </div>
            </div>
          </div>

          <div className="kind-fa-container">
            <h1 className="kind-fa-title">Favorite food</h1>
            <ul class="kind-list">
              <li className="kind-item">No-Calories</li>
              <li className="kind-item">Lunch</li>
              <li className="kind-item">Breakfast</li>
              <li className="kind-item">Dinner</li>
            </ul>
          </div>

          <div className="kind-fa-container">
            <h1 className="kind-fa-title">Don't like food</h1>
            <ul class="kind-list">
              <li className="kind-item">No-Calories</li>
              <li className="kind-item">Lunch</li>
              <li className="kind-item">Breakfast</li>
              <li className="kind-item">Dinner</li>
            </ul>
          </div>

          <h1 className="cus-review-title">Food Review</h1>

          <div className="cus-review-container">
            <div className="food-review-name">Ankit Srivastava</div>

            <div className="food-review-star">
              <i className="fas fa-star" style={{ color: "gold" }}></i>
              <i className="fas fa-star" style={{ color: "gold" }}></i>
              <i className="fas fa-star" style={{ color: "gold" }}></i>
              <i className="fas fa-star" style={{ color: "gold" }}></i>
              <i className="far fa-star" style={{ color: "gray" }}></i>{" "}
              {/* Sao trắng */}
            </div>

            <div className="food-review-content">Very good</div>
          </div>

          <a href="/" className="cus-review-link">
            See All Review-
          </a>
        </div>
      </div>
    </div>
  );
};

export default ProfileInfo;
