import React, { useEffect, useState, useCallback } from "react"; // Import các hook cần thiết từ React
import {
  View, // Component để tạo container
  Text, // Component để hiển thị text
  ScrollView, // Component để tạo view có thể cuộn
  TouchableOpacity, // Component để tạo vùng có thể nhấn
  StyleSheet, // API để tạo stylesheet
  Dimensions, // API để lấy kích thước màn hình
  RefreshControl, // Component để thêm chức năng kéo để làm mới
  ActivityIndicator, // Component hiển thị indicator đang tải
  PixelRatio, // API để làm việc với mật độ điểm ảnh
} from "react-native"; // Import từ thư viện React Native
import MainLayoutWrapper from "../components/layout/MainLayoutWrapper"; // Import component layout chính
import SearchBar from "../components/common/SearchBar"; // Import component thanh tìm kiếm
import { ScreensName } from "../constants/ScreensName"; // Import các tên màn hình
import DishedV1 from "../components/common/DishedV1"; // Import component hiển thị món ăn
import CategoryCard from "../components/common/CategoryCard"; // Import component hiển thị danh mục
import useCurrentSeason from "../hooks/useCurrentSeason"; // Import hook lấy mùa hiện tại
import { DishType } from "../constants/DishType"; // Import các loại món ăn
import { useDispatch, useSelector } from "react-redux"; // Import hooks từ Redux
import { loadFavorites } from "../redux/actions/favoriteThunk"; // Import action thunk để tải danh sách yêu thích
import { favorSelector, userSelector } from "../redux/selectors/selector"; // Import selectors từ Redux
import SpinnerLoading from "../components/common/SpinnerLoading"; // Import component hiển thị loading
import HomeService from "../services/HomeService"; // Import service xử lý dữ liệu trang chủ
import { normalize } from "../utils/common"; // Import hàm chuẩn hóa kích thước

