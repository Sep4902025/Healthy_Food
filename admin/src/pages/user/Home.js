import React from "react";
import { useSelector } from "react-redux";
import { selectAuth } from "../../store/selectors/authSelectors";

const Home = () => {
  const { user } = useSelector(selectAuth);

  console.log("user satte", user);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center text-gray-600">Vui lòng đăng nhập để xem thông tin.</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <p className="text-sm text-gray-500">Tên người dùng</p>
      <p className="text-lg font-medium text-gray-800">{user.username}</p>
    </div>
  );
};

export default Home;
