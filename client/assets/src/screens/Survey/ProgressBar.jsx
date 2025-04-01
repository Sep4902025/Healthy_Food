import React from "react";
import { View } from "react-native";

const ProgressBar = ({ progress }) => {
  return (
    <View className="w-3/4 h-2 bg-gray-200 rounded-full overflow-hidden">
      <View className="h-full bg-teal-500 rounded-full" style={{ width: `${progress}%` }} />
    </View>
  );
};

export default ProgressBar;
