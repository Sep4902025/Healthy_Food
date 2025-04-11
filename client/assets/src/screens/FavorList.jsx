import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from "react-native";
import MainLayoutWrapper from "../components/layout/MainLayoutWrapper";
import DishedFavor from "../components/common/DishedFavor";
import { favorSelector } from "../redux/selectors/selector";
import { useSelector } from "react-redux";
import SpinnerLoading from "../components/common/SpinnerLoading";
import { useTheme } from "../contexts/ThemeContext";
import dishesService from "../services/dishService";

const HEIGHT = Dimensions.get("window").height;

function FavorList() {
  const [favoriteItems, setFavoriteItems] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState({ initial: true, more: false });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const limit = 10; // Số lượng món ăn mỗi trang
  const favor = useSelector(favorSelector);
  const { theme } = useTheme();

  useEffect(() => {
    loadInitialDishes();
  }, []);

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
      const response = await dishesService.getAllDishes(pageNum, limit);
      if (response.success) {
        const newDishes = response.data.items || [];
        setDishes((prev) => (isRefresh ? newDishes : [...prev, ...newDishes]));
        setPage(pageNum);
        setHasMore(pageNum < response.data.totalPages);
      } else {
        console.error("Failed to load dishes:", response?.message);
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
    setRefreshing(false);
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
    const filteredItems = dishes.filter((item) => isFavorite(item._id));
    
    setFavoriteItems(filteredItems);
  };

  const handleScroll = useCallback(
    ({ nativeEvent }) => {
      const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
      const paddingToBottom = 20;
      if (
        layoutMeasurement.height + contentOffset.y >=
        contentSize.height - paddingToBottom
      ) {
        loadMoreDishes();
      }
    },
    [hasMore, loading.more, page]
  );

  return (
    <MainLayoutWrapper>
      <View style={styles.container}>
        <Text style={{ ...styles.headerTitle, color: theme.textColor }}>
          My Favorites
        </Text>
        {loading.initial ? (
          <View style={styles.loadingContainer}>
            <SpinnerLoading />
          </View>
        ) : (
          <ScrollView
            style={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            <View style={styles.gridContainer}>
              {favoriteItems.length === 0 ? (
                <Text style={{ color: theme.textColor }}>
                  No favorite items found.
                </Text>
              ) : (
                favoriteItems.map((item) => (
                  <View key={item._id} style={styles.gridItem}>
                    <DishedFavor item={item} />
                  </View>
                ))
              )}
              {loading.more && (
                <ActivityIndicator
                  size="large"
                  color={theme.textColor}
                  style={styles.loadingMore}
                />
              )}
            </View>
          </ScrollView>
        )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingMore: {
    marginVertical: 20,
  },
});

export default FavorList;
