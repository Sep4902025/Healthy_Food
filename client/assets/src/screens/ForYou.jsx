import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import MaterialCommunityIcons from "../components/common/VectorIcons/MaterialCommunityIcons";
import MainLayoutWrapper from "../components/layout/MainLayoutWrapper";
import DishedV1 from "../components/common/DishedV1";
import { useTheme } from "../contexts/ThemeContext";
import { useSelector } from "react-redux";
import { userSelector } from "../redux/selectors/selector";
import quizService from "../services/quizService";

const ForYou = ({ navigation }) => {
  const { theme } = useTheme();
  const [dishes, setDishes] = useState([]);
  const [sortType, setSortType] = useState(""); // Options: "", "name_asc", "name_desc", "calories_asc", "calories_desc"
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState({ initial: true, more: false });
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 10;
  const user = useSelector(userSelector);
  const userId = user?._id;

  const loadForYouDishes = useCallback(
    async (pageNum, isRefresh = false) => {
      try {
        setError(null);
        const response = await quizService.getForyou(userId, pageNum, limit);
        if (response.success) {
          const newDishes = response.dishes || [];
          // Ensure recipeId is a string (extract _id if it's an object)
          const processedDishes = newDishes.map((dish) => ({
            ...dish,
            recipeId:
              typeof dish.recipeId === "object" && dish.recipeId?._id
                ? dish.recipeId._id
                : dish.recipeId,
          }));
          setDishes((prev) => {
            const existingIds = isRefresh ? new Set() : new Set(prev.map((dish) => dish._id));
            const filteredNewDishes = processedDishes.filter((dish) => !existingIds.has(dish._id));
            return isRefresh ? processedDishes : [...prev, ...filteredNewDishes];
          });
          setPage(pageNum);
          setHasMore(pageNum < response.pagination.totalPages);
        } else {
          setHasMore(false);
          setError("No more dishes available.");
        }
      } catch (error) {
        console.error("Error loading for you dishes:", error.message);
        setError("Failed to load dishes. Please try again.");
        setHasMore(false);
      }
    },
    [userId]
  );

  useEffect(() => {
    loadForYouDishes(1, true).then(() => {
      setLoading((prev) => ({ ...prev, initial: false }));
    });
  }, [loadForYouDishes]);

  const loadMoreDishes = useCallback(async () => {
    if (!hasMore || loading.more) return;
    setLoading((prev) => ({ ...prev, more: true }));
    await loadForYouDishes(page + 1);
    setLoading((prev) => ({ ...prev, more: false }));
  }, [hasMore, loading.more, page, loadForYouDishes]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    await loadForYouDishes(1, true);
    setRefreshing(false);
  }, [loadForYouDishes]);

  const toggleSort = useCallback(() => {
    setSortType((prev) => {
      if (prev === "") return "name_asc";
      if (prev === "name_asc") return "name_desc";
      if (prev === "name_desc") return "calories_asc";
      if (prev === "calories_asc") return "calories_desc";
      return "";
    });
  }, []);

  const sortedDishes = useMemo(() => {
    const sorted = [...dishes];
    if (sortType === "name_asc") {
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortType === "name_desc") {
      return sorted.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortType === "calories_asc") {
      return sorted.sort((a, b) => a.calories - b.calories);
    } else if (sortType === "calories_desc") {
      return sorted.sort((a, b) => b.calories - a.calories);
    }
    return sorted;
  }, [dishes, sortType]);

  const handleScroll = useCallback(
    ({ nativeEvent }) => {
      const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
      const paddingToBottom = 20;
      if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
        loadMoreDishes();
      }
    },
    [loadMoreDishes]
  );

  const handleDishPress = useCallback(
    (dish) => {
      navigation.navigate("DishDetail", { dish }); // Navigate to a detail screen with dish data
    },
    [navigation]
  );

  return (
    <MainLayoutWrapper>
      <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
        <View style={styles.sortHeader}>
          <Text style={[styles.headerTitle, { color: theme.textColor }]}>For You Dishes</Text>
          <TouchableOpacity style={styles.sortButton} onPress={toggleSort}>
            <Text style={[styles.sortText, { color: theme.textColor }]}>
              Sort ({sortType.replace("_", " ") || "default"})
            </Text>
            <MaterialCommunityIcons name="sort" size={20} color={theme.textColor} />
          </TouchableOpacity>
        </View>

        {loading.initial ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[styles.loadingText, { color: theme.textColor }]}>Loading dishes...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: theme.textColor }]}>{error}</Text>
            <TouchableOpacity onPress={onRefresh} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          >
            {sortedDishes.length > 0 ? (
              sortedDishes.map((dish, index) => (
                <TouchableOpacity
                  key={`${dish._id}-${index}`}
                  onPress={() => handleDishPress(dish)}
                >
                  <DishedV1 dish={dish} />
                </TouchableOpacity>
              ))
            ) : (
              <Text style={[styles.noResultsText, { color: theme.textColor }]}>
                No recommended dishes found. Try refreshing!
              </Text>
            )}
            {loading.more && (
              <ActivityIndicator size="large" color={theme.primary} style={styles.loadingMore} />
            )}
          </ScrollView>
        )}
      </View>
    </MainLayoutWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    overflow: "visible",
  },
  scrollView: {
    paddingHorizontal: 2,
  },
  sortHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 8,
    backgroundColor: "white",
    shadowColor: "#343C41",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sortText: {
    marginRight: 5,
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
  },
  retryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#007AFF",
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  loadingMore: {
    marginVertical: 20,
  },
  noResultsText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
});

export default ForYou;
