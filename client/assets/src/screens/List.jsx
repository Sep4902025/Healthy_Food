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
  const [sortType, setSortType] = useState(""); // Sorting state
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState({ initial: true, more: false });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 10; // Số lượng món ăn mỗi trang

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
      const response = await dishesService.getAllDishes(pageNum, limit); // Gọi API từ dishesService
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

  const toggleSort = () => {
    setSortType((prev) => (prev !== "asc" ? "asc" : "desc"));
  };

  const filterDishes = useMemo(() => {
    const filteredDishes = [...dishes];

    if (sortType === "asc") {
      filteredDishes.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortType === "desc") {
      filteredDishes.sort((a, b) => b.name.localeCompare(a.name));
    }

    return filteredDishes;
  }, [dishes, sortType]);

  const handleScroll = useCallback(
    ({ nativeEvent }) => {
      const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
      const paddingToBottom = 20;
      if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
        loadMoreDishes();
      }
    },
    [hasMore, loading.more, page]
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
            style={{ paddingHorizontal: 2 }}
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          >
            {filterDishes.length > 0 ? (
              filterDishes.map((dish) => <DishedV1 dish={dish} key={dish._id} />)
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
    shadowOffset: {
      width: 0,
      height: 2,
    },
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
