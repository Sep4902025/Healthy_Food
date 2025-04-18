import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Dimensions,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { userSelector } from "../redux/selectors/selector";
import NonBottomTabWrapper from "../components/layout/NonBottomTabWrapper";
import { EditHealthModal } from "../components/modal/EditHealthModal";
import { useTheme } from "../contexts/ThemeContext";
import { EditProfileModal } from "../components/modal/EditProfileModal";
import { EditMealPlanModal } from "../components/modal/EditMealPlanModal";
import { ScreensName } from "../constants/ScreensName";
import ShowToast from "../components/common/CustomToast";
import { updateUser } from "../services/authService";
import { removeUser, updateUserAct } from "../redux/reducers/userReducer";
import { createUserPreference, deleteUserPreference } from "../services/userPreference";
import { useFocusEffect } from "@react-navigation/native";
import ConfirmDeleteAccountModal from "../components/modal/ConfirmDeleteAccountModal";
import { toggleVisible } from "../redux/reducers/drawerReducer";
import Ionicons from "../components/common/VectorIcons/Ionicons";
import FontAwesomeIcon from "../components/common/VectorIcons/FontAwesomeIcon";
import quizService from "../services/quizService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { requestDeleteAccount, confirmDeleteAccount } from "../services/authService";

const WIDTH = Dimensions.get("window").width;
const HEIGHT = Dimensions.get("window").height;

