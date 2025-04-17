// PaymentStatusScreen.js
import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, Button } from "react-native";

import Toast from "react-native-toast-message";
import { useNavigation } from "@react-navigation/native";
import mealPlanService from "../../services/mealPlanService";

const PaymentStatusScreen = ({ route }) => {
  const { paymentId } = route.params; // Lấy paymentId từ navigation params
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState(null);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const result = await mealPlanService.checkPaymentStatus(paymentId);
        console.log("Payment status result:", result);

        if (result.success) {
          setPaymentStatus(result.data);
          Toast.show({
            type: "success",
            text1: "Kiểm tra trạng thái thanh toán thành công",
            text2: `Trạng thái: ${result.data.status}`,
          });

          // Điều hướng dựa trên trạng thái thanh toán
          if (result.data.status === "success") {
            navigation.navigate("MealPlanDetail", { mealPlanId: result.data.mealPlanId });
          } else if (result.data.status === "failed") {
            navigation.navigate("PaymentFailedScreen");
          } else {
            // Nếu status là "pending", có thể thử lại sau hoặc quay lại màn hình trước
            setTimeout(() => {
              navigation.goBack();
            }, 2000);
          }
        } else {
          Toast.show({
            type: "error",
            text1: "Lỗi",
            text2: result.message || "Không thể kiểm tra trạng thái thanh toán",
          });
          setTimeout(() => {
            navigation.goBack();
          }, 2000);
        }
      } catch (error) {
        console.error("Error in PaymentStatusScreen:", error);
        Toast.show({
          type: "error",
          text1: "Lỗi",
          text2: "Đã có lỗi xảy ra khi kiểm tra trạng thái thanh toán",
        });
        setTimeout(() => {
          navigation.goBack();
        }, 2000);
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, [paymentId, navigation]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Đang kiểm tra trạng thái thanh toán...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      {paymentStatus ? (
        <>
          <Text>Trạng thái thanh toán: {paymentStatus.status}</Text>
          <Text>Số tiền: {paymentStatus.amount}</Text>
          <Text>Gói: {paymentStatus.mealPlanName}</Text>
          <Button title="Quay lại" onPress={() => navigation.goBack()} />
        </>
      ) : (
        <Text>Không tìm thấy thông tin thanh toán</Text>
      )}
    </View>
  );
};

export default PaymentStatusScreen;
