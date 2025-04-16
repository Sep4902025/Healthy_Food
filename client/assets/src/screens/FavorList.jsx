import React, { useEffect, useState, useCallback } from "react"; // Import các hook cần thiết từ React
import {
  View, // Component để tạo container
  Text, // Component để hiển thị text
  StyleSheet, // API để tạo stylesheet
  ScrollView, // Component để tạo view có thể cuộn
  ActivityIndicator, // Component hiển thị indicator đang tải
  RefreshControl, // Component để thêm chức năng kéo để làm mới
  Dimensions, // API để lấy kích thước màn hình
} from "react-native"; // Import từ thư viện React Native
import MainLayoutWrapper from "../components/layout/MainLayoutWrapper"; // Import component layout chính
import DishedFavor from "../components/common/DishedFavor"; // Import component hiển thị món ăn yêu thích
import { favorSelector } from "../redux/selectors/selector"; // Import selector để lấy dữ liệu từ Redux store
import { useSelector } from "react-redux"; // Hook để truy cập Redux store
import SpinnerLoading from "../components/common/SpinnerLoading"; // Import component hiển thị loading
import { useTheme } from "../contexts/ThemeContext"; // Import hook để sử dụng theme
import dishesService from "../services/dishService"; // Import service để gọi API món ăn

const HEIGHT = Dimensions.get("window").height; // Lấy chiều cao của màn hình

