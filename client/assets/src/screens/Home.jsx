import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  RefreshControl,
} from "react-native";
import MainLayoutWrapper from "../components/layout/MainLayoutWrapper";
import SearchBar from "../components/common/SearchBar";
import { ScreensName } from "../constants/ScreensName";
import DishedV1 from "../components/common/DishedV1";
import CategoryCard from "../components/common/CategoryCard";
import useCurrentSeason from "../hooks/useCurrentSeason";
import { DishType } from "../constants/DishType";
import { useDispatch, useSelector } from "react-redux";
import { loadFavorites } from "../redux/actions/favoriteThunk";
import { favorSelector, userSelector } from "../redux/selectors/selector";
import SpinnerLoading from "../components/common/SpinnerLoading";
import PaddingScrollViewBottom from "../components/common/PaddingScrollViewBottom";
import HomeService from "../services/HomeService";

const WIDTH = Dimensions.get("window").width;
const HEIGHT = Dimensions.get("window").height;

function Home({ navigation }) {
  const [seasonalDishes, setSeasonalDishes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState({ loadDishes: true });
  const favor = useSelector(favorSelector);
  const user = useSelector(userSelector);

  const dispatch = useDispatch();

  const season = useCurrentSeason();

  useEffect(() => {
    loadDishes();
  }, []);

  useEffect(() => {
    loadFavoritesData();
  }, [dispatch, user]);

  const loadFavoritesData = async () => {
    if (user?.userId) {
      // Đảm bảo userId tồn tại
      dispatch(loadFavorites(user.userId));
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDishes();
    await loadFavoritesData();
    setRefreshing(false);
  };

  const loadDishes = async () => {
    setLoading((prev) => ({ ...prev, loadDishes: true }));
    try {
      const response = await HomeService.getAllDishes();
      if (response?.status === "success") {
        // Sửa từ response?.success thành response?.status
        setSeasonalDishes(response.data || []);
      } else {
        console.error("Failed to load dishes:", response?.message || "Unknown error");
        setSeasonalDishes([]);
      }
    } catch (error) {
      console.error("Error loading dishes:", error.message || error);
      setSeasonalDishes([]);
    } finally {
      setLoading((prev) => ({ ...prev, loadDishes: false }));
    }
  };

  const handleSearch = async (searchString) => {
    navigation.navigate(ScreensName.search, { searchQuery: searchString });
  };

  const handleClear = () => {
    setSearchQuery("");
  };

  const handleViewAll = () => {
    navigation.navigate(ScreensName.list);
  };

  return (
    <MainLayoutWrapper>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <SearchBar
          placeholder="What do you need?"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmit={() => handleSearch(searchQuery)}
          onClear={handleClear}
        />

        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Browse by category</Text>
          <ScrollView
            style={styles.categoriesGrid}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingRight: WIDTH * ((Object.values(DishType).length - 1) * 0.22),
            }}
          >
            {Object.values(DishType).map((category, key) => (
              <CategoryCard
                key={key}
                category={{
                  id: key,
                  ...category,
                }}
                onPress={() => navigation.navigate(ScreensName.search, { category })}
                cardWidth={"20%"}
                style={{ marginRight: "4%" }}
              />
            ))}
          </ScrollView>
        </View>

        <View style={styles.seasonalSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Seasonal Dishes</Text>
            <TouchableOpacity onPress={() => handleViewAll()}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {loading.loadDishes ? (
            <SpinnerLoading />
          ) : seasonalDishes.length > 0 ? (
            seasonalDishes
              .filter((item) => item.season === season || item.season === "All seasons")
              .map((dish) => (
                <DishedV1
                  dish={dish}
                  key={dish._id}
                  onPress={() => navigation.navigate(ScreensName.favorAndSuggest, { dish })} // Thêm onPress để điều hướng
                />
              ))
          ) : (
            <Text style={styles.noResultsText}>No seasonal dishes found</Text>
          )}
        </View>
        <PaddingScrollViewBottom />
      </ScrollView>
    </MainLayoutWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },

  categoriesSection: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    color: "#38B2AC",
    fontWeight: "500",
    marginBottom: 16,
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  seasonalSection: {
    marginVertical: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  viewAllText: {
    color: "#38B2AC",
    fontSize: 14,
  },
  noResultsText: {
    fontSize: 16,
    textAlign: "center",
  },
});

export default Home;
