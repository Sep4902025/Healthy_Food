import React from "react";
import ProfileInfo from "./Sections/ProfileInfo";
import FavoriteFood from "./Sections/FavoriteFood";
import DontEatFood from "./Sections/DontEatFood";
import ChangePassword from "./Sections/ChangePassword";
import FAQs from "./Sections/FAQs";
import {
  FaUser,
  FaHeart,
  FaBan,
  FaLock,
  FaQuestionCircle,
} from "react-icons/fa";

const ProfileContent = ({ activeTab }) => {
  // Tab metadata for rendering
  const tabs = [
    {
      id: "profile",
      component: <ProfileInfo />,
      icon: <FaUser />,
      title: "Personal Information",
    },
    {
      id: "favoriteFood",
      component: <FavoriteFood />,
      icon: <FaHeart />,
      title: "Favorite Food",
    },
    {
      id: "dontEatFood",
      component: <DontEatFood />,
      icon: <FaBan />,
      title: "Foods to Avoid",
    },
    {
      id: "changePassword",
      component: <ChangePassword />,
      icon: <FaLock />,
      title: "Change Password",
    },
    {
      id: "faqs",
      component: <FAQs />,
      icon: <FaQuestionCircle />,
      title: "Frequently Asked Questions",
    },
  ];

  // Find current active tab
  const currentTab = tabs.find((tab) => tab.id === activeTab);

  // If no tab is active or not found
  if (!currentTab) {
    return (
      <div className="flex items-center justify-center p-4 h-full">
        <div className="text-center bg-white p-6 rounded-lg shadow-md max-w-md w-full">
          <FaQuestionCircle className="mx-auto mb-4 text-gray-400 text-4xl" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Page Not Found
          </h2>
          <p className="text-gray-500">Please select an item from the menu</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-auto bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-4">
        {/* Header with icon for current section */}
        <div className="flex items-center mb-4 bg-white rounded-lg p-3 shadow-sm">
          <div className="mr-3 w-8 h-8 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
            {currentTab.icon}
          </div>
          <h1 className="text-lg font-bold text-gray-800">
            {currentTab.title}
          </h1>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          {currentTab.component}
        </div>

        {/* Navigation dots for mobile */}
        <div className="md:hidden mt-4 flex justify-center">
          <div className="flex space-x-2">
            {tabs.map((tab) => (
              <div
                key={tab.id}
                className={`w-2 h-2 rounded-full ${
                  tab.id === activeTab ? "bg-indigo-600" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileContent;
