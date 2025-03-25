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
  SafeAreaView,
  StatusBar,
  Image,
  Platform,
} from "react-native";
import Ionicons from "../common/VectorIcons/Ionicons";
import { EditModalHeader } from "../common/EditModalHeader";
import { useSelector } from "react-redux";
import { userSelector } from "../../redux/selectors/selector";
import { CountryPicker } from "react-native-country-codes-picker";
import { Picker } from "@react-native-picker/picker";
import RNPickerSelect from "react-native-picker-select";
import { useTheme } from "../../contexts/ThemeContext";

const HEIGHT = Dimensions.get("window").height;
const WIDTH = Dimensions.get("window").width;
export const EditProfileModal = ({ visible, onClose, onSave }) => {
  const user = useSelector(userSelector);
  const { theme } = useTheme();
  const [showChooseCountry, setShowChooseCountry] = useState(false);
  const [profile, setProfile] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phoneNumber: user?.phoneNumber || "",
    gender: user?.gender || "",
    countryCode: "+84",
    ...user,
  });

  const handleSave = () => {
    onSave(profile);
  };

  const [showGenderPicker, setShowGenderPicker] = useState(false);

  const genderOptions = [
    { label: "Select gender", value: "" },
    { label: "Male", value: "male" },
    { label: "Female", value: "female" },
    { label: "Non-binary", value: "non-binary" },
    { label: "Prefer not to say", value: "prefer-not-to-say" },
  ];

  
  const renderGenderPickerModal = () => {
    if (Platform.OS !== "ios") return null;

    return (
      <Modal
        visible={showGenderPicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowGenderPicker(false)}
      >
        <View
          style={{
            ...styles.pickerModalContainer,
          }}
        >
          <View style={styles.pickerModalContent}>
            <View style={styles.pickerHeader}>
              <TouchableOpacity onPress={() => setShowGenderPicker(false)}>
                <Text style={styles.doneButton}>Done</Text>
              </TouchableOpacity>
            </View>
            <Picker
              selectedValue={profile.gender}
              onValueChange={(itemValue) => {
                setProfile({ ...profile, gender: itemValue });
              }}
            >
              {genderOptions.map((option) => (
                <Picker.Item
                  key={option.value}
                  label={option.label}
                  value={option.value}
                />
              ))}
            </Picker>
          </View>
        </View>
      </Modal>
    );
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

         
          <View style={styles.profileImageContainer}>
            <View style={styles.profileImageWrapper}>
              {profile?.avatar_url ? (
                <Image
                  source={{ uri: profile.avatar_url }}
                  style={styles.profileImage}
                />
              ) : (
                <View
                  style={[styles.profileImage, styles.profileImagePlaceholder]}
                />
              )}
              <View style={styles.editProfileImageButton}>
                <Ionicons name="checkmark" size={20} color="#fff" />
              </View>
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
                <TouchableOpacity
                  style={styles.countryCodeContainer}
                  
                >
                  <Text style={styles.countryCode}>{profile.countryCode}</Text>
                </TouchableOpacity>
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

              <Text style={{ ...styles.label, color: theme.greyTextColor }}>
                Gender
              </Text>
              {Platform.OS === "ios" ? (
                <TouchableOpacity
                  style={styles.genderSelector}
                  onPress={() => setShowGenderPicker(true)}
                >
                  <Text>
                    {profile.gender
                      ? genderOptions.find(
                          (opt) => opt.value === profile.gender
                        )?.label
                      : "Select gender"}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#000" />
                </TouchableOpacity>
              ) : (
                <View style={styles.genderSelector}>
                  <Picker
                    selectedValue={profile.gender}
                    onValueChange={(itemValue) =>
                      setProfile({ ...profile, gender: itemValue })
                    }
                    style={styles.androidPicker}
                  >
                    {genderOptions.map((option) => (
                      <Picker.Item
                        key={option.value}
                        label={option.label}
                        value={option.value}
                      />
                    ))}
                  </Picker>
                </View>
              )}
              
            </View>
          </ScrollView>
          {renderGenderPickerModal()}
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
        <CountryPicker
          show={showChooseCountry}
          pickerButtonOnPress={(item) => {
            setProfile({ ...profile, countryCode: item.dial_code });
            setShowChooseCountry(false);
          }}
        />
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
  genderSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 16,
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
