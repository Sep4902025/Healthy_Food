import React, { use, useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Switch,
  ScrollView,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; 
import MainLayoutWrapper from "../components/layout/MainLayoutWrapper";
import { favorSelector, userSelector } from "../redux/selectors/selector";
import { useDispatch, useSelector } from "react-redux";
import SafeAreaWrapper from "../components/layout/SafeAreaWrapper";
import DecorationDot from "../components/common/DecorationDot";
import NonBottomTabWrapper from "../components/layout/NonBottomTabWrapper";
import { EditHealthModal } from "../components/modal/EditHealthModal";
import { useTheme } from "../contexts/ThemeContext";
import { EditProfileModal } from "../components/modal/EditProfileModal";
import { EditMealPlanModal } from "../components/modal/EditMealPlanModal";
import { ScreensName } from "../constants/ScreensName";
import ShowToast from "../components/common/CustomToast";
import { updateUser } from "../services/authService";
import { updateUserAct } from "../redux/reducers/userReducer";
import {
  getUserPreference,
  updateUserPreference,
} from "../services/userPreference";

const WIDTH = Dimensions.get("window").width;
const HEIGHT = Dimensions.get("window").height;

function Profile({ navigation }) {
  const dispatch = useDispatch();
  const { themeMode, toggleTheme, theme } = useTheme();
  const [modalVisible, setModalVisible] = useState({
    EditHealthModal: false,
    EditProfileModal: false,
    EditMealPlanModal: false,
  });
  const [userPreference, setUserPreference] = useState({});
  const user = useSelector(userSelector);

  useEffect(() => {
    loadUserPreference();
  }, []);

  const loadUserPreference = async () => {
    const response = await getUserPreference(user?._id);

    if (response.status === 200) {
      setUserPreference(response.data?.data || {});
    } else {
      ShowToast("error", "Get user preference fail");
    }
  };

  const changeLightMode = () => {
    toggleTheme();
  };

  const handleEditHealth = async (data) => {
    const response = await updateUserPreference(data);

    if (response.status === 200) {
      ShowToast("success", "Update edit health successfull");
    } else {
      ShowToast("error", "Update edit health fail");
    }
    

    setModalVisible({
      ...modalVisible,
      EditHealthModal: false,
    });
  };

  const handleEditProfile = async (data) => {
    const response = await updateUser(data);

    if (response.status === 200) {
      ShowToast("success", "Update user profile successfull");
      dispatch(updateUserAct(response.data?.data?.user || {})); 
    } else {
      ShowToast("error", "Update user profile fail");
    }
    setModalVisible({
      ...modalVisible,
      EditProfileModal: false,
    });
  };

  const handleEditMealPlan = (data) => {
    setModalVisible({
      ...modalVisible,
      EditMealPlanModal: false,
    });
  };

  return (
    <NonBottomTabWrapper headerHidden={true}>
      
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color={theme.textColor} />
        </TouchableOpacity>
        <Text style={{ ...styles.headerTitle, color: theme.textColor }}>
          My Profile
        </Text>
      </View>

     
      <View style={styles.profileSection}>
        <Image
          source={
            user?.avatar_url
              ? { uri: user.avatar_url }
              : require("../../assets/image/Profile.png")
          }
          style={styles.profileImage}
        />
        <View style={styles.profileInfoContainer}>
          <Text style={{ ...styles.profileName, color: theme.textColor }}>
            {user?.username}
          </Text>
          <Text style={{ ...styles.profileEmail, color: theme.textColor }}>
            {user?.email}
          </Text>
          <View style={styles.editButtonContainer}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => {
                setModalVisible({
                  ...modalVisible,
                  EditProfileModal: true,
                });
              }}
            >
              <Text style={{ ...styles.editButtonText, color: "white" }}>
                Edit Profile
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      
      <View style={styles.menuContainer}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            navigation.navigate(ScreensName.favorList);
          }}
        >
          <Ionicons name="heart-outline" size={24} color={theme.textColor} />
          <Text style={{ ...styles.menuText, color: theme.textColor }}>
            Favourites
          </Text>
          <Ionicons name="chevron-forward" size={24} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            setModalVisible({
              ...modalVisible,
              EditHealthModal: true,
            });
          }}
        >
          <Ionicons name="body-outline" size={24} color={theme.textColor} />
          <Text style={{ ...styles.menuText, color: theme.textColor }}>
            Health Information
          </Text>
          <Ionicons name="chevron-forward" size={24} color="#999" />
        </TouchableOpacity>

        <View
          style={{ ...styles.separator, backgroundColor: theme.textColor }}
        />

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            setModalVisible({
              ...modalVisible,
              EditMealPlanModal: true,
            });
          }}
        >
          <Ionicons name="calendar-outline" size={24} color={theme.textColor} />
          <Text style={{ ...styles.menuText, color: theme.textColor }}>
            Meal Planning
          </Text>
          <Ionicons name="chevron-forward" size={24} color="#999" />
        </TouchableOpacity>

        <View style={styles.menuItem}>
          <Ionicons name="contrast-outline" size={24} color={theme.textColor} />
          <Text style={{ ...styles.menuText, color: theme.textColor }}>
            Dark/Light
          </Text>
          <Switch
            value={themeMode === "dark"}
            onValueChange={changeLightMode}
            trackColor={{ false: "#ccc", true: "#75a57f" }}
          />
        </View>
        <View
          style={{ ...styles.separator, backgroundColor: theme.textColor }}
        />
      </View>
      <EditHealthModal
        visible={modalVisible.EditHealthModal}
        onClose={() => {
          setModalVisible({ ...modalVisible, EditHealthModal: false });
        }}
        onSave={(data) => {
          handleEditHealth(data);
        }}
        userPreference={userPreference}
      />
      <EditMealPlanModal
        visible={modalVisible.EditMealPlanModal}
        onClose={() => {
          setModalVisible({ ...modalVisible, EditMealPlanModal: false });
        }}
        onSave={(data) => {
          handleEditMealPlan(data);
        }}
      />
      <EditProfileModal
        visible={modalVisible.EditProfileModal}
        onClose={() => {
          setModalVisible({ ...modalVisible, EditProfileModal: false });
        }}
        onSave={(data) => {
          handleEditProfile(data);
        }}
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
    alignItems: "flex-start",
  },
  profileName: {
    fontWeight: "600",
    fontSize: 18,
  },
  editButtonContainer: {
    marginTop: 12,
  },
  editButton: {
    paddingHorizontal: 4,
    paddingVertical: 4,
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
    paddingVertical: 16,
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
    marginHorizontal: 20,
  },
});

export default Profile;
