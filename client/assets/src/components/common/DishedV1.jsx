import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  PixelRatio,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import CategoryTag from "./CategoryTag";
import { ScreensName } from "../../constants/ScreensName";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { favorSelector } from "../../redux/selectors/selector";
import { toggleFavorite } from "../../redux/actions/favoriteThunk";
import { getSeasonColor } from "../../utils/common";
import { useTheme } from "../../contexts/ThemeContext";

const window = Dimensions.get("window");
const scale = window.width / 375;

const normalize = (size) => {
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

const DishedV1 = ({ dish, onSavePress, onArrowPress, disabledDefaultNavigate }) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const favorite = useSelector(favorSelector);
  const { theme } = useTheme();

  console.log("Dish data:", dish);

  const isFavorite = (id) => {
    return favorite.favoriteList?.includes(id);
  };

  const handleOnArrowPress = () => {
    if (!dish || !dish._id) return;
    !disabledDefaultNavigate && navigation.navigate(ScreensName.favorAndSuggest, { dish: dish });
    onArrowPress && onArrowPress();
  };

  const handleOnSavePress = (dish) => {
    if (!dish || !dish._id) return;
    dispatch(toggleFavorite({ id: dish._id }));
    onSavePress && onSavePress();
  };

  // Kiểm tra các thuộc tính tối thiểu để hiển thị giao diện
  if (!dish || !dish._id || !dish.name || !dish.imageUrl) {
    return (
      <View style={[styles.dishCard, { justifyContent: "center", alignItems: "center" }]}>
        <Text style={{ color: theme.textColor, marginTop: normalize(8) }}>Loading...</Text>
      </View>
    );
  }

  // Kiểm tra nếu không có recipeId, hiển thị ghi chú "No recipe available"
  const hasRecipe = !!dish.recipeId;

  return (
    <TouchableOpacity
      key={dish._id}
      style={[styles.dishCard, { backgroundColor: theme.cardBackgroundColor }]}
      onPress={hasRecipe ? handleOnArrowPress : null} // Vô hiệu hóa nhấn nếu không có công thức
    >
      <Image source={{ uri: dish.imageUrl }} style={styles.dishImage} />
      <View style={styles.dishInfo}>
        <Text style={[styles.dishTitle, { color: theme.textColor }]} numberOfLines={1}>
          {dish.name}
        </Text>
        <CategoryTag name={dish.type || "Unknown"} />
        <Text style={styles.dishDescription} numberOfLines={2}>
          {dish.description || "No description available"}
        </Text>
        {!hasRecipe && <Text style={styles.noRecipeText}>No recipe available</Text>}
      </View>
      <TouchableOpacity style={styles.saveButton} onPress={() => handleOnSavePress(dish)}>
        {favorite.isLoading ? (
          <ActivityIndicator size={normalize(24)} color="#FC8019" />
        ) : isFavorite(dish._id) ? (
          <MaterialCommunityIcons name="heart-multiple" size={normalize(24)} color="#FC8019" />
        ) : (
          <MaterialCommunityIcons name="heart-plus-outline" size={normalize(24)} color="#FC8019" />
        )}
      </TouchableOpacity>
      {hasRecipe && (
        <TouchableOpacity
          style={[styles.arrowButton, { backgroundColor: theme.nextButtonColor }]}
          onPress={handleOnArrowPress}
        >
          <Ionicons name="arrow-forward" size={normalize(18)} color="white" />
        </TouchableOpacity>
      )}
      <View style={[styles.seasonTag, { borderColor: getSeasonColor(dish.season || "Unknown") }]}>
        <Text
          style={{
            color: getSeasonColor(dish.season || "Unknown"),
            fontSize: normalize(6),
          }}
        >
          {dish?.season || "Unknown"}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  dishCard: {
    borderRadius: normalize(10),
    borderWidth: 1,
    borderColor: "white",
    marginBottom: normalize(16),
    flexDirection: "row",
    padding: normalize(12),
    minHeight: normalize(104),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  dishImage: {
    width: normalize(80),
    height: normalize(80),
    borderRadius: normalize(10),
    marginRight: normalize(12),
  },
  dishInfo: {
    flex: 1,
    justifyContent: "center",
    paddingRight: normalize(32),
  },
  dishTitle: {
    fontSize: normalize(14),
    fontWeight: "bold",
    marginBottom: normalize(4),
    width: "90%",
  },
  dishDescription: {
    fontSize: normalize(12),
    color: "#888",
    width: "90%",
    marginTop: normalize(4),
  },
  noRecipeText: {
    fontSize: normalize(10),
    color: "#FF6347", // Màu đỏ nhạt tương tự như trên web
    marginTop: normalize(4),
  },
  saveButton: {
    position: "absolute",
    top: normalize(12),
    right: normalize(12),
  },
  arrowButton: {
    padding: normalize(4),
    paddingHorizontal: normalize(8),
    borderRadius: normalize(8),
    position: "absolute",
    bottom: normalize(12),
    right: normalize(12),
  },
  seasonTag: {
    position: "absolute",
    top: 0,
    left: 0,
    padding: normalize(4),
    paddingHorizontal: normalize(8),
    borderBottomRightRadius: normalize(8),
    borderTopLeftRadius: normalize(8),
    backgroundColor: "rgba(256,256,256,0.9)",
    borderWidth: 1,
  },
});

export default DishedV1;