function Profile({ navigation }) {
  const dispatch = useDispatch();
  const { themeMode, toggleTheme, theme } = useTheme();
  const [isFetchingPreferences, setIsFetchingPreferences] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState({
    EditHealthModal: false,
    EditProfileModal: false,
    EditMealPlanModal: false,
    ConfirmDeleteModal: false,
  });
  const [userPreference, setUserPreference] = useState({});
  const [deletePhase, setDeletePhase] = useState("email");
  const user = useSelector(userSelector) || {};

  useEffect(() => {
    console.log("Profile mounted - user:", JSON.stringify(user, null, 2));
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!user?._id) {
        ShowToast("error", "Please login first");
        navigation.navigate(ScreensName.signin);
      }
    }, [user, navigation])
  );

  useEffect(() => {
    if (user?.userPreferenceId && !user?.userPreference) {
      loadUserPreference();
    } else {
      setUserPreference(user?.userPreference || {});
    }
  }, [user?.userPreferenceId, user?.userPreference]);

  const loadUserPreference = async () => {
    if (!user?._id || !user?.userPreferenceId) return;
    setIsFetchingPreferences(true);
    setError(null);

    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timeout")), 30000)
      );
      const responsePromise = quizService.getUserPreferenceByUserPreferenceId(
        user.userPreferenceId
      );
      const response = await Promise.race([responsePromise, timeoutPromise]);

      if (response?.data) {
        const preferences = response.data || {};
        setUserPreference(preferences);
        dispatch(
          updateUserAct({
            ...user,
            userPreference: {
              ...preferences,
              favorite: Array.isArray(preferences.favorite) ? preferences.favorite : [],
              hate: Array.isArray(preferences.hate) ? preferences.hate : [],
            },
          })
        );
      } else {
        throw new Error("Failed to load user preferences");
      }
    } catch (err) {
      setError(err.message || "Unable to load profile information. Please try again later.");
      ShowToast(
        "error",
        err.message || "Unable to load profile information. Please try again later."
      );
      setUserPreference({});
    } finally {
      setIsFetchingPreferences(false);
    }
  };

  const handleCreateUserPreference = async () => {
    const emptyUserPreferenceData = {
      userId: user._id,
      age: "",
      diet: "",
      eatHabit: [],
      email: user?.email || "",
      favorite: [],
      longOfPlan: "",
      mealNumber: "",
      name: user?.username || "",
      goal: "",
      sleepTime: "",
      waterDrink: "",
      currentMealplanId: "",
      previousMealplanId: "",
      hate: [],
      recommendedFoods: [],
      weight: 0,
      weightGoal: 0,
      height: 0,
      activityLevel: 0,
      gender: "",
      phoneNumber: "",
      underDisease: [],
      theme: false,
      isDelete: false,
    };
    try {
      const response = await createUserPreference(emptyUserPreferenceData);
      if (response.status === 201) {
        const newPreference = response.data || {};
        dispatch(
          updateUserAct({
            ...user,
            userPreferenceId: newPreference._id,
            userPreference: {
              ...newPreference,
              favorite: Array.isArray(newPreference.favorite) ? newPreference.favorite : [],
              hate: Array.isArray(newPreference.hate) ? newPreference.hate : [],
            },
          })
        );
        setUserPreference(newPreference);
      } else {
        ShowToast("error", "Failed to create user preferences");
      }
    } catch (err) {
      ShowToast("error", "Unable to create user preferences. Please try again.");
    }
  };

  const changeLightMode = () => {
    toggleTheme();
  };

  const handleEditHealth = async () => {
    try {
      if (!user?._id) {
        ShowToast("error", "User not found. Please log in again.");
        navigation.navigate(ScreensName.signin);
        return;
      }
      if (!user.userPreferenceId) {
        await handleCreateUserPreference(); // Create new preference instead of throwing error
        ShowToast("success", "Please complete the survey to provide more information.");
        navigation.navigate(ScreensName.home);
        return;
      }
      console.log("User before deletion:", user);

      const response = await deleteUserPreference(user.userPreferenceId);
      console.log("Delete response:", response);

      if (response.success) {
        setUserPreference({});
        const updatedUser = {
          ...user,
          userPreferenceId: null,
          userPreference: null,
        };
        console.log("Updated user:", updatedUser);
        dispatch(updateUserAct(updatedUser));
        await AsyncStorage.removeItem("quizData");
        ShowToast(
          "success",
          "User preference has been deleted. Please complete the survey to provide more information."
        );
        navigation.navigate(ScreensName.home);
      } else {
        throw new Error(response.message);
      }
    } catch (err) {
      ShowToast(
        "error",
        err.message || "Failed to delete health information. Please try again later."
      );
      console.error("handleEditHealth error:", err);
    } finally {
      setModalVisible({ ...modalVisible, EditHealthModal: false });
    }
  };

  const handleEditProfile = async (data) => {
    setIsUpdatingProfile(true);
    try {
      const response = await updateUser(data);

      if (response.status === 200) {
        ShowToast("success", "Profile updated successfully");
        dispatch(
          updateUserAct({
            ...user,
            ...response.data?.data?.user,
            userPreference: user.userPreference || response.data?.data?.user?.userPreference || {},
          })
        );
        if (user?.userPreferenceId) {
          await loadUserPreference();
        }
      } else {
        ShowToast("error", "Failed to update profile");
      }
    } catch (err) {
      ShowToast("error", "Unable to update profile. Please try again later.");
    } finally {
      setIsUpdatingProfile(false);
      setModalVisible({ ...modalVisible, EditProfileModal: false });
    }
  };

  const handleEditMealPlan = (data) => {
    setModalVisible({ ...modalVisible, EditMealPlanModal: false });
  };

  const handleRequestDeleteAccount = () => {
    setDeletePhase("email");
    setModalVisible({ ...modalVisible, ConfirmDeleteModal: true });
  };

  const handleConfirmDeleteAccount = async ({ email, otp }) => {
    setIsDeletingAccount(true);

    try {
      if (deletePhase === "email") {
        if (!email) {
          ShowToast("error", "Please enter your email");
          return;
        }

        const response = await requestDeleteAccount(email);
        if (response.success) {
          ShowToast("success", response.message);
          setDeletePhase("otp");
        } else {
          ShowToast("error", response.message);
        }
      } else if (deletePhase === "otp") {
        if (!email || !otp) {
          ShowToast("error", "Email and OTP are required");
          return;
        }

        const response = await confirmDeleteAccount(email, otp);
        if (response.success) {
          ShowToast("success", response.message);
          handleLogout();
        } else {
          ShowToast("error", response.message);
        }
      }
    } catch (err) {
      ShowToast(
        "error",
        `Unable to ${
          deletePhase === "email" ? "request" : "confirm"
        } account deletion. Please try again later.`
      );
      console.error(`handleConfirmDeleteAccount error (${deletePhase}):`, err);
    } finally {
      setIsDeletingAccount(false);
      if (deletePhase === "otp" && !modalVisible.ConfirmDeleteModal) {
        setModalVisible({ ...modalVisible, ConfirmDeleteModal: false });
      }
    }
  };

  const handleLogout = async () => {
    dispatch(removeUser());
    await AsyncStorage.removeItem("token");
    navigation.navigate(ScreensName.signin);
  };

  if (
    isFetchingPreferences &&
    Object.keys(userPreference).length === 0 &&
    !user?.userPreferenceId
  ) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#3592E7" />
        <Text style={{ marginTop: 10, color: theme.textColor }}>Loading profile...</Text>
      </View>
    );
  }

  if (error && Object.keys(userPreference).length === 0 && !user?.userPreferenceId) {
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
          <TouchableOpacity onPress={() => dispatch(toggleVisible())} style={styles.backButton}>
            <Ionicons name="reorder-three" size={24} color={theme.textColor} />
          </TouchableOpacity>
          <Text style={{ ...styles.headerTitle, color: theme.textColor }}>My Profile</Text>
        </View>

        <View style={styles.profileSection}>
          <Image
            source={
              user?.avatarUrl ? { uri: user.avatarUrl } : require("../../assets/image/Profile.png")
            }
            style={styles.profileImage}
          />
          <View style={styles.profileInfoContainer}>
            <Text style={{ ...styles.profileName, color: theme.textColor }}>
              {user?.username || "N/A"}
            </Text>
            <Text style={{ ...styles.profileEmail, color: theme.textColor }}>
              {user?.email || "N/A"}
            </Text>
            <View style={styles.editButtonContainer}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setModalVisible({ ...modalVisible, EditProfileModal: true })}
              >
                <Text style={{ ...styles.editButtonText, color: "white" }}>Edit Profile</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.menuContainer}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate(ScreensName.favorList)}
          >
            <Ionicons name="heart-outline" size={24} color={theme.textColor} />
            <Text style={{ ...styles.menuText, color: theme.textColor }}>Favorites</Text>
            <Ionicons name="chevron-forward" size={24} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setModalVisible({ ...modalVisible, EditHealthModal: true })}
          >
            <Ionicons name="body-outline" size={24} color={theme.textColor} />
            <Text style={{ ...styles.menuText, color: theme.textColor }}>Health Information</Text>
            <Ionicons name="chevron-forward" size={24} color="#999" />
          </TouchableOpacity>

          <View style={{ ...styles.separator, backgroundColor: theme.textColor }} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() =>
              navigation.navigate(ScreensName.changePassword, { type: "changePassword" })
            }
          >
            <FontAwesomeIcon name="edit" size={24} color={theme.textColor} />
            <Text style={{ ...styles.menuText, color: theme.textColor }}>Change password</Text>
            <Ionicons name="chevron-forward" size={24} color="#999" />
          </TouchableOpacity>

          <View style={styles.menuItem}>
            <Ionicons name="contrast-outline" size={24} color={theme.textColor} />
            <Text style={{ ...styles.menuText, color: theme.textColor }}>Dark/Light</Text>
            <Switch
              value={themeMode === "dark"}
              onValueChange={changeLightMode}
              trackColor={{ false: "#ccc", true: "#75a57f" }}
            />
          </View>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleRequestDeleteAccount}
            disabled={isDeletingAccount}
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
        visible={modalVisible.EditHealthModal}
        onClose={() => setModalVisible({ ...modalVisible, EditHealthModal: false })}
        onSave={handleEditHealth}
        userPreference={userPreference}
      />
      <EditMealPlanModal
        visible={modalVisible.EditMealPlanModal}
        onClose={() => setModalVisible({ ...modalVisible, EditMealPlanModal: false })}
        onSave={handleEditMealPlan}
      />
      <EditProfileModal
        visible={modalVisible.EditProfileModal}
        onClose={() => setModalVisible({ ...modalVisible, EditProfileModal: false })}
        onSave={handleEditProfile}
        userPreference={userPreference}
        readOnly={false}
      />
      <ConfirmDeleteAccountModal
        visible={modalVisible.ConfirmDeleteModal}
        onClose={() => {
          setModalVisible({ ...modalVisible, ConfirmDeleteModal: false });
          setDeletePhase("email");
        }}
        onSubmit={handleConfirmDeleteAccount}
        phase={deletePhase}
        userEmail={user?.email || ""}
      />
    </NonBottomTabWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: HEIGHT,
    backgroundColor: "#FFFFFF",
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  scrollView: {
    marginBottom: 48,
  },
  header: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingTop: "10%",
    paddingBottom: 8,
  },
  backButton: {
    position: "absolute",
    left: "5%",
    bottom: "10%",
    padding: 8,
    zIndex: 999,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    gap: 12,
  },
  profileImage: {
    width: WIDTH * 0.25,
    height: WIDTH * 0.25,
    borderRadius: WIDTH,
    backgroundColor: "#ddd",
  },
  profileInfoContainer: {
    maxWidth: "85%",
    alignItems: "flex-start",
  },
  profileName: {
    fontWeight: "600",
    fontSize: 18,
  },
  profileEmail: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  editButtonContainer: {
    marginTop: 12,
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: "#3592E7",
  },
  editButtonText: {
    fontSize: 14,
    color: "white",
  },
  menuContainer: {
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  menuText: {
    flex: 1,
    marginLeft: 16,
    fontSize: 16,
  },
  separator: {
    height: 1,
    backgroundColor: "#000000",
    marginVertical: 12,
    marginHorizontal: 20,
  },
  loadingOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  retryButton: {
    backgroundColor: "#3592E7",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "600",
  },
});

export default Profile;
