import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import MaterialCommunityIcons from "../components/common/VectorIcons/MaterialCommunityIcons";
import MainLayoutWrapper from "../components/layout/MainLayoutWrapper";
import DishedV1 from "../components/common/DishedV1";
import dishesService from "../services/dishService";

const List = () => {
  const [dishes, setDishes] = useState([]);
  const [sortType, setSortType] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState({ initial: true, more: false });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 10;

  const loadDishes = useCallback(async (pageNum, isRefresh = false) => {
    try {
      const response = await dishesService.getAllDishes(pageNum, limit);
      if (response.success) {
        const newDishes = response.data.items || [];
      
        setDishes((prev) => {
          const existingIds = isRefresh ? new Set() : new Set(prev.map((dish) => dish._id));
          const filteredNewDishes = newDishes.filter((dish) => !existingIds.has(dish._id));
          const updatedDishes = isRefresh ? newDishes : [...prev, ...filteredNewDishes];
          return updatedDishes;
        });
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
  }, []);

  useEffect(() => {
    loadDishes(1, true).then(() => {
      setLoading((prev) => ({ ...prev, initial: false }));
    });
  }, [loadDishes]);

  const loadMoreDishes = useCallback(async () => {
    if (!hasMore || loading.more) return;
    setLoading((prev) => ({ ...prev, more: true }));
    await loadDishes(page + 1);
    setLoading((prev) => ({ ...prev, more: false }));
  }, [hasMore, loading.more, page, loadDishes]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    await loadDishes(1, true);
    setRefreshing(false);
  }, [loadDishes]);

  const toggleSort = useCallback(() => {
    setSortType((prev) => (prev === "asc" ? "desc" : "asc"));
  }, []);

  const sortedDishes = useMemo(() => {
    const sorted = [...dishes];
    if (sortType === "asc") {
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortType === "desc") {
      return sorted.sort((a, b) => b.name.localeCompare(a.name));
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

  return (
    <MainLayoutWrapper>
      <View style={styles.container}>
        <View style={styles.sortHeader}>
          <Text style={styles.headerTitle}>All Dishes</Text>
          <TouchableOpacity style={styles.sortButton} onPress={toggleSort}>
            <Text style={styles.sortText}>Sort ({sortType || "none"})</Text>
            <MaterialCommunityIcons name="sort" size={20} color="#333" />
          </TouchableOpacity>
        </View>

        {loading.initial ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#38B2AC" />
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
                <DishedV1 dish={dish} key={`${dish._id}-${index}`} />
              ))
            ) : (
              <Text style={styles.noResultsText}>No dishes found</Text>
            )}
            {loading.more && (
              <ActivityIndicator size="large" color="#38B2AC" style={styles.loadingMore} />
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
    color: "#333",
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 4,
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
    color: "#333",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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

export default List;
