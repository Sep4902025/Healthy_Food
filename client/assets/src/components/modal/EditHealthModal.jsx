import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Dimensions,
  Modal,
  Platform,
  ActivityIndicator, // Import ActivityIndicator for loading
} from "react-native";
import Ionicons from "../common/VectorIcons/Ionicons";
import { EditModalHeader } from "../common/EditModalHeader";
import { useTheme } from "../../contexts/ThemeContext";
import { normalize } from "../../utils/common";

const HEIGHT = Dimensions.get("window").height;

export const EditHealthModal = ({ visible, onClose, onSave, userPreference }) => {
  console.log("User Preference:", userPreference);

  const { theme } = useTheme();
  const [healthData, setHealthData] = useState({
    ...userPreference,
  });
  const [bmi, setBmi] = useState(null);
  const [loading, setLoading] = useState(false); // Add loading state

  // Update healthData when userPreference changes
  useEffect(() => {
    setHealthData(userPreference || {});
    calculateBMI(userPreference?.weight, userPreference?.height);
  }, [userPreference]);

  // Calculate BMI
  const calculateBMI = (weight, height) => {
    const w = parseFloat(weight);
    const h = parseFloat(height) / 100; // Convert from cm to m
    if (w && h && !isNaN(w) && !isNaN(h) && h > 0) {
      const bmiValue = (w / (h * h)).toFixed(1);
      setBmi(bmiValue);
      setHealthData((prev) => ({ ...prev, bmi: bmiValue }));
    } else {
      setBmi(null);
      setHealthData((prev) => ({ ...prev, bmi: null }));
    }
  };

  // Handle input changes (not used since fields are not editable)
  const handleInputChange = (field, value) => {
    setHealthData((prev) => {
      const updatedData = { ...prev, [field]: value };
      if (field === "weight" || field === "height") {
        calculateBMI(
          field === "weight" ? value : updatedData.weight,
          field === "height" ? value : updatedData.height
        );
      }
      return updatedData;
    });
  };

  const handleSave = async () => {
    setLoading(true); // Start loading

    try {
      // Call onSave to trigger the reset in Profile.jsx
      onSave(healthData);
    } catch (error) {
      console.error("handleSave error:", error);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const formData = [
    [
      {
        label: "BMI",
        field: "bmi",
        value: bmi ? String(bmi) : "",
        keyboardType: "default",
        editable: false,
      },
      {
        label: "Water Drink",
        field: "waterDrink",
        value: healthData?.waterDrink ?? "",
        keyboardType: "default",
        editable: false,
      },
    ],
    [
      {
        label: "Age",
        field: "age",
        value: healthData?.age ?? "",
        keyboardType: "default",
        editable: false,
      },
      {
        label: "Sleep Time",
        field: "sleepTime",
        value: healthData?.sleepTime ?? "",
        keyboardType: "default",
        editable: false,
      },
    ],
    [
      {
        label: "Goal",
        field: "goal",
        value: healthData?.goal ?? "",
        keyboardType: "default",
        editable: false,
      },
      {
        label: "Plan Duration",
        field: "longOfPlan",
        value: healthData?.longOfPlan ?? "",
        keyboardType: "default",
        editable: false,
      },
    ],
    [
      {
        label: "Diet",
        field: "diet",
        value: healthData?.diet ?? "",
        keyboardType: "default",
        editable: false,
      },
      {
        label: "Meal Number",
        field: "mealNumber",
        value: healthData?.mealNumber ?? "",
        keyboardType: "default",
        editable: false,
      },
    ],
    [
      {
        label: "Underlying Diseases",
        field: "underDisease",
        value: healthData?.underDisease?.join(", ") ?? "",
        keyboardType: "default",
        editable: false,
      },
    ],
  ];

  const viewForm = [
    {
      label: "Eating Habits",
      field: "eatHabit",
      value: healthData?.eatHabit || [],
      keyboardType: "default",
      editable: false,
    },
    {
      label: "Recommended Foods",
      field: "recommendedFoods",
      value: healthData?.recommendedFoods || [],
      keyboardType: "default",
      editable: false,
    },
    {
      label: "Disliked Foods",
      field: "hate",
      value: healthData?.hate || [],
      keyboardType: "default",
      editable: false,
    },
  ];

  // Render input field based on field config
  const renderInputField = (fieldConfig) => {
    if (!fieldConfig) return <View style={styles.formItem} />;

    const { label, field, value, keyboardType, editable } = fieldConfig;
    return (
      <View style={styles.formItem}>
        <Text style={{ ...styles.label, color: theme.greyTextColor }}>{label}</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={String(value)}
            onChangeText={(text) => handleInputChange(field, text)}
            keyboardType={keyboardType}
            editable={editable}
          />
        </View>
      </View>
    );
  };

  const renderViewField = (fieldConfig) => {
    if (!fieldConfig) return <View style={styles.formItem} />;

    const { label, field, value, keyboardType, editable } = fieldConfig;

    // Ensure value is an array
    const items = Array.isArray(value) ? value : [];

    return (
      <View style={styles.formItemFull}>
        <Text style={{ ...styles.label, color: theme.greyTextColor }}>{label}</Text>
        <View style={styles.tagsContainer}>
          {items.length > 0 ? (
            items.map((item, index) => (
              <View key={`${field}-${index}`} style={styles.tagItem}>
                <Text style={styles.tagText}>{item}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.tagText}>None</Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <EditModalHeader onCancel={onClose} />
      <View
        style={{
          ...styles.container,
          backgroundColor: theme.editModalbackgroundColor,
        }}
      >
        <Text style={{ ...styles.headerTitle, color: theme.textColor }}>Health Information</Text>
        <ScrollView style={styles.scrollContent}>
          <View style={styles.formGrid}>
            {formData.map((row, rowIndex) => (
              <View key={`row-${rowIndex}`} style={styles.formRow}>
                {renderInputField(row[0])}
                {row[1] ? renderInputField(row[1]) : <View style={styles.formItem} />}
              </View>
            ))}
          </View>
          <View style={styles.formGrid}>
            {viewForm.map((fieldConfig, index) => (
              <View key={`view-field-${index}`}>{renderViewField(fieldConfig)}</View>
            ))}
          </View>
        </ScrollView>
        {userPreference && Object.keys(userPreference).length > 0 ? (
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Reset</Text>
            )}
          </TouchableOpacity>
        ) : null}
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
    fontSize: normalize(25),
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
    fontSize: normalize(14),
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
    fontSize: normalize(14),
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    paddingHorizontal: 12,
  },
  formItemFull: {
    width: "100%",
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
  tagItem: {
    backgroundColor: "white",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    paddingVertical: 8,
    paddingHorizontal: 16,
    margin: 4,
    minWidth: "45%",
  },
  tagText: {
    color: "#666",
    fontSize: normalize(14),
    textAlign: "center",
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
  saveButtonDisabled: {
    backgroundColor: "#A0D9C5",
    opacity: 0.7,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: normalize(16),
    fontWeight: "600",
  },
});
