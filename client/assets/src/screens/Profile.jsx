import React, { useEffect, useState } from "react"; // Import các hook cơ bản của React
import {
  View, // Component để tạo container
  Text, // Component để hiển thị text
  Image, // Component để hiển thị hình ảnh
  TouchableOpacity, // Component để tạo button có thể nhấn
  StyleSheet, // API để định nghĩa styles
  Switch, // Component công tắc
  Dimensions, // API để lấy kích thước màn hình
  ActivityIndicator, // Component hiển thị loading
  ScrollView, // Component cho phép cuộn
} from "react-native"; // Framework để phát triển ứng dụng di động
import { useDispatch, useSelector } from "react-redux"; // Hook để tương tác với Redux store
import { userSelector } from "../redux/selectors/selector"; // Selector để lấy thông tin user từ Redux
import NonBottomTabWrapper from "../components/layout/NonBottomTabWrapper"; // Component wrapper cho màn hình không có bottom tab
import { EditHealthModal } from "../components/modal/EditHealthModal"; // Modal chỉnh sửa thông tin sức khỏe
import { useTheme } from "../contexts/ThemeContext"; // Hook để sử dụng theme
import { EditProfileModal } from "../components/modal/EditProfileModal"; // Modal chỉnh sửa profile
import { EditMealPlanModal } from "../components/modal/EditMealPlanModal"; // Modal chỉnh sửa kế hoạch ăn uống
import { ScreensName } from "../constants/ScreensName"; // Constant chứa tên các màn hình
import ShowToast from "../components/common/CustomToast"; // Component để hiển thị thông báo
import { deleteUser, updateUser } from "../services/authService"; // Service để xóa và cập nhật thông tin user
import { removeUser, updateUserAct } from "../redux/reducers/userReducer"; // Action để xóa và cập nhật user trong Redux
import { createUserPreference, resetUserPreference } from "../services/userPreference"; // Service để tạo và reset preference
import { useFocusEffect } from "@react-navigation/native"; // Hook để thực hiện hành động khi màn hình được focus
import ConfirmDeleteAccountModal from "../components/modal/ConfirmDeleteAccountModal"; // Modal xác nhận xóa tài khoản
import { toggleVisible } from "../redux/reducers/drawerReducer"; // Action để toggle drawer
import Ionicons from "../components/common/VectorIcons/Ionicons"; // Component icon từ Ionicons
import FontAwesomeIcon from "../components/common/VectorIcons/FontAwesomeIcon"; // Component icon từ FontAwesome
import quizService from "../services/quizService"; // Service để lấy thông tin từ quiz

const WIDTH = Dimensions.get("window").width; // Lấy chiều rộng màn hình
const HEIGHT = Dimensions.get("window").height; // Lấy chiều cao màn hình

