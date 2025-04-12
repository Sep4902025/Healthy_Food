import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { userSelector } from "../../redux/selectors/selector";
import Toast from "react-native-toast-message";
import { useTheme } from "../../contexts/ThemeContext";
import { useNavigation } from "@react-navigation/native";
import { ScreensName } from "../../constants/ScreensName";
import mealPlanService from "../../services/mealPlanService";
import PreviewModal from "./PreviewModal";

const Cart = ({ visible, onClose, mealPlanCount }) => {
  const { theme } = useTheme();
  const user = useSelector(userSelector);
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState("mealPlan");
  const [mealPlans, setMealPlans] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  useEffect(() => {
    const fetchUnpaidMealPlans = async () => {
      if (user && visible) {
        setLoading(true);
        try {
          const response = await mealPlanService.getUnpaidMealPlanForUser(user._id);
          console.log("Response from getUnpaidMealPlanForUser:", response);
          if (response.success) {
            setMealPlans(response.data);
          } else {
            setMealPlans([]);
            Toast.show({
              type: "error",
              text1: "Error",
              text2: "Failed to load meal plans",
            });
          }
        } catch (error) {
          console.error("Error fetching unpaid meal plans:", error);
          setMealPlans([]);
          Toast.show({
            type: "error",
            text1: "Error",
            text2: "Failed to load meal plans",
          });
        } finally {
          setLoading(false);
        }
      }
    };

    const fetchPaymentHistory = async () => {
      if (user && visible) {
        try {
          const response = await mealPlanService.getPaymentHistory(user._id, 1, 5);
          console.log("Response from getPaymentHistory:", response);
          if (response.success) {
            setPaymentHistory(response.data);
          } else {
            setPaymentHistory([]);
            Toast.show({
              type: "error",
              text1: "Error",
              text2: "Failed to load payment history",
            });
          }
        } catch (error) {
          console.error("Error fetching payment history:", error);
          setPaymentHistory([]);
          Toast.show({
            type: "error",
            text1: "Error",
            text2: "Failed to load payment history",
          });
        }
      }
    };

    fetchUnpaidMealPlans();
    fetchPaymentHistory();
  }, [user, visible]);

  const handlePayMealPlan = async (mealPlan) => {
    if (!user?._id || !mealPlan?._id) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "User or meal plan ID is missing",
      });
      return;
    }

    if (!mealPlan.price || mealPlan.price <= 0) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Invalid meal plan price",
      });
      return;
    }

    try {
      console.log("Calling createMealPlanPayment with:", {
        userId: user._id,
        mealPlanId: mealPlan._id,
        amount: mealPlan.price,
      });

      const response = await mealPlanService.createMealPlanPayment(
        user._id,
        mealPlan._id,
        mealPlan.price
      );

      console.log("Response from createMealPlanPayment:", response);

      if (response.status === "success" && response.paymentUrl && response.paymentId) {
        Toast.show({
          type: "success",
          text1: "Redirecting",
          text2: "Opening payment page... Please return to the app after payment.",
        });

        const paymentId = response.paymentId;
        console.log("Payment URL:", response.paymentUrl); // Debug the payment URL

        const supported = await Linking.canOpenURL(response.paymentUrl);
        if (supported) {
          await Linking.openURL(response.paymentUrl);
        } else {
          Toast.show({
            type: "error",
            text1: "Error",
            text2: "Cannot open payment URL",
          });
          return;
        }

        onClose();
        navigation.navigate(ScreensName.paymentStatus, { paymentId });
      } else {
        console.error("Payment initiation failed:", response);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: response.message || "Unable to initiate payment",
        });
      }
    } catch (error) {
      console.error("Error initiating payment:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message || "Error initiating payment",
      });
    }
  };

  const handlePreviewMealPlan = async (mealPlan) => {
    try {
      const response = await mealPlanService.getMealPlanDetails(mealPlan._id);
      console.log("Response from getMealPlanDetails:", response);
      if (response.success) {
        setPreviewData(response.data);
        setPreviewModalOpen(true);
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: response.message || "Unable to load preview",
        });
      }
    } catch (error) {
      console.error("Error fetching meal plan details:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Error loading preview",
      });
    }
  };

  const renderMealPlan = ({ item }) => (
    <View className="p-3 border-b border-gray-200">
      <Text className="text-gray-700 font-medium">{item.title || "Untitled Meal Plan"}</Text>
      <Text className="text-gray-600 text-sm">
        Start: {new Date(item.startDate).toLocaleDateString()}
      </Text>
      <Text className="text-gray-600 text-sm">
        Price: {item.price ? item.price.toLocaleString() : "N/A"} VND
      </Text>
      <View className="flex-row mt-2 space-x-2">
        <TouchableOpacity
          className="bg-green-500 active:bg-green-600 px-4 py-1 rounded-md flex-1 items-center"
          onPress={() => handlePayMealPlan(item)}
        >
          <Text className="text-white text-xs font-medium">Pay Now</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-blue-500 active:bg-blue-600 px-4 py-1 rounded-md flex-1 items-center"
          onPress={() => handlePreviewMealPlan(item)}
        >
          <Text className="text-white text-xs font-medium">Preview</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPaymentHistory = ({ item }) => (
    <View className="p-3 border-b border-gray-200">
      <Text className="text-gray-600 text-sm">
        <Text className="font-semibold">Meal Plan:</Text> {item.mealPlanName || "N/A"}
      </Text>
      <Text className="text-gray-600 text-sm">
        <Text className="font-semibold">Amount:</Text> {item.amount.toLocaleString()} VND
      </Text>
      <Text className="text-gray-600 text-sm">
        <Text className="font-semibold">Status:</Text> {item.status}
      </Text>
      <Text className="text-gray-600 text-sm">
        <Text className="font-semibold">Date:</Text> {new Date(item.createdAt).toLocaleDateString()}
      </Text>
    </View>
  );

  return (
    <>
      <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl max-h-[80%] p-5">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-xl font-bold text-gray-800">Cart</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color="gray" />
              </TouchableOpacity>
            </View>
            <View className="flex-row border-b border-gray-200 mb-3">
              <TouchableOpacity
                className={`flex-1 py-2 items-center border-b-2 ${
                  activeTab === "mealPlan" ? "border-green-500" : "border-transparent"
                }`}
                onPress={() => setActiveTab("mealPlan")}
              >
                <Text
                  className={`text-base font-semibold ${
                    activeTab === "mealPlan" ? "text-green-600" : "text-gray-600"
                  }`}
                >
                  Meal Plans ({mealPlanCount})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 py-2 items-center border-b-2 ${
                  activeTab === "history" ? "border-green-500" : "border-transparent"
                }`}
                onPress={() => setActiveTab("history")}
              >
                <Text
                  className={`text-base font-semibold ${
                    activeTab === "history" ? "text-green-600" : "text-gray-600"
                  }`}
                >
                  Payment History
                </Text>
              </TouchableOpacity>
            </View>
            {loading ? (
              <ActivityIndicator size="large" color="#10B981" />
            ) : (
              <FlatList
                data={activeTab === "mealPlan" ? mealPlans : paymentHistory}
                renderItem={activeTab === "mealPlan" ? renderMealPlan : renderPaymentHistory}
                keyExtractor={(item) => item._id}
                ListEmptyComponent={
                  <Text className="text-gray-500 text-center py-5">
                    {activeTab === "mealPlan" ? "No meal plans to pay." : "No payment history."}
                  </Text>
                }
                contentContainerStyle={{ paddingBottom: 20 }}
              />
            )}
          </View>
        </View>
      </Modal>

      <PreviewModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        previewData={previewData}
      />
    </>
  );
};

export default Cart;
