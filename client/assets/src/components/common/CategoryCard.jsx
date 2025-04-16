import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  PixelRatio,
} from "react-native";
import { useTheme } from "../../contexts/ThemeContext"; 

const window = Dimensions.get("window");
const scale = window.width / 375; // Using 375 as base width for scaling

// Function to normalize sizes for different screen dimensions
const normalize = (size) => {
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

const CategoryCard = ({ category, onPress, style }) => {
  const { theme } = useTheme();
  
  // Calculate dynamic sizes based on screen width
  const cardWidth = normalize(150);
  const imageSize = normalize(80);
  const cardHeight = normalize(120);

  return (
    <TouchableOpacity
      key={category.id}
      style={[
        styles.categoryCard,
        {
          width: cardWidth,
          height: cardHeight,
          backgroundColor: theme.cardBackgroundColor,
        },
        style,
      ]}
      onPress={onPress}
    >
      <View style={[styles.categoryImageContainer, { width: imageSize, height: imageSize }]}>
        <Image
          source={{ uri: category.image_url }}
          style={styles.categoryImage}
        />
      </View>
      <Text
        style={[
          styles.categoryTitle,
          { color: theme.textColor }
        ]}
        numberOfLines={1}
      >
        {category.name}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  categoryCard: {
    position: "relative",
    borderRadius: 10,
    marginBottom: normalize(12),
    marginHorizontal: normalize(4),
    alignItems: "center",
    justifyContent: "flex-end",
    padding: normalize(12),
    shadowColor: "#343C41",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  categoryImageContainer: {
    position: "absolute",
    borderRadius: 150,
    overflow: "hidden",
    top: normalize(-10),
  },
  categoryImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  categoryTitle: {
    fontSize: normalize(14),
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default CategoryCard;