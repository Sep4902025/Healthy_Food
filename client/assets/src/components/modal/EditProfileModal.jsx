import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Dimensions,
  Modal,
  Image,
  Platform,
  Alert,
  StatusBar,
} from "react-native";
import Ionicons from "../common/VectorIcons/Ionicons";
import { EditModalHeader } from "../common/EditModalHeader";
import { useSelector } from "react-redux";
import { userSelector } from "../../redux/selectors/selector";
import { useTheme } from "../../contexts/ThemeContext";
import * as ImagePicker from "expo-image-picker";
import { uploadToCloudinary } from "../../services/cloundaryService";

const HEIGHT = Dimensions.get("window").height;
const WIDTH = Dimensions.get("window").width;
export const EditProfileModal = ({ visible, onClose, onSave }) => {
  const user = useSelector(userSelector);
  const { theme } = useTheme();
  const [profile, setProfile] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phoneNumber: user?.phoneNumber || "",
    gender: user?.gender || "",
    countryCode: "+84", 
    weight: user?.weight || "",
    height: user?.height || "",
    weightGoal: user?.weightGoal || "",
    avtChange: false,
    ...user,
  });

  const handleSave = async () => {
    const response = profile?.avtChange
      ? await uploadToCloudinary(profile?.avatarUrl)
      : profile.avatarUrl;
    onSave({ ...profile, avatarUrl: response });
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Sorry, we need camera roll permissions to make this work!");
      return;
    }

  
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setProfile((pre) => ({
        ...pre,
        avatarUrl: result.assets[0].uri,
        avtChange: true,
      }));
    }
  };

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        transparent={false}
        onRequestClose={onClose}
      >
        <EditModalHeader onCancel={onClose} />
        <View
          style={{
            ...styles.container,
            backgroundColor: theme.editModalbackgroundColor,
          }}
        >
          <Text style={{ ...styles.headerTitle, color: theme.textColor }}>
            Edit Profile
          </Text>

          {/* Profile Image */}
          <View style={styles.profileImageContainer}>
            <View style={styles.profileImageWrapper}>
              {profile?.avatarUrl ? (
                <Image
                  source={{ uri: profile.avatarUrl }}
                  style={styles.profileImage}
                />
              ) : (
                <View
                  style={[styles.profileImage, styles.profileImagePlaceholder]}
                />
              )}
              <TouchableOpacity
                style={styles.editProfileImageButton}
                onPress={pickImage}
              >
                <Ionicons name="pencil" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={styles.scrollContent}>
            <View style={styles.formContainer}>
              <Text style={{ ...styles.label, color: theme.greyTextColor }}>
                Full Name
              </Text>
              <TextInput
                style={styles.fullWidthInput}
                value={profile.username}
                onChangeText={(text) =>
                  setProfile({ ...profile, username: text })
                }
                placeholder="Enter full name"
              />

              <Text style={{ ...styles.label, color: theme.greyTextColor }}>
                Email
              </Text>
              <TextInput
                style={styles.fullWidthInput}
                value={profile.email}
                onChangeText={(text) => setProfile({ ...profile, email: text })}
                placeholder="Enter email"
                keyboardType="email-address"
              />

              <Text style={{ ...styles.label, color: theme.greyTextColor }}>
                Phone Number
              </Text>
              <View style={styles.phoneInputContainer}>
                <View style={styles.countryCodeContainer}>
                  <Text style={styles.countryCode}>{profile.countryCode}</Text>
                </View>
                <TextInput
                  style={styles.phoneInput}
                  value={profile.phoneNumber}
                  onChangeText={(text) =>
                    setProfile({ ...profile, phoneNumber: text })
                  }
                  placeholder="Phone number"
                  keyboardType="phone-pad"
                  editable={false}
                />
              </View>

              {/* <Text style={{ ...styles.label, color: theme.greyTextColor }}>
                Gender
              </Text>
              <TextInput
                style={styles.fullWidthInput}
                value={profile.gender}
                onChangeText={(text) =>
                  setProfile({ ...profile, gender: text })
                }
                placeholder="Enter gender"
              /> */}

              {/* New fields: Weight, Height, and WeightGoal */}
              <Text style={{ ...styles.label, color: theme.greyTextColor }}>
                Weight (kg)
              </Text>
              <TextInput
                style={styles.fullWidthInput}
                value={profile.weight}
                onChangeText={(text) =>
                  setProfile({ ...profile, weight: text })
                }
                placeholder="Enter weight in kg"
                keyboardType="numeric"
              />

              <Text style={{ ...styles.label, color: theme.greyTextColor }}>
                Height (cm)
              </Text>
              <TextInput
                style={styles.fullWidthInput}
                value={profile.height}
                onChangeText={(text) =>
                  setProfile({ ...profile, height: text })
                }
                placeholder="Enter height in cm"
                keyboardType="numeric"
              />

              <Text style={{ ...styles.label, color: theme.greyTextColor }}>
                Weight Goal (kg)
              </Text>
              <TextInput
                style={styles.fullWidthInput}
                value={profile.weightGoal}
                onChangeText={(text) =>
                  setProfile({ ...profile, weightGoal: text })
                }
                placeholder="Enter weight goal in kg"
                keyboardType="numeric"
              />
            </View>
          </ScrollView>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
  },
  header: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 10,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f2f2f2",
  },
  backButton: {
    position: "absolute",
    left: 16,
    padding: 8,
    zIndex: 999,
    bottom: "10%",
  },
  headerTitle: {
    fontSize: 25,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 16,
  },
  scrollContent: {
    flex: 1,
    width: WIDTH,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    color: "#666",
  },
  saveButton: {
    width: WIDTH * 0.92,
    backgroundColor: "#40B491",
    borderRadius: 100,
    paddingVertical: 12,
    alignItems: "center",
    marginHorizontal: 16,
    marginVertical: 16,
    marginBottom: HEIGHT * 0.05,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  formContainer: {
    marginBottom: 16,
  },
  fullWidthInput: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 16,
    fontSize: 14,
    backgroundColor: "white",
  },
  phoneInputContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  countryCodeContainer: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    justifyContent: "center",
    marginRight: 8,
    width: 70,
    backgroundColor: "white",
  },
  countryCode: {
    fontSize: 14,
  },
  phoneInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 14,
    backgroundColor: "white",
  },
  profileImageContainer: {
    position: "absolute",
    top: -HEIGHT * 0.15,
    alignItems: "center",
    paddingVertical: 20,
  },
  profileImageWrapper: {
    position: "relative",
    width: 100,
    height: 100,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileImagePlaceholder: {
    backgroundColor: "#e0e0e0",
  },
  editProfileImageButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#3592E7",
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
});
