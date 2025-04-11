import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import AntDesignIcon from "./VectorIcons/AntDesignIcon";
import { useDispatch, useSelector } from "react-redux";
import { favorSelector } from "../../redux/selectors/selector";
import { toggleFavorite } from "../../redux/actions/favoriteThunk";
import MaterialCommunityIcons from "./VectorIcons/MaterialCommunityIcons";
import { useTheme } from "../../contexts/ThemeContext";
const HEIGHT = Dimensions.get("window").height;

const DishedFavor = ({ item }) => {
  const dispatch = useDispatch();
  const { theme } = useTheme();

  const handleOnChangeFavorite = () => {
    dispatch(toggleFavorite({ id: item._id }));
  };

  return (
    <TouchableOpacity
      style={{
        ...styles.dishedFavorContainer,
        backgroundColor: theme.cardBackgroundColor,
      }}
    >
      <View style={styles.imageContainer}>
        <Image
          source={
            item.imageUrl
              ? { uri: item.imageUrl }
              : require("../../../assets/image/blueberry-egg.png")
          }
          style={styles.dishImage}
          resizeMode="cover"
        />
        <TouchableOpacity
          style={styles.videoIndicator}
          activeOpacity={0.9}
          onPress={handleOnChangeFavorite}
        >
         
          <MaterialCommunityIcons
            name="heart-multiple"
            size={24}
            color="#40B491"
          />
        </TouchableOpacity>
      </View>
      <Text style={{ ...styles.dishTitle, color: theme.textColor }}>
        {item.name}
      </Text>
      
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  dishedFavorContainer: {
    minHeight: HEIGHT * 0.2,
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "white",
    position: "relative",
    padding: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,

    elevation: 3,
  },
  imageContainer: {
    position: "relative",
  },
  dishImage: {
    width: "100%",
    height: HEIGHT * 0.12,
    borderRadius: 8,
  },
  videoIndicator: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "white",
    padding: 6,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  videoIcon: {
    fontSize: 12,
  },
  dishTitle: {
    fontSize: 14,
    fontWeight: "bold",
    padding: 8,
  },
  deleteButton: {
    // position: "absolute",
    bottom: 8,
    alignSelf: "center",
  },
  deleteIcon: {
    color: "#FF0000",
    fontSize: 16,
  },
});

export default DishedFavor;
