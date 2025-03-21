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
import SafeAreaWrapper from "../layout/SafeAreaWrapper";
import { EditModalHeader } from "../common/EditModalHeader";
import { useTheme } from "../../contexts/ThemeContext";
const HEIGHT = Dimensions.get("window").height;
export const EditMealPlanModal = ({ visible, onClose, onSave }) => {
  const { theme } = useTheme();
  const [mealPlan, setMealPlan] = useState({
    breakfast: "",
    lunch: "",
    dinner: "",
    snacks: "",
  });

  const handleSave = () => {
    onSave(mealPlan);
    onClose();
  };

  return (
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
          Meal Planning
        </Text>
        {/* <TouchableOpacity style={styles.backButton} onPress={onClose}>
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Meal Planning</Text> */}

        <ScrollView style={styles.scrollContent}>
          <View style={styles.formGrid}>
            <View style={styles.formRow}>
              <View style={styles.formItem}>
                <Text style={{ ...styles.label, color: theme.greyTextColor }}>
                  LongOfPlan
                </Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    value={mealPlan.breakfast}
                    onChangeText={(text) =>
                      setMealPlan({ ...mealPlan, breakfast: text })
                    }
                  />
                </View>
              </View>

              <View style={styles.formItem}>
                <Text style={{ ...styles.label, color: theme.greyTextColor }}>
                  MealNumber
                </Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    value={mealPlan.lunch}
                    onChangeText={(text) =>
                      setMealPlan({ ...mealPlan, lunch: text })
                    }
                  />
                </View>
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={styles.formItem}>
                <Text style={{ ...styles.label, color: theme.greyTextColor }}>
                  Hate
                </Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    value={mealPlan.dinner}
                    onChangeText={(text) =>
                      setMealPlan({ ...mealPlan, dinner: text })
                    }
                  />
                </View>
              </View>

              <View style={styles.formItem}>
                <Text style={{ ...styles.label, color: theme.greyTextColor }}>
                  RecommendedFoods
                </Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    value={mealPlan.snacks}
                    onChangeText={(text) =>
                      setMealPlan({ ...mealPlan, snacks: text })
                    }
                  />
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 16,
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
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  formGrid: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  formItem: {
    width: "48%",
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    color: "#666",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    height: 44,
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 14,
    backgroundColor: "#fff",
    borderRadius: 8,
  },
  inputIcon: {
    marginLeft: 8,
  },
  saveButton: {
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
});
