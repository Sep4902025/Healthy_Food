import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, Button } from "react-native";
import Toast from "react-native-toast-message";
import mealPlanService from "../../services/mealPlanService";

const PaymentStatusScreen = ({ route, navigation }) => {
  const { paymentId } = route.params;
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        const response = await mealPlanService.checkPaymentStatus(paymentId);
        console.log("Response from checkPaymentStatus:", response);
        if (response.success) {
          setStatus(response.data.status);
          setMessage(
            response.data.status === "success" ? "Thanh toán thành công!" : "Thanh toán thất bại."
          );
        } else {
          setStatus("error");
          setMessage("Không thể kiểm tra trạng thái thanh toán.");
        }
      } catch (error) {
        console.error("Error checking payment status:", error);
        setStatus("error");
        setMessage("Lỗi khi kiểm tra trạng thái thanh toán.");
      }
    };

    checkPaymentStatus();
  }, [paymentId]);

  return (
    <View className="flex-1 justify-center items-center p-5">
      {status === "loading" ? (
        <ActivityIndicator size="large" color="#10B981" />
      ) : (
        <>
          <Text className="text-xl font-bold mb-3">
            {status === "success" ? "Thành công!" : "Thất bại"}
          </Text>
          <Text className="text-gray-600 mb-5">{message}</Text>
          <Button
            title="Quay lại"
            onPress={() => navigation.navigate("Home")} // Điều hướng về màn hình chính
          />
        </>
      )}
    </View>
  );
};

export default PaymentStatusScreen;