function Profile({ navigation }) {
  const dispatch = useDispatch(); // Hook để dispatch action đến Redux
  const { themeMode, toggleTheme, theme } = useTheme(); // Lấy thông tin và functions từ theme context
  const [isFetchingPreferences, setIsFetchingPreferences] = useState(false); // State kiểm tra đang fetching preferences
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false); // State kiểm tra đang cập nhật profile
  const [isDeletingAccount, setIsDeletingAccount] = useState(false); // State kiểm tra đang xóa tài khoản
  const [error, setError] = useState(null); // State lưu trữ thông báo lỗi
  const [modalVisible, setModalVisible] = useState({
    EditHealthModal: false, // State hiển thị modal sức khỏe
    EditProfileModal: false, // State hiển thị modal profile
    EditMealPlanModal: false, // State hiển thị modal kế hoạch ăn uống
    ConfirmDeleteModal: false, // State hiển thị modal xác nhận xóa
  });
  const [userPreference, setUserPreference] = useState({}); // State lưu trữ thông tin preference của user
  const user = useSelector(userSelector); // Lấy thông tin user từ Redux store

  useFocusEffect(
    React.useCallback(() => {
      if (!user) {
        ShowToast("error", "Please login first"); // Hiển thị thông báo lỗi nếu không có user
        navigation.navigate(ScreensName.signin); // Chuyển đến màn hình đăng nhập
      }
    }, [user])
  );

  useEffect(() => {
    if (user?.userPreferenceId) {
      loadUserPreference(); // Gọi hàm load preference khi có userPreferenceId
    }
  }, [user?.userPreferenceId]);

  const loadUserPreference = async () => {
    if (!user) return; // Nếu không có user thì return
    setIsFetchingPreferences(true); // Đánh dấu đang fetching
    setError(null); // Reset lỗi

    try {
      if (!user?.userPreferenceId) {
        await handleCreateUserPreference(); // Nếu không có userPreferenceId thì tạo mới
        return;
      }

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timeout")), 30000) // Tạo promise timeout sau 30s
      );
      const responsePromise = quizService.getUserPreferenceByUserPreferenceId(
        user?.userPreferenceId // Gọi API lấy preference theo ID
      );
      const response = await Promise.race([responsePromise, timeoutPromise]); // Race promise để xử lý timeout

      if (response?.data) {
        setUserPreference(response.data || {}); // Set preference nếu có data
      } else {
        throw new Error("Failed to load user preferences"); // Throw error nếu không có data
      }
    } catch (err) {
      setError(err.message || "Unable to load profile information. Please try again later."); // Set thông báo lỗi
      ShowToast(
        "error",
        err.message || "Unable to load profile information. Please try again later." // Hiển thị thông báo lỗi
      );
      setUserPreference({}); // Reset preference
    } finally {
      setIsFetchingPreferences(false); // Đánh dấu đã fetch xong
    }
  };

  const handleCreateUserPreference = async () => {
    const emptyUserPreferenceData = {
      userId: user._id, // ID của user
      age: "", // Tuổi (trống)
      diet: "", // Chế độ ăn (trống)
      eatHabit: [], // Thói quen ăn (mảng rỗng)
      email: user?.email, // Email từ thông tin user
      favorite: [], // Món ăn yêu thích (mảng rỗng)
      longOfPlan: "", // Độ dài kế hoạch (trống)
      mealNumber: "", // Số bữa ăn (trống)
      name: user.username, // Tên từ thông tin user
      goal: "", // Mục tiêu (trống)
      sleepTime: "", // Thời gian ngủ (trống)
      waterDrink: "", // Lượng nước uống (trống)
      currentMealplanId: "", // ID kế hoạch hiện tại (trống)
      previousMealplanId: "", // ID kế hoạch trước đó (trống)
      hate: [], // Món ăn ghét (mảng rỗng)
      recommendedFoods: [], // Món ăn được đề xuất (mảng rỗng)
      weight: 0, // Cân nặng (0)
      weightGoal: 0, // Mục tiêu cân nặng (0)
      height: 0, // Chiều cao (0)
      activityLevel: 0, // Mức độ hoạt động (0)
      gender: "", // Giới tính (trống)
      phoneNumber: "", // Số điện thoại (trống)
      underDisease: [], // Bệnh (mảng rỗng)
      theme: false, // Theme (false)
      isDelete: false, // Trạng thái xóa (false)
    };
    try {
      const response = await createUserPreference(emptyUserPreferenceData); // Gọi API tạo preference
      if (response.status === 201) {
        dispatch(updateUserAct({ ...user, userPreferenceId: response.data._id })); // Cập nhật user với preference ID mới
        await loadUserPreference(); // Load lại preference
      } else {
        ShowToast("error", "Failed to create user preferences"); // Hiển thị thông báo lỗi
      }
    } catch (err) {
      ShowToast("error", "Unable to create user preferences. Please try again."); // Hiển thị thông báo lỗi
    }
  };

  const changeLightMode = () => {
    toggleTheme(); // Gọi hàm toggle theme từ context
  };

  const handleEditHealth = async (data) => {
    try {
      const response = await resetUserPreference(user?.userPreferenceId); // Gọi API reset preference

      if (response.status === 200) {
        ShowToast("success", "Health information reset successfully"); // Hiển thị thông báo thành công
        await loadUserPreference(); // Load lại preference
        navigation.navigate(ScreensName.survey); // Chuyển đến màn hình khảo sát
      } else {
        ShowToast("error", "Failed to reset health information"); // Hiển thị thông báo lỗi
      }
    } catch (err) {
      ShowToast("error", "Unable to reset health information. Please try again later."); // Hiển thị thông báo lỗi
    } finally {
      setModalVisible({
        ...modalVisible,
        EditHealthModal: false, // Đóng modal
      });
    }
  };

  const handleEditProfile = async (data) => {
    setIsUpdatingProfile(true); // Đánh dấu đang cập nhật profile
    try {
      const response = await updateUser(data); // Gọi API cập nhật user

      if (response.status === 200) {
        ShowToast("success", "Profile updated successfully"); // Hiển thị thông báo thành công
        dispatch(updateUserAct(response.data?.data?.user || {})); // Cập nhật user trong Redux
      } else {
        ShowToast("error", "Failed to update profile"); // Hiển thị thông báo lỗi
      }
    } catch (err) {
      ShowToast("error", "Unable to update profile. Please try again later."); // Hiển thị thông báo lỗi
    } finally {
      setIsUpdatingProfile(false); // Đánh dấu đã cập nhật xong
      setModalVisible({
        ...modalVisible,
        EditProfileModal: false, // Đóng modal
      });
    }
  };

  const handleEditMealPlan = (data) => {
    setModalVisible({
      ...modalVisible,
      EditMealPlanModal: false, // Đóng modal
    });
  };

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true); // Đánh dấu đang xóa tài khoản
    try {
      const response = await deleteUser(user?._id); // Gọi API xóa user

      if (response.status === 200) {
        ShowToast("success", "Account deleted successfully"); // Hiển thị thông báo thành công
        handleLogout(); // Đăng xuất
      } else {
        const message = response?.response?.data?.message || "Something went wrong"; // Lấy thông báo lỗi
        ShowToast("error", message); // Hiển thị thông báo lỗi
      }
    } catch (err) {
      ShowToast("error", "Unable to delete account. Please try again later."); // Hiển thị thông báo lỗi
    } finally {
      setIsDeletingAccount(false); // Đánh dấu đã xóa xong
      setModalVisible({
        ...modalVisible,
        ConfirmDeleteModal: false, // Đóng modal
      });
    }
  };

  const handleLogout = async () => {
    dispatch(removeUser()); // Xóa user khỏi Redux
    navigation.navigate(ScreensName.signin); // Chuyển đến màn hình đăng nhập
  };

  if (
    isFetchingPreferences &&
    Object.keys(userPreference).length === 0 &&
    !user?.userPreferenceId
  ) {
    // Hiển thị loading nếu đang fetch và chưa có dữ liệu
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#3592E7" />
        <Text style={{ marginTop: 10, color: theme.textColor }}>Loading profile...</Text>
      </View>
    );
  }

  if (error && Object.keys(userPreference).length === 0 && !user?.userPreferenceId) {
    // Hiển thị lỗi và nút thử lại nếu có lỗi
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={{ color: "red", textAlign: "center", marginBottom: 20 }}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadUserPreference}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <NonBottomTabWrapper headerHidden={true}>
      <ScrollView contentContainerStyle={{ paddingBottom: 48 }} style={styles.scrollView}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              dispatch(toggleVisible()); // Toggle drawer
            }}
            style={styles.backButton}
          >
            <Ionicons name="reorder-three" size={24} color={theme.textColor} />
          </TouchableOpacity>
          <Text style={{ ...styles.headerTitle, color: theme.textColor }}>My Profile</Text>
        </View>

        <View style={styles.profileSection}>
          <Image
            source={
              user?.avatarUrl ? { uri: user.avatarUrl } : require("../../assets/image/Profile.png") // Hiển thị avatar hoặc ảnh mặc định
            }
            style={styles.profileImage}
          />
          <View style={styles.profileInfoContainer}>
            <Text style={{ ...styles.profileName, color: theme.textColor }}>{user?.username}</Text>
            <Text style={{ ...styles.profileEmail, color: theme.textColor }}>{user?.email}</Text>
            <View style={styles.editButtonContainer}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => {
                  setModalVisible({
                    ...modalVisible,
                    EditProfileModal: true, // Mở modal chỉnh sửa profile
                  });
                }}
              >
                <Text style={{ ...styles.editButtonText, color: "white" }}>Edit Profile</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.menuContainer}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              navigation.navigate(ScreensName.favorList); // Chuyển đến màn hình danh sách yêu thích
            }}
          >
            <Ionicons name="heart-outline" size={24} color={theme.textColor} />
            <Text style={{ ...styles.menuText, color: theme.textColor }}>Favorites</Text>
            <Ionicons name="chevron-forward" size={24} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setModalVisible({
                ...modalVisible,
                EditHealthModal: true, // Mở modal chỉnh sửa thông tin sức khỏe
              });
            }}
          >
            <Ionicons name="body-outline" size={24} color={theme.textColor} />
            <Text style={{ ...styles.menuText, color: theme.textColor }}>Health Information</Text>
            <Ionicons name="chevron-forward" size={24} color="#999" />
          </TouchableOpacity>

          <View style={{ ...styles.separator, backgroundColor: theme.textColor }} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              navigation.navigate(ScreensName.changePassword, {
                type: "changePassword", // Chuyển đến màn hình đổi mật khẩu
              });
            }}
          >
            <FontAwesomeIcon name="edit" size={24} color={theme.textColor} />
            <Text style={{ ...styles.menuText, color: theme.textColor }}>Change password</Text>
            <Ionicons name="chevron-forward" size={24} color="#999" />
          </TouchableOpacity>

          <View style={styles.menuItem}>
            <Ionicons name="contrast-outline" size={24} color={theme.textColor} />
            <Text style={{ ...styles.menuText, color: theme.textColor }}>Dark/Light</Text>
            <Switch
              value={themeMode === "dark"} // Kiểm tra nếu theme là dark
              onValueChange={changeLightMode} // Gọi hàm thay đổi theme
              trackColor={{ false: "#ccc", true: "#75a57f" }}
            />
          </View>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setModalVisible({
                ...modalVisible,
                ConfirmDeleteModal: true, // Mở modal xác nhận xóa tài khoản
              });
            }}
          >
            <Ionicons name="trash-bin-outline" size={24} color={theme.textColor} />
            <Text style={{ ...styles.menuText, color: theme.textColor }}>Delete Account</Text>
            <Text style={{ color: theme.textColor }}>YES</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color={theme.textColor} />
            <Text style={{ ...styles.menuText, color: theme.textColor }}>Logout</Text>
            <Text style={{ color: theme.textColor }}>YES</Text>
          </TouchableOpacity>

          <View style={{ ...styles.separator, backgroundColor: theme.textColor }} />
        </View>
      </ScrollView>

      {(isFetchingPreferences || isUpdatingProfile || isDeletingAccount) && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#3592E7" />
        </View>
      )}

      <EditHealthModal
        visible={modalVisible.EditHealthModal} // Hiển thị modal sức khỏe nếu state là true
        onClose={() => {
          setModalVisible({ ...modalVisible, EditHealthModal: false }); // Đóng modal
        }}
        onSave={(data) => {
          handleEditHealth(data); // Gọi hàm xử lý khi lưu
        }}
        userPreference={userPreference} // Truyền dữ liệu preference
      />
      <EditMealPlanModal
        visible={modalVisible.EditMealPlanModal} // Hiển thị modal kế hoạch ăn uống nếu state là true
        onClose={() => {
          setModalVisible({ ...modalVisible, EditMealPlanModal: false }); // Đóng modal
        }}
        onSave={(data) => {
          handleEditMealPlan(data); // Gọi hàm xử lý khi lưu
        }}
      />
      <EditProfileModal
        visible={modalVisible.EditProfileModal} // Hiển thị modal profile nếu state là true
        onClose={() => {
          setModalVisible({ ...modalVisible, EditProfileModal: false }); // Đóng modal
        }}
        onSave={(data) => {
          handleEditProfile(data); // Gọi hàm xử lý khi lưu
        }}
        readOnly={false} // Cho phép chỉnh sửa
      />
      <ConfirmDeleteAccountModal
        visible={modalVisible.ConfirmDeleteModal} // Hiển thị modal xác nhận xóa nếu state là true
        onClose={() => {
          setModalVisible({ ...modalVisible, ConfirmDeleteModal: false }); // Đóng modal
        }}
        onSubmit={handleDeleteAccount} // Gọi hàm xử lý khi xác nhận
      />
    </NonBottomTabWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, // Chiếm toàn bộ không gian có sẵn
    minHeight: HEIGHT, // Chiều cao tối thiểu bằng chiều cao màn hình
    backgroundColor: "#FFFFFF", // Màu nền trắng
  },
  centerContent: {
    justifyContent: "center", // Canh giữa theo chiều dọc
    alignItems: "center", // Canh giữa theo chiều ngang
    padding: 20, // Padding 20px
  },
  scrollView: {
    marginBottom: 48, // Margin dưới 48px
  },
  header: {
    position: "relative", // Vị trí tương đối
    flexDirection: "row", // Sắp xếp theo hàng ngang
    alignItems: "center", // Canh giữa theo chiều ngang
    justifyContent: "center", // Canh giữa theo chiều dọc
    paddingHorizontal: 16, // Padding ngang 16px
    paddingTop: "10%", // Padding trên 10%
    paddingBottom: 8, // Padding dưới 8px
  },
  backButton: {
    position: "absolute", // Vị trí tuyệt đối
    left: "5%", // Cách trái 5%
    bottom: "10%", // Cách dưới 10%
    padding: 8, // Padding 8px
    zIndex: 999, // Z-index cao để hiển thị trên cùng
  },
  headerTitle: {
    fontSize: 18, // Kích thước font 18px
    fontWeight: "600", // Độ đậm font 600
  },
  profileSection: {
    flexDirection: "row", // Sắp xếp theo hàng ngang
    alignItems: "center", // Canh giữa theo chiều ngang
    justifyContent: "center", // Canh giữa theo chiều dọc
    paddingVertical: 20, // Padding dọc 20px
    gap: 12, // Khoảng cách giữa các phần tử 12px
  },
  profileImage: {
    width: WIDTH * 0.25, // Chiều rộng bằng 25% chiều rộng màn hình
    height: WIDTH * 0.25, // Chiều cao bằng 25% chiều rộng màn hình
    borderRadius: WIDTH, // Bo tròn
    backgroundColor: "#ddd", // Màu nền xám
  },
  profileInfoContainer: {
    maxWidth: "85%", // Chiều rộng tối đa 85%
    alignItems: "flex-start", // Canh trái
  },
  profileName: {
    fontWeight: "600", // Độ đậm font 600
    fontSize: 18, // Kích thước font 18px
  },
  profileEmail: {
    fontSize: 14, // Kích thước font 14px
    color: "#666", // Màu chữ xám
    marginTop: 4, // Margin trên 4px
  },
  editButtonContainer: {
    marginTop: 12, // Margin trên 12px
  },
  editButton: {
    paddingHorizontal: 12, // Padding ngang 12px
    paddingVertical: 6, // Padding dọc 6px
    borderRadius: 4, // Bo tròn 4px
    backgroundColor: "#3592E7", // Màu nền xanh
  },
  editButtonText: {
    fontSize: 14, // Kích thước font 14px
    color: "white", // Màu chữ trắng
  },
  menuContainer: {
    borderRadius: 12, // Bo tròn 12px
    marginHorizontal: 16, // Margin ngang 16px
    marginTop: 16, // Margin trên 16px
    paddingVertical: 8, // Padding dọc 8px
  },
  menuItem: {
    flexDirection: "row", // Sắp xếp theo hàng ngang
    alignItems: "center", // Canh giữa theo chiều ngang
    paddingVertical: 12, // Padding dọc 12px
    paddingHorizontal: 20, // Padding ngang 20px
  },
  menuText: {
    flex: 1, // Chiếm toàn bộ không gian còn lại
    marginLeft: 16, // Margin trái 16px
    fontSize: 16, // Kích thước font 16px
  },
  separator: {
    height: 1, // Chiều cao 1px
    backgroundColor: "#000000", // Màu nền đen
    marginVertical: 12, // Margin dọc 12px
    marginHorizontal: 20, // Margin ngang 20px
  },
  loadingOverlay: {
    position: "absolute", // Vị trí tuyệt đối
    left: 0, // Cách trái 0px
    right: 0, // Cách phải 0px
    top: 0, // Cách trên 0px
    bottom: 0, // Cách dưới 0px
    alignItems: "center", // Canh giữa theo chiều ngang
    justifyContent: "center", // Canh giữa theo chiều dọc
    backgroundColor: "rgba(0, 0, 0, 0.3)", // Màu nền đen với độ trong suốt
  },
  retryButton: {
    backgroundColor: "#3592E7", // Màu nền xanh
    paddingHorizontal: 20, // Padding ngang 20px
    paddingVertical: 10, // Padding dọc 10px
    borderRadius: 5, // Bo tròn 5px
  },
  retryButtonText: {
    color: "white", // Màu chữ trắng
    fontWeight: "600", // Độ đậm font 600
  },
});

export default Profile; // Export component Profile