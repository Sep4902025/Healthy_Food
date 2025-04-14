import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from "react-native";
import Checkbox from "expo-checkbox";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSelector } from "react-redux";
import ProgressBar from "./ProgressBar";
import AntDesignIcon from "../../components/common/VectorIcons/AntDesignIcon";
import { userSelector } from "../../redux/selectors/selector";
import medicalConditionService from "../../services/medicalConditionService";

const UnderDisease = ({ navigation }) => {
  const user = useSelector(userSelector);
  console.log("UsrA", user.accessToken);

  const [selectedItems, setSelectedItems] = useState([]);
  const [medicalConditions, setMedicalConditions] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [backPressed, setBackPressed] = useState(false);

  useEffect(() => {
    const fetchMedicalConditions = async () => {
      try {
        if (!user.accessToken) {
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
  }, [user.accessToken]);

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
    <SafeAreaView className="flex-1">
      <View className="flex w-full mx-auto p-4 mt-8">
        <ProgressBar progress={84} />
        <View className="flex-row items-center">
          <TouchableOpacity
            className={`p-2 rounded-full shadow-sm ${
              backPressed ? "border-custom-green border-2" : "bg-white"
            }`}
            onPress={() => navigation.navigate("EatHabit")}
            onPressIn={() => setBackPressed(true)}
            onPressOut={() => setBackPressed(false)}
          >
            <AntDesignIcon name="left" size={18} color={"#40B491"} />
          </TouchableOpacity>
          <View className="flex-1 items-center">
            <Text className="text-2xl font-bold text-center mt-4 text-custom-green">
              Underlying Conditions
            </Text>
            <Text className="text-base text-gray-600 mt-1">
              Please tell me about your underlying health conditions
            </Text>
          </View>
          <View className="w-10" />
        </View>

        {loading && (
          <Text className="text-center text-gray-500 mt-4">Đang tải danh sách bệnh nền...</Text>
        )}
        {error && !loading && <Text className="text-center text-red-500 mt-4">{error}</Text>}

        {!loading && !error && medicalConditions.length > 0 && (
          <ScrollView className="mt-6 space-y-5">
            {medicalConditions.map((condition) => (
              <TouchableOpacity
                key={condition.id}
                className={`flex-row items-center p-4 rounded-xl border shadow-sm mt-1 ${
                  isSelected(condition.id)
                    ? "bg-custom-green border-gray-200"
                    : "bg-gray-100 border-gray-300"
                }`}
                onPress={() => toggleItemSelection(condition.id)}
              >
                <Checkbox
                  value={isSelected(condition.id)}
                  onValueChange={() => toggleItemSelection(condition.id)}
                  className="mr-3"
                />
                <Text
                  className={`text-lg font-semibold ${
                    isSelected(condition.id) ? "text-white" : "text-black"
                  }`}
                >
                  {condition.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <TouchableOpacity
          className="w-full bg-custom-green py-3 rounded-lg mt-6"
          onPress={handleNext}
        >
          <Text className="text-white text-lg font-semibold text-center">Next</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default UnderDisease;
