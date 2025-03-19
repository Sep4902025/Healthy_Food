import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const Rating = ({
  rate = 0,
  starClick,
  maxStars = 5,
  size = 30,
  activeColor = "#FFD700",
  inactiveColor = "#CCCCCC",
  disabled = false,
}) => {
  // Ensure rate is within bounds
  const currentRate = Math.min(Math.max(0, rate), maxStars);

  // Handle star press
  const handleStarPress = (selectedRate) => {
    if (!disabled && starClick) {
      starClick(selectedRate);
    }
  };

  // Render stars
  const renderStars = () => {
    const stars = [];

    for (let i = 1; i <= maxStars; i++) {
      const active = i <= currentRate;

      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => handleStarPress(i)}
          disabled={disabled}
          style={styles.starContainer}
          // activeOpacity={0.7}
        >
          <Ionicons
            name={active ? "star" : "star-outline"}
            size={size}
            color={active ? activeColor : inactiveColor}
          />
        </TouchableOpacity>
      );
    }

    return stars;
  };

  return <View style={styles.container}>{renderStars()}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  starContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 2, // Add padding for better touch area
  },
});

export default Rating;
