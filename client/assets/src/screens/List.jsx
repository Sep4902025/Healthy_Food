// Import các hook và component cần thiết từ React và React Native
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

// Import icon từ thư viện tùy chỉnh
import MaterialCommunityIcons from "../components/common/VectorIcons/MaterialCommunityIcons";
// Import layout chính của ứng dụng
import MainLayoutWrapper from "../components/layout/MainLayoutWrapper";
// Import component hiển thị từng món ăn
import DishedV1 from "../components/common/DishedV1";
// Import service để lấy dữ liệu món ăn từ API
import dishesService from "../services/dishService";

// Khai báo component List
const List = () => {
  // Khai báo state lưu danh sách món ăn
  const [dishes, setDishes] = useState([]);
  // State để xác định kiểu sắp xếp (asc/desc)
  const [sortType, setSortType] = useState("");
  // State xác định xem có đang làm mới danh sách không
  const [refreshing, setRefreshing] = useState(false);
  // State theo dõi trạng thái loading ban đầu và khi tải thêm
  const [loading, setLoading] = useState({ initial: true, more: false });
  // State theo dõi trang hiện tại
  const [page, setPage] = useState(1);
  // State xác định còn dữ liệu để tải tiếp không
  const [hasMore, setHasMore] = useState(true);
  // Giới hạn số lượng món ăn mỗi trang
  const limit = 10;

  // Hàm lấy danh sách món ăn từ API
  const loadDishes = useCallback(async (pageNum, isRefresh = false) => {
    try {
      const response = await dishesService.getAllDishes(pageNum, limit);
      if (response.success) {
        const newDishes = response.data.items || [];
        // Lọc bỏ các món ăn trùng lặp dựa vào _id
        setDishes((prev) => {
          const existingIds = isRefresh ? new Set() : new Set(prev.map((dish) => dish._id));
          const filteredNewDishes = newDishes.filter((dish) => !existingIds.has(dish._id));
          const updatedDishes = isRefresh ? newDishes : [...prev, ...filteredNewDishes];
          return updatedDishes;
        });
        // Cập nhật số trang và xác định còn trang nào tiếp theo không
        setPage(pageNum);
        setHasMore(pageNum < response.data.totalPages);
      } else {
        // In lỗi nếu API trả về không thành công
        console.error("Failed to load dishes:", response?.message);
        setHasMore(false);
      }
    } catch (error) {
      // In lỗi nếu có lỗi trong quá trình gọi API
      console.error("Error loading dishes:", error.message);
      setHasMore(false);
    }
  }, []);

  // useEffect chạy khi component được mount để tải dữ liệu ban đầu
  useEffect(() => {
    loadDishes(1, true).then(() => {
      setLoading((prev) => ({ ...prev, initial: false }));
    });
  }, [loadDishes]);

  // Hàm tải thêm món ăn khi cuộn xuống cuối danh sách
  const loadMoreDishes = useCallback(async () => {
    if (!hasMore || loading.more) return;
    setLoading((prev) => ({ ...prev, more: true }));
    await loadDishes(page + 1);
    setLoading((prev) => ({ ...prev, more: false }));
  }, [hasMore, loading.more, page, loadDishes]);

  // Hàm làm mới danh sách món ăn (kéo xuống để làm mới)
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    await loadDishes(1, true);
    setRefreshing(false);
  }, [loadDishes]);

  // Hàm chuyển đổi kiểu sắp xếp giữa tăng và giảm
  const toggleSort = useCallback(() => {
    setSortType((prev) => (prev === "asc" ? "desc" : "asc"));
  }, []);

  // Sử dụng useMemo để sắp xếp danh sách món ăn theo sortType
  const sortedDishes = useMemo(() => {
    const sorted = [...dishes];
    if (sortType === "asc") {
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortType === "desc") {
      return sorted.sort((a, b) => b.name.localeCompare(a.name));
    }
    return sorted;
  }, [dishes, sortType]);

  // Hàm xử lý sự kiện cuộn để tải thêm món ăn nếu cuộn tới gần cuối
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
        {/* Phần header sắp xếp */}
        <View style={styles.sortHeader}>
          <Text style={styles.headerTitle}>All Dishes</Text>
          <TouchableOpacity style={styles.sortButton} onPress={toggleSort}>
            <Text style={styles.sortText}>Sort ({sortType || "none"})</Text>
            <MaterialCommunityIcons name="sort" size={20} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Hiển thị loading khi đang tải dữ liệu lần đầu */}
        {loading.initial ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#38B2AC" />
          </View>
        ) : (
          // Danh sách món ăn
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          >
            {/* Hiển thị món ăn nếu có */}
            {sortedDishes.length > 0 ? (
              sortedDishes.map((dish, index) => (
                <DishedV1 dish={dish} key={`${dish._id}-${index}`} />
              ))
            ) : (
              // Hiển thị thông báo khi không có món ăn nào
              <Text style={styles.noResultsText}>No dishes found</Text>
            )}
            {/* Hiển thị loading khi đang tải thêm dữ liệu */}
            {loading.more && (
              <ActivityIndicator size="large" color="#38B2AC" style={styles.loadingMore} />
            )}
          </ScrollView>
        )}
      </View>
    </MainLayoutWrapper>
  );
};

// Định nghĩa các style sử dụng trong component
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

// Export component List
export default List;
