import React from "react";
import { useSelector } from "react-redux";
import { selectUser } from "../../store/selectors/authSelectors";
import { useNavigate } from "react-router-dom";
import femaleUser from "../../assets/images/FemaleUser.png";

const User = () => {
  const user = useSelector(selectUser);
  const navigate = useNavigate();

  if (!user) {
    navigate("/signin");
    return null;
  }

  return (
    // <div className="container mx-auto py-10 px-6">
    //   <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md">
    //     <h2 className="text-2xl font-bold text-gray-800 mb-4">User Profile</h2>
    //     <div className="flex items-center space-x-6">
    //       <img
    //         src={user.avatar_url || "https://via.placeholder.com/150"}
    //         alt="User Avatar"
    //         className="w-24 h-24 rounded-full border"
    //       />
    //       <div>
    //         <h3 className="text-xl font-semibold">{user.username}</h3>
    //         <p className="text-gray-600">{user.email}</p>
    //       </div>
    //     </div>
    //     <div className="mt-6">
    //       <h4 className="text-lg font-semibold">Additional Info</h4>
    //       <p className="text-gray-700">Role: {user.role}</p>

    //       {/* Thêm thông tin khác tại đây nếu cần */}
    //     </div>
    //   </div>
    // </div>

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
          <li className="user-item">
            <a href="/dishes">Favorite Food</a>
          </li>
          <li className="user-item">
            <a href="/dishes">Don't eat food</a>
          </li>
          <li className="user-item">
            <a href="/dishes">Change Password</a>
          </li>
          <li className="user-item">
            <a href="/dishes">FAQs</a>
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

                <buton>Edit</buton>
              </div>

              <div className="goal-content">
                Lorem ipsum dolor sit amet consectetur. Erat auctor a aliquam
                vel congue luctus. Leo diam cras neque mauris ac arcu elit ipsum
                dolor sit amet consectetur.
              </div>
            </div>

            <div className="body-container">
              <h3 className="body-title">Body Measurements</h3>
              <table className="w-full border-collapse border border-gray-300">
                <tbody>
                  <tr>
                    <td className="border border-gray-300 p-2 font-semibold">
                      Weight
                    </td>
                    <td className="border border-gray-300 p-2">
                      <label
                        type="text"
                        placeholder="Weight"
                        value={user}
                        className="w-full p-1 border border-gray-300"
                      />{" "}
                      kg
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-2 font-semibold">
                      Height
                    </td>
                    <td className="border border-gray-300 p-2">
                      <label
                        type="text"
                        placeholder="Height"
                        value={user.height}
                        className="w-full p-1 border border-gray-300"
                      />{" "}
                      cm
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-2 font-semibold">
                      BMI
                    </td>
                    <td className="border border-gray-300 p-2">
                      <label
                        type="text"
                        placeholder="BMI"
                        value={user.weight / (user.height * 2)}
                        className="w-full p-1 border border-gray-300"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="body-warning"></div>
            </div>
          </div>

          <div className="user-content-2"></div>
        </div>
      </div>
    </div>
  );
};

export default User;
