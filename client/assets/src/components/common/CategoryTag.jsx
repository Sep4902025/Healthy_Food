import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "../../contexts/ThemeContext";

const CategoryTag = ({ name = "", color = "#FF6B00" }) => {
  const { theme } = useTheme();

  return (
    <View
      style={{
        ...styles.categoryTag,
        borderColor: color,
        backgroundColor: theme.categoryTagBackgroundColor,
      }}
    >
      <Text style={{ ...styles.categoryTagText, color: color }}>{name}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  categoryTag: {
    backgroundColor: "#E2F8F8",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: "flex-start",

    borderWidth: 1,
    marginBottom: 4,
  },
  categoryTagText: {
    color: "black",
    fontSize: 8,
  },
});

export default CategoryTag;
