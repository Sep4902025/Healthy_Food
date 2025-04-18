import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
  PixelRatio,
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
import HomeService from "../services/HomeService";
import { normalize } from "../utils/common";

function Home({ navigation }) {
  const [seasonalDishes, setSeasonalDishes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState({ initial: true, more: false });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 10; // Số lượng món ăn mỗi trang

  const favor = useSelector(favorSelector);
  const user = useSelector(userSelector);

  const dispatch = useDispatch();
  const season = useCurrentSeason();

  useEffect(() => {
    const validSeasons = ["Spring", "Summer", "Fall", "Winter"];
    if (validSeasons.includes(season)) {
      loadInitialDishes();
    }
  }, [season]);

  useEffect(() => {
    loadFavoritesData();
  }, [dispatch, user]);

  const loadFavoritesData = async () => {
    if (user?._id) {
      dispatch(loadFavorites(user._id));
    }
  };

  const loadInitialDishes = async () => {
    setLoading((prev) => ({ ...prev, initial: true }));
    await loadDishes(1, true);
    setLoading((prev) => ({ ...prev, initial: false }));
  };

  const loadMoreDishes = async () => {
    if (!hasMore || loading.more) return;
    setLoading((prev) => ({ ...prev, more: true }));
    await loadDishes(page + 1);
    setLoading((prev) => ({ ...prev, more: false }));
  };

  const loadDishes = async (pageNum, isRefresh = false) => {
    try {
      if (!season) return;

      const response = await HomeService.getDishBySeason(season, pageNum, limit);

      if (response?.success) {
        const newDishes = response.data.items;

        setSeasonalDishes((prev) => (isRefresh ? newDishes : [...prev, ...newDishes]));

        setPage(pageNum);
        setHasMore(pageNum < response.data.totalPages);
      } else {
        console.error("Failed to load dishes:", response);
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error loading dishes:", error.message);
      setHasMore(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    await loadDishes(1, true);
    await loadFavoritesData();
    setRefreshing(false);
  };

  const handleSearch = (searchString) => {
    navigation.navigate(ScreensName.search, { searchQuery: searchString });
  };

  const handleClear = () => {
    setSearchQuery("");
  };

  const handleViewAll = () => {
    navigation.navigate(ScreensName.list);
  };

  const handleScroll = useCallback(
    ({ nativeEvent }) => {
      const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
      const paddingToBottom = normalize(20);
      if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
        loadMoreDishes();
      }
    },
    [hasMore, loading.more, page]
  );

  return (
    <MainLayoutWrapper>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
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
          <View style={styles.categoriesGrid}>
            {Object.values(DishType).map((category, key) => (
              <CategoryCard
                key={key}
                category={{ id: key, ...category }}
                onPress={() => navigation.navigate(ScreensName.search, { category })}
                style={styles.categoryCard}
              />
            ))}
          </View>
        </View>

        <View style={styles.seasonalSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Seasonal Dishes</Text>
            <TouchableOpacity onPress={handleViewAll}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {loading.initial ? (
            <SpinnerLoading />
          ) : seasonalDishes.filter((item) =>
              item?.season?.toLowerCase()?.includes(season?.toLowerCase())
            ).length > 0 ? (
            seasonalDishes
              .filter((item) => item?.season?.toLowerCase()?.includes(season?.toLowerCase()))
              .map((dish, index) => (
                <DishedV1
                  dish={dish}
                  key={dish._id + index}
                  onPress={() => navigation.navigate(ScreensName.favorAndSuggest, { dish })}
                />
              ))
          ) : (
            <Text style={styles.noResultsText}>No seasonal dishes found</Text>
          )}

          {loading.more && (
            <ActivityIndicator size="large" color="#38B2AC" style={styles.loadingMore} />
          )}
        </View>
      </ScrollView>
    </MainLayoutWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: normalize(16),
  },
  categoriesSection: {
    marginTop: normalize(16),
  },
  sectionTitle: {
    fontSize: normalize(16),
    color: "#38B2AC",
    fontWeight: "500",
    marginBottom: normalize(16),
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: normalize(40), // Add space for category images that are positioned absolute
  },
  categoryCard: {
    marginBottom: normalize(24),
  },
  seasonalSection: {
    marginVertical: normalize(16),
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: normalize(16),
  },
  viewAllText: {
    color: "#38B2AC",
    fontSize: normalize(14),
  },
  noResultsText: {
    fontSize: normalize(16),
    textAlign: "center",
    padding: normalize(20),
  },
  loadingMore: {
    marginVertical: normalize(20),
  },
});

export default Home;
