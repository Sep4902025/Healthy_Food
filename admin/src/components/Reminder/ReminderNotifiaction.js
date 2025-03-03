import React, { useEffect, useState } from "react";
import RemindService from "../../services/reminder.service";

const ReminderNotification = ({ userId }) => {
  const [reminders, setReminders] = useState([]);

  console.log("USER", userId);

  // Kết nối socket và lắng nghe thông báo nhắc nhở
  useEffect(() => {
    RemindService.connectSocket(userId);

    RemindService.listenReminder((data) => {
      console.log("Nhận dữ liệu nhắc nhở:", data);
      setReminders((prevReminders) => [...prevReminders, data]);
    });

    // Ngắt kết nối khi component unmount
    return () => {
      RemindService.disconnect();
    };
  }, [userId]);

  // Hàm xóa từng nhắc nhở
  const removeReminder = (index) => {
    setReminders((prevReminders) => prevReminders.filter((_, i) => i !== index));
  };

  // Hàm xóa tất cả nhắc nhở
  const clearReminders = () => {
    setReminders([]);
  };

  console.log("REMINDER SOCKET", reminders);

  return (
    <div className="fixed top-4 right-4 p-4">
      {reminders.length > 0 ? (
        <div className="bg-white shadow-lg rounded-lg p-4 w-80">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-bold">Nhắc nhở mới</h2>
            <button className="text-red-500 text-sm hover:underline" onClick={clearReminders}>
              Xóa tất cả
            </button>
          </div>
          <ul className="max-h-60 overflow-auto">
            {reminders.map((reminder, index) => (
              <li key={index} className="border-b py-2 flex justify-between items-center">
                <div>
                  <span className="font-semibold">{reminder.message}</span>
                  <span className="text-gray-500 text-sm block">
                    {new Date(reminder.timestamp).toLocaleString()}
                  </span>
                </div>
                <button
                  className="text-red-500 text-sm hover:underline ml-2"
                  onClick={() => removeReminder(index)}
                >
                  Xóa
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <h1 className="text-gray-500 text-sm">Chưa có nhắc nhở nào</h1>
      )}
    </div>
  );
};

export default ReminderNotification;
