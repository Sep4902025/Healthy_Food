import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import RemindService from "../../services/reminderService"; // Service đã chuyển đổi

const ReminderNotification = ({ userId }) => {
  const [reminders, setReminders] = useState([]);
  const [hasNewReminders, setHasNewReminders] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const setupSocket = async () => {
      await RemindService.connectSocket(userId);

      RemindService.listenReminder((data) => {
        if (!isMounted) return;

        console.log("Received reminder data:", data); // Keep this for debugging

        setReminders((prevReminders) => {
          // Check if a reminder with the same id already exists
          const existsIndex = prevReminders.findIndex((r) => r.id === data.id);
          if (existsIndex !== -1) {
            // If it exists, replace the old reminder with the new one
            const updatedReminders = [...prevReminders];
            updatedReminders[existsIndex] = data;
            return updatedReminders;
          }
          // If it doesn't exist, add the new reminder to the list
          return [data, ...prevReminders];
        });

        setHasNewReminders(true);
      });
    };

    setupSocket();

    return () => {
      isMounted = false;
      RemindService.disconnect();
    };
  }, [userId]);

  const removeReminder = (index) => {
    setReminders((prev) => prev.filter((_, i) => i !== index));
  };

  const clearReminders = () => {
    setReminders([]);
  };

  const toggleNotifications = () => {
    setShowNotifications((prev) => {
      if (!prev) setHasNewReminders(false);
      return !prev;
    });
  };

  return (
    <View className="relative">
      {/* Nút chuông thông báo */}
      <TouchableOpacity
        onPress={toggleNotifications}
        className="flex items-center justify-center"
        accessibilityLabel="Notifications"
      >
        <View className="relative">
          <Text className="text-2xl">🔔</Text>
          {hasNewReminders && reminders.length > 0 && (
            <View className="absolute -top-1 -right-2 bg-red-500 rounded-full h-5 w-5 flex items-center justify-center">
              <Text className="text-white text-xs font-bold">
                {reminders.length > 9 ? "9+" : reminders.length}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      {/* Modal hiển thị thông báo */}
      <Modal
        visible={showNotifications}
        transparent
        animationType="fade"
        onRequestClose={toggleNotifications}
      >
        <TouchableWithoutFeedback onPress={toggleNotifications}>
          <View className="flex-1">
            <TouchableWithoutFeedback>
              <View className="absolute top-12 right-4 w-80 bg-white rounded-lg shadow-lg">
                <View className="p-4">
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-lg font-bold">Thông báo</Text>
                    {reminders.length > 0 && (
                      <TouchableOpacity onPress={clearReminders}>
                        <Text className="text-red-500 text-sm underline">Xóa tất cả</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {reminders.length > 0 ? (
                    <ScrollView className="max-h-60 divide-y divide-gray-200">
                      {reminders.map((reminder, index) => (
                        <View
                          key={reminder.id || index}
                          className="py-3 flex-row justify-between items-start"
                        >
                          <View className="flex-1 pr-2">
                            <Text className="font-medium text-gray-800">{reminder.message}</Text>
                            <Text className="text-gray-500 text-xs mt-1">
                              {new Date(reminder.timestamp).toLocaleString()}
                            </Text>
                          </View>
                          <TouchableOpacity onPress={() => removeReminder(index)}>
                            <Text className="text-gray-400 text-xl">✕</Text>
                          </TouchableOpacity>
                        </View>
                      ))}
                    </ScrollView>
                  ) : (
                    <View className="py-4 items-center">
                      <Text className="text-gray-500">Không có thông báo nào</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

export default ReminderNotification;
