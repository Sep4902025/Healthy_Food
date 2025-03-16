import React from "react";
import ProfileInfo from "./Sections/ProfileInfo";
import FavoriteFood from "./Sections/FavoriteFood";
import DontEatFood from "./Sections/DontEatFood";
import ChangePassword from "./Sections/ChangePassword";
import FAQs from "./Sections/FAQs";

const ProfileContent = ({ activeTab }) => {
    return (
      <div className="profile-content-container">
        {activeTab === "profile" && <ProfileInfo />}
        {activeTab === "favoriteFood" && <FavoriteFood />}
        {activeTab === "dontEatFood" && <DontEatFood />}
        {activeTab === "changePassword" && <ChangePassword />}
        {activeTab === "faqs" && <FAQs />}
      </div>
    );
  };
  
  export default ProfileContent;