function FavorList({navigation}) { // Component FavorList nhận prop navigation
  const [favoriteItems, setFavoriteItems] = useState([]); // State lưu danh sách món ăn yêu thích
  const [dishes, setDishes] = useState([]); // State lưu tất cả món ăn
  const [loading, setLoading] = useState({ initial: true, more: false }); // State kiểm soát trạng thái loading
  const [page, setPage] = useState(1); // State lưu trang hiện tại
  const [hasMore, setHasMore] = useState(true); // State kiểm tra còn trang để tải không
  const [refreshing, setRefreshing] = useState(false); // State kiểm soát trạng thái làm mới
  const limit = 10; // Số lượng món ăn mỗi trang
  const favor = useSelector(favorSelector); // Lấy dữ liệu yêu thích từ Redux store
  const { theme } = useTheme(); // Lấy theme hiện tại

  useEffect(() => {
    loadInitialDishes(); // Tải danh sách món ăn ban đầu khi component mount
  }, []);

  const loadInitialDishes = async () => {
    setLoading((prev) => ({ ...prev, initial: true })); // Bật trạng thái loading ban đầu
    await loadDishes(1, true); // Tải món ăn trang đầu tiên
    setLoading((prev) => ({ ...prev, initial: false })); // Tắt trạng thái loading ban đầu
  };

  const loadMoreDishes = async () => {
    if (!hasMore || loading.more) return; // Kiểm tra điều kiện để tải thêm
    setLoading((prev) => ({ ...prev, more: true })); // Bật trạng thái loading thêm
    await loadDishes(page + 1); // Tải món ăn trang tiếp theo
    setLoading((prev) => ({ ...prev, more: false })); // Tắt trạng thái loading thêm
  };

  const loadDishes = async (pageNum, isRefresh = false) => {
    try {
      const response = await dishesService.getAllDishes(pageNum, limit); // Gọi API lấy danh sách món ăn
      if (response.success) {
        const newDishes = response.data.items || []; // Lấy dữ liệu món ăn từ response
        setDishes((prev) => (isRefresh ? newDishes : [...prev, ...newDishes])); // Cập nhật state dishes
        setPage(pageNum); // Cập nhật trang hiện tại
        setHasMore(pageNum < response.data.totalPages); // Kiểm tra còn trang để tải không
      } else {
        console.error("Failed to load dishes:", response?.message); // Log lỗi nếu không thành công
        setHasMore(false); // Đánh dấu không còn trang để tải
      }
    } catch (error) {
      console.error("Error loading dishes:", error.message); // Log lỗi nếu có exception
      setHasMore(false); // Đánh dấu không còn trang để tải
    }
  };

  const onRefresh = async () => {
    setRefreshing(true); // Bật trạng thái đang làm mới
    setPage(1); // Reset trang về 1
    setHasMore(true); // Reset trạng thái còn trang để tải
    await loadDishes(1, true); // Tải lại dữ liệu từ trang đầu tiên
    setRefreshing(false); // Tắt trạng thái đang làm mới
  };

  useEffect(() => {
    if (!favor?.isLoading && dishes.length > 0) {
      loadFavoriteItems(); // Tải danh sách món ăn yêu thích khi danh sách yêu thích hoặc món ăn thay đổi
    }
  }, [favor.favoriteList, dishes]);

  const isFavorite = (id) => {
    return favor.favoriteList.includes(id); // Kiểm tra món ăn có trong danh sách yêu thích không
  };

  const loadFavoriteItems = () => {
    const filteredItems = dishes.filter((item) => isFavorite(item._id)); // Lọc ra các món ăn yêu thích

    setFavoriteItems(filteredItems); // Cập nhật state món ăn yêu thích
  };

  const handleScroll = useCallback(
    ({ nativeEvent }) => {
      const { layoutMeasurement, contentOffset, contentSize } = nativeEvent; // Lấy thông tin cuộn
      const paddingToBottom = 20; // Khoảng cách đến cuối để bắt đầu tải thêm
      if (
        layoutMeasurement.height + contentOffset.y >=
        contentSize.height - paddingToBottom
      ) {
        loadMoreDishes(); // Tải thêm món ăn khi cuộn đến gần cuối
      }
    },
    [hasMore, loading.more, page] // Các dependencies của callback
  );

  return (
    <MainLayoutWrapper>
      <View style={styles.container}>
        <Text style={{ ...styles.headerTitle, color: theme.textColor }}>
          My Favorites
        </Text>
        {loading.initial ? ( // Kiểm tra đang tải ban đầu hay không
          <View style={styles.loadingContainer}>
            <SpinnerLoading />
          </View>
        ) : (
          <ScrollView // View có thể cuộn
            style={styles.scrollContainer}
            showsVerticalScrollIndicator={false} // Ẩn thanh cuộn dọc
            onScroll={handleScroll} // Xử lý sự kiện cuộn
            scrollEventThrottle={16} // Tần suất xử lý sự kiện cuộn (ms)
            refreshControl={ // Thêm chức năng kéo để làm mới
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            <View style={styles.gridContainer}>
              {favoriteItems.length === 0 ? ( // Kiểm tra có món ăn yêu thích không
                <Text style={{ color: theme.textColor }}> 
                  No favorite items found.
                </Text>
              ) : (
                favoriteItems.map((item) => ( // Hiển thị danh sách món ăn yêu thích
                  <View key={item._id} style={styles.gridItem}> 
                    <DishedFavor item={item} navigation={navigation} /> 
                  </View>
                ))
              )}
              {loading.more && ( // Hiển thị loading khi đang tải thêm
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

const styles = StyleSheet.create({ // Định nghĩa styles cho component
  container: {
    flex: 1, // Chiếm toàn bộ không gian có sẵn
    padding: 16, // Padding 16px
  },
  headerTitle: {
    fontSize: 20, // Cỡ chữ 20px
    fontWeight: "bold", // Chữ in đậm
    marginBottom: 16, // Margin dưới 16px
  },
  scrollContainer: {
    flex: 1, // Chiếm toàn bộ không gian có sẵn
  },
  gridContainer: {
    minHeight: HEIGHT * 0.8, // Chiều cao tối thiểu 80% màn hình
    flexDirection: "row", // Sắp xếp theo hàng ngang
    flexWrap: "wrap", // Cho phép xuống dòng
    justifyContent: "space-between", // Cách đều giữa các item
    paddingHorizontal: 2, // Padding ngang 2px
  },
  gridItem: {
    width: "48%", // Chiếm 48% chiều rộng (để có 2 cột)
    marginBottom: 16, // Margin dưới 16px
  },
  loadingContainer: {
    flex: 1, // Chiếm toàn bộ không gian có sẵn
    justifyContent: "center", // Căn giữa theo chiều dọc
    alignItems: "center", // Căn giữa theo chiều ngang
  },
  loadingMore: {
    marginVertical: 20, // Margin trên và dưới 20px
  },
});

export default FavorList; // Export component FavorList