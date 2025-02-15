import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { logoutUser } from "../../store/actions/authActions";
import { selectUser } from "../../store/selectors/authSelectors";

const MainLayout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/auth/login");
    toast.success("Đăng xuất thành công!");
  };

  if (!user) {
    navigate("/auth/login");
    return null;
  }

  return (
    <div className=" bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h2 className="text-2xl font-bold text-gray-800">Logo</h2>
            </div>

            <div className="flex items-center space-x-4">
              {user && (
                <>
                  <div className="flex items-center space-x-3">
                    {user.avatar_url && (
                      <img src={user.avatar_url} alt="Avatar" className="w-8 h-8 rounded-full" />
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
      {/* Main Content */}
      <main>
        <Outlet />
      </main>
      {/* Footer */}
      <footer className="bg-white shadow-md mt-auto">
        <div className="container mx-auto px-4 py-4">
          <p className="text-center text-gray-600">© 2025 Your Company. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
