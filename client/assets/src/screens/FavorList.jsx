import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import MainLayoutWrapper from "../components/layout/MainLayoutWrapper";
import DishedFavor from "../components/common/DishedFavor";
import { getDishes } from "../services/dishes";
import { favorSelector } from "../redux/selectors/selector";
import { useSelector } from "react-redux";
import SpinnerLoading from "../components/common/SpinnerLoading";
import PaddingScrollViewBottom from "../components/common/PaddingScrollViewBottom";
import { useTheme } from "../contexts/ThemeContext";
const HEIGHT = Dimensions.get("window").height;
function FavorList() {
  const [favoriteItems, setFavoriteItems] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState({ loadFavorDishes: true });
  const favor = useSelector(favorSelector);
  const { theme } = useTheme();

  useEffect(() => {
    loadDishes();
  }, []);

  const loadDishes = async () => {
    const response = await getDishes();

    if (response.status === 200) {
      setDishes(response.data?.data || []);
    }
  };

  useEffect(() => {
    if (!favor?.isLoading && dishes.length > 0) {
      loadFavoriteItems();
    }
  }, [favor.favoriteList, dishes]);

  const isFavorite = (id) => {
    return favor.favoriteList.includes(id);
  };

  const loadFavoriteItems = () => {
    setLoading({ ...loading, loadFavorDishes: true });
    const filteredItems = dishes.filter((item) => isFavorite(item._id));
    setFavoriteItems(filteredItems);
    setLoading({ ...loading, loadFavorDishes: false });
  };

  return (
    <MainLayoutWrapper>
      <View style={styles.container}>
        <Text style={{ ...styles.headerTitle, color: theme.textColor }}>
          My Favorites
        </Text>
        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.gridContainer}>
            {loading.loadFavorDishes ? (
              <SpinnerLoading />
            ) : favoriteItems.length === 0 ? (
              <Text>No favorite items found.</Text>
            ) : (
              favoriteItems.map((item) => (
                <View key={item._id} style={styles.gridItem}>
                  <DishedFavor item={item} />
                </View>
              ))
            )}
          </View>
          <PaddingScrollViewBottom />
        </ScrollView>
      </View>
    </MainLayoutWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  scrollContainer: {
    flex: 1,
  },
  gridContainer: {
    minHeight: HEIGHT * 0.8,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 2,
  },
  gridItem: {
    width: "48%",
    marginBottom: 16,
  },
});

export default FavorList;
