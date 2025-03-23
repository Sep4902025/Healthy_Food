import React, { use, useEffect, useState } from "react";
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
import { useTheme } from "../../contexts/ThemeContext";
const HEIGHT = Dimensions.get("window").height;
export const EditHealthModal = ({
  visible,
  onClose,
  onSave,
  userPreference,
}) => {
  const { theme } = useTheme();
  const [healthData, setHealthData] = useState({
    ...userPreference,
  });

  useEffect(() => {
    setHealthData(userPreference);
  }, [userPreference]);

  const handleSave = () => {
    onSave(healthData);
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
        {/* Header */}
        <Text style={{ ...styles.headerTitle, color: theme.textColor }}>
          Health Information
        </Text>
        <ScrollView style={styles.scrollContent}>
          <View style={styles.formGrid}>
            <View style={styles.formRow}>
              <View style={styles.formItem}>
                <Text style={{ ...styles.label, color: theme.greyTextColor }}>
                  Weight
                </Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    value={String(healthData.weight)}
                    onChangeText={(text) =>
                      setHealthData({ ...healthData, weight: text })
                    }
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>

              <View style={styles.formItem}>
                <Text style={{ ...styles.label, color: theme.greyTextColor }}>
                  Diet
                </Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    value={healthData.diet}
                    onChangeText={(text) =>
                      setHealthData({ ...healthData, diet: text })
                    }
                  />
                </View>
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={styles.formItem}>
                <Text style={{ ...styles.label, color: theme.greyTextColor }}>
                  Height
                </Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    value={String(healthData.height)}
                    onChangeText={(text) =>
                      setHealthData({ ...healthData, height: text })
                    }
                  />
                </View>
              </View>

              <View style={styles.formItem}>
                <Text style={{ ...styles.label, color: theme.greyTextColor }}>
                  UnderDisease (disable)
                </Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    value={healthData.underDisease
                      ?.map((item) => item)
                      .join(", ")}
                    onChangeText={(text) =>
                      setHealthData({ ...healthData, underDisease: text })
                    }
                    editable={false}
                  />
                </View>
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={styles.formItem}>
                <Text style={{ ...styles.label, color: theme.greyTextColor }}>
                  BMI (Not updated yet)
                </Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    value={healthData.bmi}
                    onChangeText={(text) =>
                      setHealthData({ ...healthData, bmi: text })
                    }
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>

              <View style={styles.formItem}>
                <Text style={{ ...styles.label, color: theme.greyTextColor }}>
                  WaterDrink
                </Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    value={healthData.waterDrink}
                    onChangeText={(text) =>
                      setHealthData({ ...healthData, waterDrink: text })
                    }
                  />
                </View>
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={styles.formItem}>
                <Text style={{ ...styles.label, color: theme.greyTextColor }}>
                  Age
                </Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    value={healthData.age}
                    onChangeText={(text) =>
                      setHealthData({ ...healthData, age: text })
                    }
                    keyboardType="number-pad"
                  />
                </View>
              </View>

              <View style={styles.formItem}>
                <Text style={{ ...styles.label, color: theme.greyTextColor }}>
                  SleepTime
                </Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    value={healthData.sleepTime}
                    onChangeText={(text) =>
                      setHealthData({ ...healthData, sleepTime: text })
                    }
                  />
                </View>
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={styles.formItem}>
                <Text style={{ ...styles.label, color: theme.greyTextColor }}>
                  WeightGoal
                </Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    value={String(healthData.weightGoal)}
                    onChangeText={(text) =>
                      setHealthData({ ...healthData, weightGoal: text })
                    }
                  />
                </View>
              </View>

              <View style={styles.formItem}>
                <Text style={{ ...styles.label, color: theme.greyTextColor }}>
                  EatHabit (disable)
                </Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    value={healthData.eatHabit?.map((item) => item).join(", ")}
                    onChangeText={(text) =>
                      setHealthData({ ...healthData, eatHabit: text })
                    }
                    editable={false}
                  />
                </View>
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={styles.formItem}>
                <Text style={{ ...styles.label, color: theme.greyTextColor }}>
                  Goal
                </Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    value={healthData.goal}
                    onChangeText={(text) =>
                      setHealthData({ ...healthData, goal: text })
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
    // paddingHorizontal: 12,
    height: 44,
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 14,
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
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
