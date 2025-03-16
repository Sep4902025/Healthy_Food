import React, { useEffect, useState, useRef } from "react";
import RemindService from "../../services/reminder.service";

const ReminderNotification = ({ userId }) => {
  const [reminders, setReminders] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  // Kết nối socket và lắng nghe thông báo nhắc nhở
  useEffect(() => {
    RemindService.connectSocket(userId);

    RemindService.listenReminder((data) => {
      console.log("Nhận dữ liệu nhắc nhở:", data);
      setReminders((prevReminders) => [data, ...prevReminders]); // Thêm vào đầu mảng để hiển thị mới nhất lên đầu
    });

    // Ngắt kết nối khi component unmount
    return () => {
      RemindService.disconnect();
    };
  }, [userId]);

  // Xử lý click bên ngoài để đóng dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Hàm xóa từng nhắc nhở
  const removeReminder = (index) => {
    setReminders((prevReminders) => prevReminders.filter((_, i) => i !== index));
  };

  // Hàm xóa tất cả nhắc nhở
  const clearReminders = () => {
    setReminders([]);
  };

  // Toggle hiển thị thông báo
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  return (
    <div className="relative" ref={notificationRef}>
      {/* Nút chuông thông báo */}
      <button
        onClick={toggleNotifications}
        className="flex items-center justify-center rounded-full p-2 bg-white shadow-md hover:bg-gray-100"
        aria-label="Notifications"
      >
        <div className="relative">
          {/* Icon chuông */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>

          {/* Badge hiển thị số lượng thông báo */}
          {reminders.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {reminders.length > 9 ? "9+" : reminders.length}
            </span>
          )}
        </div>
      </button>

      {/* Dropdown hiển thị danh sách thông báo */}
      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50">
          <div className="p-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-bold">Thông báo</h2>
              {reminders.length > 0 && (
                <button className="text-red-500 text-sm hover:underline" onClick={clearReminders}>
                  Xóa tất cả
                </button>
              )}
            </div>

            {reminders.length > 0 ? (
              <ul className="max-h-60 overflow-auto divide-y divide-gray-200">
                {reminders.map((reminder, index) => (
                  <li key={index} className="py-3 flex justify-between items-start">
                    <div className="flex-1 pr-2">
                      <p className="font-medium text-gray-800">{reminder.message}</p>
                      <p className="text-gray-500 text-xs mt-1">
                        {new Date(reminder.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <button
                      className="text-gray-400 hover:text-red-500"
                      onClick={() => removeReminder(index)}
                      aria-label="Xóa thông báo"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="py-4 text-center text-gray-500">Không có thông báo nào</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReminderNotification;
