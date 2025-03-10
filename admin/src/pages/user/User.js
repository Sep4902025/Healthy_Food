import React from "react";
import { useSelector } from "react-redux";
import { selectUser } from "../../store/selectors/authSelectors";
import { useNavigate } from "react-router-dom";
import femaleUser from "../../assets/images/FemaleUser.png";
import "@fortawesome/fontawesome-free/css/all.min.css";

const User = () => {
  const user = useSelector(selectUser);
  const navigate = useNavigate();

  if (!user) {
    navigate("/signin");
    return null;
  }

  return (
    <div className="user-container">
      <div className="user-container-1">
        <div class="w-[223.50px] h-[73.64px] relative">
          <div class="w-[162px] h-[70px] left-[61.50px] top-[3.64px] absolute text-black text-[32px] font-normal font-['Outfit'] tracking-tight">
            My Profile
          </div>
          <div class="w-[48.11px] h-[43.64px] left-0 top-0 absolute bg-[#ffcb00] rounded-lg  overflow-hidden">
            <div class="left-[16.78px] top-[10.44px] absolute text-[#1e2875] text-lg font-black font-['Montserrat'] tracking-tight">
              G
            </div>
            <div class="w-[7.95px] h-[5.78px] left-[14.45px] top-[5.78px] absolute bg-[#ffcb00]"></div>
          </div>
        </div>

        <ul className="user-list">
          <li className="user-item selected">
            <a href="/profile">
              <i className="fas fa-user"></i> Profile
            </a>
          </li>
          <li className="user-item">
            <a href="/dishes">
              <i className="fas fa-utensils"></i> Favorite Food
            </a>
          </li>
          <li className="user-item">
            <a href="/dishes">
              <i className="fas fa-ban"></i> Don't eat food
            </a>
          </li>
          <li className="user-item">
            <a href="/dishes">
              <i className="fas fa-key"></i> Change Password
            </a>
          </li>
          <li className="user-item">
            <a href="/dishes">
              <i className="fas fa-question-circle"></i> FAQs
            </a>
          </li>
          <li className="user-item">
            <a href="/dishes">
              <i className="fas fa-question-circle"></i> ViewQuiz
            </a>
          </li>
        </ul>
      </div>

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
                        {user.phone}
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
                Lorem ipsum dolor sit amet consectetur. Erat auctor a aliquam
                vel congue luctus. Leo diam cras neque mauris ac arcu elit ipsum
                dolor sit amet consectetur.
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
                        <label className="w-full p-1"> {user.weight} kg </label>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 font-semibold">Height</td>
                      <td className="p-2">
                        <label className="w-full p-1"> {user.height} cm </label>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 font-semibold">BMI</td>
                      <td className="p-2">
                        <label className="w-full p-1">
                          {" "}
                          {user.weight / (user.height * 2)}{" "}
                        </label>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div className="body-warning">
                  <div className="body-warning-title">Warning</div>
                  <div className="body-warning-content">
                    You are so fast. You should eat more.
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
    </div>
  );
};

export default User;
