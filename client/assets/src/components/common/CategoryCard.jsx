import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useTheme } from "../../contexts/ThemeContext";

const WIDTH = Dimensions.get("window").width;
const HEIGHT = Dimensions.get("window").height;

const CategoryCard = ({ category, onPress, cardWidth, imageSize, style }) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      key={category.id}
      style={{
        ...styles.categoryCard,
        width: cardWidth ?? "45%",
        backgroundColor: theme.cardBackgroundColor,
        // shadowColor: theme.cardShadowColor,
        ...style,
      }}
      onPress={onPress}
    >
      <View style={styles.categoryImageContainer}>
        <Image
          source={{ uri: category.image_url }}
          style={{
            ...styles.categoryImage,
            width: imageSize ?? WIDTH * 0.25,
            height: imageSize ?? WIDTH * 0.25,
          }}
        />
      </View>
      <Text
        style={{
          ...styles.categoryTitle,
          color: theme.textColor,
        }}
      >
        {category.name}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  categoryCard: {
    position: "relative",

    width: "45%",
    height: HEIGHT * 0.11,
    backgroundColor: "white",
    borderRadius: 10,
    marginBottom: 16,
    alignItems: "center",
    justifyContent: "flex-end",
    padding: 12,
    paddingVertical: 14,
    marginTop: HEIGHT * 0.05,
    shadowColor: "#343C41",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,

    elevation: 3,
  },
  categoryImageContainer: {
    position: "absolute",
    width: WIDTH * 0.25,
    height: WIDTH * 0.25,
    borderRadius: 150,
    overflow: "hidden",
    marginBottom: 10,
    transform: [{ translateY: -WIDTH * 0.1 }],
  },
  categoryImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default CategoryCard;
