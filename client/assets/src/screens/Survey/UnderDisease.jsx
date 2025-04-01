import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import Checkbox from "expo-checkbox"; // Updated import
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSelector } from "react-redux";
import ProgressBar from "./ProgressBar";
import { userSelector } from "../../redux/selectors/selector";
import medicalConditionService from "../../services/medicalConditionService";

const UnderDisease = ({ navigation }) => {
  const { accessToken } = useSelector(userSelector);
  const [selectedItems, setSelectedItems] = useState([]);
  const [medicalConditions, setMedicalConditions] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMedicalConditions = async () => {
      try {
        if (!accessToken) {
          throw new Error("Không tìm thấy accessToken. Vui lòng đăng nhập lại.");
        }

        const result = await medicalConditionService.getAllMedicalConditions(1, 6);
        if (!result.success) {
          throw new Error(result.message);
        }

        const conditions = result.data.items;
        if (conditions.length === 0) {
          setError("Không có bệnh nền nào để hiển thị.");
          setMedicalConditions([]);
        } else {
          const mappedData = conditions.map((condition) => ({
            id: condition._id || condition.id,
            name: condition.name,
          }));
          setMedicalConditions(mappedData);
        }
      } catch (error) {
        setError(`Không thể tải danh sách bệnh nền: ${error.message}`);
        setMedicalConditions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMedicalConditions();

    const loadData = async () => {
      const savedData = JSON.parse(await AsyncStorage.getItem("quizData")) || {};
      if (savedData.underDisease) {
        const validObjectIds = savedData.underDisease.filter((id) => /^[0-9a-fA-F]{24}$/.test(id));
        setSelectedItems(validObjectIds);
      }
    };
    loadData();
  }, [accessToken]);

  const toggleItemSelection = (id) => {
    setSelectedItems((prev) => {
      const noDiseaseId = medicalConditions.find((d) => d.name === "Không mắc bệnh")?.id;
      if (id === noDiseaseId) {
        return prev.includes(id) ? [] : [id];
      }
      const filtered = prev.filter((item) => item !== noDiseaseId);
      return filtered.includes(id) ? filtered.filter((item) => item !== id) : [...filtered, id];
    });
  };

  const isSelected = (id) => selectedItems.includes(id);

  const handleNext = async () => {
    if (selectedItems.length === 0) {
      alert("Vui lòng chọn ít nhất một lựa chọn.");
      return;
    }

    const currentData = JSON.parse(await AsyncStorage.getItem("quizData")) || {};
    const updatedData = { ...currentData, underDisease: selectedItems };
    await AsyncStorage.setItem("quizData", JSON.stringify(updatedData));
    navigation.navigate("Favorite");
  };

  return (
    <View className="flex-1 max-w-md mx-auto p-4">
      <View className="w-full flex-row items-center justify-center mt-2">
        <TouchableOpacity
          className="absolute left-20 p-2 bg-gray-300 rounded-full shadow"
          onPress={() => navigation.navigate("EatHabit")}
        >
          <Text className="text-xl">←</Text>
        </TouchableOpacity>
        <ProgressBar progress={84} />
      </View>

      <Text className="text-2xl font-bold text-center mt-4">Underlying conditions</Text>
      <Text className="text-center text-gray-600">
        Please tell me about your underlying health conditions
      </Text>

      {loading && (
        <Text className="text-center text-gray-500 mt-4">Đang tải danh sách bệnh nền...</Text>
      )}

      {error && !loading && <Text className="text-center text-red-500 mt-4">{error}</Text>}

      {!loading && !error && medicalConditions.length > 0 && (
        <ScrollView className="mt-4 space-y-3">
          {medicalConditions.map((condition) => (
            <TouchableOpacity
              key={condition.id}
              className={`flex-row items-center p-3 border rounded-xl ${
                isSelected(condition.id) ? "bg-yellow-50 border-yellow-400" : "bg-gray-100"
              }`}
              onPress={() => toggleItemSelection(condition.id)}
            >
              <Checkbox
                value={isSelected(condition.id)}
                onValueChange={() => toggleItemSelection(condition.id)}
                className="mr-3"
              />
              <Text
                className={`font-medium ${
                  isSelected(condition.id) ? "text-yellow-700" : "text-gray-700"
                }`}
              >
                {condition.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <TouchableOpacity className="w-full bg-teal-500 py-3 rounded-lg mt-5" onPress={handleNext}>
        <Text className="text-white text-lg font-semibold text-center">Tiếp theo</Text>
      </TouchableOpacity>
    </View>
  );
};

export default UnderDisease;
