import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { logoutUser } from "../../store/actions/authActions";
import { selectUser } from "../../store/selectors/authSelectors";
import UserChatButton from "../Chat/UserChatButton";
import ReminderNotification from "../Reminder/ReminderNotifiaction";
import Footer from "../../pages/user/footer/Footer";

const MainLayout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/signin");
    toast.success("Đăng xuất thành công!");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <h2 className="text-2xl font-bold text-gray-800">Logo</h2>

            <div className="flex items-center space-x-4">
              {user && (
                <>
                  <div className="flex items-center space-x-3">
                    {user.avatarUrl && (
                      <img src={user.avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full" />
                    )}
                    <span className="text-gray-700">Xin chào, {user.username}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                  >
                    Đăng xuất
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
      <ReminderNotification userId={user?._id} />
      {/* Main Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />

      {/* Chat button (chỉ hiển thị nếu là customer) */}
      {user?.role === "user" && <UserChatButton />}
    </div>
  );
};

export default MainLayout;
