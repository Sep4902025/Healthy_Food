import React, { useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";

import { useTheme } from "../contexts/ThemeContext";

import { ScreensName } from "../constants/ScreensName";
import { useSelector } from "react-redux";
import { userSelector } from "../redux/selectors/selector";

const SurveyScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const user = useSelector(userSelector);

  // Kiểm tra userPreferenceId và điều hướng nếu đã tồn tại
  useEffect(() => {
    if (user?.userPreferenceId) {
      navigation.navigate(ScreensName.forYou); // Sử dụng replace thay vì navigate để tránh quay lại SurveyScreen
    }
  }, [user, navigation]);

  // Nếu user đã có userPreferenceId, không render form khảo sát
  if (user?.userPreferenceId) {
    return null; // Trả về null để không render gì trong khi đang điều hướng
  }

  const handleStartSurveyScreen = () => {
    navigation.navigate("Name");
  };

  return (
    <View
      style={{ backgroundColor: theme.backgroundColor }}
      className="flex-1 justify-center items-center px-6 gap-2"
    >
      {/* Tiêu đề */}
      <Text className="text-custom-green text-2xl font-semibold text-center mb-6 leading-7">
        Personalize Your Experience
      </Text>

      {/* Phần mô tả */}
      <View className="mb-8">
        <Text
          style={{ color: theme.textColor }}
          className="text-lg font-medium text-center leading-7"
        >
          Take a quick survey to help us personalize your recommendations. It also helps us
          calculate nutrition targets tailored just for you.
        </Text>
      </View>
      <Text
        style={{ color: theme.textColorSecondary || "#6B7280" }}
        className="text-base text-center italic"
      >
        It only takes a few minutes to complete!
      </Text>
      {/* Nút Start Survey */}
      <TouchableOpacity
        onPress={handleStartSurveyScreen}
        className="bg-custom-green p-4 px-10 rounded-lg shadow-lg"
      >
        <Text className="text-white text-lg font-bold text-center">Start Survey Now</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SurveyScreen;
