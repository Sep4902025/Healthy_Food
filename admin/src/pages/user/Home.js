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
      <p>helllllooo</p>
    </div>
  );
};

export default Home;
