import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
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

const DishedV1 = ({
  dish,
  onSavePress,
  onArrowPress,
  disabledDefaultNavigate,
}) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const favorite = useSelector(favorSelector);
  const { theme } = useTheme();

  const isFavorite = (id) => {
    return favorite.favoriteList?.includes(id);
  };

  const handleOnArrowPress = () => {
    !disabledDefaultNavigate &&
      navigation.navigate(ScreensName.favorAndSuggest, { dish: dish });
    onArrowPress && onArrowPress();
  };
  const handleOnSavePress = (dish) => {
    dispatch(toggleFavorite({ id: dish._id }));
    onSavePress && onSavePress();
  };
  return (
    <TouchableOpacity
      key={dish._id}
      style={{
        ...styles.dishCard,
        backgroundColor: theme.cardBackgroundColor,
      }}
    >
      <Image source={{ uri: dish.imageUrl }} style={styles.dishImage} />
      <View style={styles.dishInfo}>
        <Text style={{ ...styles.dishTitle, color: theme.textColor }}>
          {dish.name}
        </Text>
        <CategoryTag name={dish.type} />
        <Text style={styles.dishDescription}>{dish.description}</Text>
      </View>
      <TouchableOpacity
        style={styles.saveButton}
        onPress={() => handleOnSavePress(dish)}
      >
        {favorite.isLoading ? (
          <ActivityIndicator size={24} color="#FC8019" />
        ) : isFavorite(dish._id) ? (
          <MaterialCommunityIcons
            name="heart-multiple"
            size={24}
            color="#FC8019"
          />
        ) : (
          <MaterialCommunityIcons
            name="heart-plus-outline"
            size={24}
            color="#FC8019"
          />
        )}
      </TouchableOpacity>
      <TouchableOpacity
        style={{
          ...styles.arrowButton,
          backgroundColor: theme.nextButtonColor,
        }}
        onPress={handleOnArrowPress}
      >
        <Ionicons name="arrow-forward" size={18} color="white" />
      </TouchableOpacity>
      <View
        style={{
          ...styles.seasonTag,
          borderColor: getSeasonColor(dish.season),
        }}
      >
        <Text style={{ color: getSeasonColor(dish.season), fontSize: 10 }}>
          {dish?.season}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  dishCard: {
    backgroundColor: "white",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "white",
    marginBottom: 16,
    flexDirection: "row",
    padding: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,

    elevation: 3,
  },
  dishImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 12,
  },
  dishInfo: {
    flex: 1,
    justifyContent: "center",
  },
  dishTitle: {
    width: "80%",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
  },
  dishDescription: {
    width: "80%",
    fontSize: 12,
    color: "#888",
  },
  saveButton: {
    position: "absolute",
    top: "20%",
    right: 16,
  },
  arrowButton: {
    backgroundColor: "#042628",
    padding: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    position: "absolute",
    bottom: "20%",
    right: 12,
  },
  seasonTag: {
    position: "absolute",
    top: 0,
    left: 0,
    padding: 4,
    paddingHorizontal: 8,
    borderBottomRightRadius: 8,
    borderTopLeftRadius: 8,
    backgroundColor: "rgba(256,256,256,0.9)",
    borderWidth: 1,
  },
});

export default DishedV1;
