import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import CategoryTag from "./CategoryTag";
import { useDispatch, useSelector } from "react-redux";
import { favorSelector } from "../../redux/selectors/selector";
import { toggleFavorite } from "../../redux/actions/favoriteThunk";
import { useTheme } from "../../contexts/ThemeContext";
const WIDTH = Dimensions.get("window").width;

const DishedV2 = ({ item, onPress, onFavoritePress }) => {
  const dispatch = useDispatch();
  const favorite = useSelector(favorSelector);
  const { theme } = useTheme();

  const isFavorite = (id) => {
    return favorite.favoriteList?.includes(id);
  };

  const handleOnSavePress = (dish) => {
    dispatch(toggleFavorite({ id: dish._id }));
    onFavoritePress && onFavoritePress();
  };

  return (
    <TouchableOpacity
      key={item._id}
      style={[
        styles.resultCard,
        { backgroundColor: item.bgColor ?? theme.cardBackgroundColor },
      ]}
      onPress={onPress}
    >
      <View style={styles.resultInfo}>
        <View style={styles.resultTitleContainer}>
          <Text style={{ ...styles.resultTitle, color: theme.textColor }}>
            {item.name}
          </Text>
          <CategoryTag name={item.type} color="#FF6B00" />
        </View>

        <Text style={styles.resultDescription}>{item.description}</Text>
      </View>
      <Image source={{ uri: item.imageUrl }} style={styles.resultImage} />
      <TouchableOpacity
        style={styles.favoriteButton}
        onPress={() => handleOnSavePress(item)}
      >
        {favorite.isLoading ? (
          <ActivityIndicator size={22} color="#FC8019" />
        ) : (
          <MaterialCommunityIcons
            name={
              isFavorite(item._id) ? "heart-multiple" : "heart-plus-outline"
            }
            size={22}
            color="#FF9500"
          />
        )}
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  resultCard: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    marginTop: 30,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,

    elevation: 12,
  },
  resultInfo: {
    width: "65%",
    justifyContent: "center",
  },
  resultTitleContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    // alignItems: "center",
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 8,
  },
  resultDescription: {
    width: "100%",
    fontSize: 12,
    color: "#999",
  },
  resultImage: {
    position: "absolute",
    width: WIDTH * 0.23,
    height: WIDTH * 0.23,
    right: 0,
    borderRadius: 150,
    marginRight: 36,
    transform: [{ translateY: -WIDTH * 0.1 }],
  },
  favoriteButton: {
    position: "absolute",
    bottom: 16,
    right: 16,
  },
});

export default DishedV2;