function Home({ navigation }) { // Component Home nhận prop navigation
  const [seasonalDishes, setSeasonalDishes] = useState([]); // State lưu danh sách món ăn theo mùa
  const [searchQuery, setSearchQuery] = useState(""); // State lưu từ khóa tìm kiếm
  const [refreshing, setRefreshing] = useState(false); // State kiểm soát trạng thái làm mới
  const [loading, setLoading] = useState({ initial: true, more: false }); // State kiểm soát trạng thái loading
  const [page, setPage] = useState(1); // State lưu trang hiện tại
  const [hasMore, setHasMore] = useState(true); // State kiểm tra còn trang để tải không
  const limit = 10; // Số lượng món ăn mỗi trang

  const favor = useSelector(favorSelector); // Lấy dữ liệu yêu thích từ Redux store
  const user = useSelector(userSelector); // Lấy dữ liệu người dùng từ Redux store

  const dispatch = useDispatch(); // Hook để dispatch action
  const season = useCurrentSeason(); // Hook lấy mùa hiện tại

  useEffect(() => {
    const validSeasons = ["Spring", "Summer", "Fall", "Winter"]; // Mảng các mùa hợp lệ
    if (validSeasons.includes(season)) { // Kiểm tra mùa hiện tại có hợp lệ không
      loadInitialDishes(); // Tải danh sách món ăn ban đầu
    }
  }, [season]); // Chạy lại khi mùa thay đổi

  useEffect(() => {
    loadFavoritesData(); // Tải danh sách món ăn yêu thích
  }, [dispatch, user]); // Chạy lại khi dispatch hoặc user thay đổi

  const loadFavoritesData = async () => {
    if (user?._id) { // Kiểm tra người dùng đã đăng nhập chưa
      dispatch(loadFavorites(user._id)); // Dispatch action tải danh sách yêu thích
    }
  };

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
      if (!season) return; // Kiểm tra có mùa không

      const response = await HomeService.getDishBySeason(
        season, // Tham số mùa
        pageNum, // Tham số trang
        limit // Tham số giới hạn số lượng
      );
      console.log(response); // Log response để debug

      if (response?.success) { // Kiểm tra API call thành công
        const newDishes = response.data.items; // Lấy danh sách món ăn từ response

        setSeasonalDishes((prev) =>
          isRefresh ? newDishes : [...prev, ...newDishes] // Cập nhật state món ăn theo mùa
        );

        setPage(pageNum); // Cập nhật trang hiện tại
        setHasMore(pageNum < response.data.totalPages); // Kiểm tra còn trang để tải không
      } else {
        console.error("Failed to load dishes:", response); // Log lỗi nếu không thành công
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
    await loadFavoritesData(); // Tải lại danh sách món ăn yêu thích
    setRefreshing(false); // Tắt trạng thái đang làm mới
  };

  const handleSearch = (searchString) => {
    navigation.navigate(ScreensName.search, { searchQuery: searchString }); // Chuyển đến màn hình tìm kiếm với từ khóa
  };

  const handleClear = () => {
    setSearchQuery(""); // Xóa từ khóa tìm kiếm
  };

  const handleViewAll = () => {
    navigation.navigate(ScreensName.list); // Chuyển đến màn hình danh sách tất cả món ăn
  };

  const handleScroll = useCallback(
    ({ nativeEvent }) => {
      const { layoutMeasurement, contentOffset, contentSize } = nativeEvent; // Lấy thông tin cuộn
      const paddingToBottom = normalize(20); // Khoảng cách đến cuối để bắt đầu tải thêm
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
      <ScrollView // View có thể cuộn
        style={styles.container}
        showsVerticalScrollIndicator={false} // Ẩn thanh cuộn dọc
        onScroll={handleScroll} // Xử lý sự kiện cuộn
        scrollEventThrottle={16} // Tần suất xử lý sự kiện cuộn (ms)
        refreshControl={ // Thêm chức năng kéo để làm mới
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <SearchBar // Component thanh tìm kiếm
          placeholder="What do you need?"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmit={() => handleSearch(searchQuery)}
          onClear={handleClear}
        />

        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Browse by category</Text>
          <View style={styles.categoriesGrid}>
            {Object.values(DishType).map((category, key) => ( // Lặp qua các loại món ăn
              <CategoryCard // Component hiển thị danh mục
                key={key}
                category={{ id: key, ...category }} // Dữ liệu danh mục
                onPress={() =>
                  navigation.navigate(ScreensName.search, { category }) // Chuyển đến màn hình tìm kiếm với danh mục
                }
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

          {loading.initial ? ( // Kiểm tra đang tải ban đầu hay không
            <SpinnerLoading /> // Component hiển thị loading
          ) : seasonalDishes.filter((item) =>
              item?.season?.toLowerCase()?.includes(season?.toLowerCase()) // Lọc món ăn phù hợp với mùa hiện tại
            ).length > 0 ? (
            seasonalDishes
              .filter((item) =>
                item?.season?.toLowerCase()?.includes(season?.toLowerCase()) // Lọc món ăn phù hợp với mùa hiện tại
              )
              .map((dish, index) => ( // Hiển thị từng món ăn
                <DishedV1 // Component hiển thị món ăn
                  dish={dish}
                  key={dish._id + index}
                  onPress={() =>
                    navigation.navigate(ScreensName.favorAndSuggest, { dish }) // Chuyển đến màn hình chi tiết món ăn
                  }
                />
              ))
          ) : (
            <Text style={styles.noResultsText}>No seasonal dishes found</Text> // Thông báo không có món ăn
          )}

          {loading.more && ( // Hiển thị loading khi đang tải thêm
            <ActivityIndicator
              size="large"
              color="#38B2AC"
              style={styles.loadingMore}
            />
          )}
        </View>
      </ScrollView>
    </MainLayoutWrapper>
  );
}

const styles = StyleSheet.create({ // Định nghĩa styles cho component
  container: {
    flex: 1, // Chiếm toàn bộ không gian có sẵn
    paddingHorizontal: normalize(16), // Padding ngang 16 đã được chuẩn hóa
  },
  categoriesSection: {
    marginTop: normalize(16), // Margin trên 16 đã được chuẩn hóa
  },
  sectionTitle: {
    fontSize: normalize(16), // Cỡ chữ 16 đã được chuẩn hóa
    color: "#38B2AC", // Màu chữ teal
    fontWeight: "500", // Độ đậm chữ
    marginBottom: normalize(16), // Margin dưới 16 đã được chuẩn hóa
  },
  categoriesGrid: {
    flexDirection: "row", // Sắp xếp theo hàng ngang
    flexWrap: "wrap", // Cho phép xuống dòng
    justifyContent: "space-between", // Cách đều giữa các item
    marginTop: normalize(40), // Margin trên 40 đã được chuẩn hóa
  },
  categoryCard: {
    marginBottom: normalize(24), // Margin dưới 24 đã được chuẩn hóa
  },
  seasonalSection: {
    marginVertical: normalize(16), // Margin trên và dưới 16 đã được chuẩn hóa
  },
  sectionHeader: {
    flexDirection: "row", // Sắp xếp theo hàng ngang
    justifyContent: "space-between", // Cách đều giữa các phần tử
    marginBottom: normalize(16), // Margin dưới 16 đã được chuẩn hóa
  },
  viewAllText: {
    color: "#38B2AC", // Màu chữ teal
    fontSize: normalize(14), // Cỡ chữ 14 đã được chuẩn hóa
  },
  noResultsText: {
    fontSize: normalize(16), // Cỡ chữ 16 đã được chuẩn hóa
    textAlign: "center", // Căn giữa text
    padding: normalize(20), // Padding 20 đã được chuẩn hóa
  },
  loadingMore: {
    marginVertical: normalize(20), // Margin trên và dưới 20 đã được chuẩn hóa
  },
});

export default Home; // Export component Home