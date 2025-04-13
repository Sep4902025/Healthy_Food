import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, Alert } from "react-native";
import { WebView } from "react-native-webview";
import Toast from "react-native-toast-message";
import mealPlanService from "../../services/mealPlanService"; // Import mealPlanService

const PaymentScreen = ({ route, navigation }) => {
  const { url } = route.params; // Lấy URL VNPAY từ params
  const [loading, setLoading] = useState(true);

  const handleNavigationStateChange = async (navState) => {
    const { url: currentUrl } = navState;
    console.log("Webview URL:", currentUrl);

    // Phát hiện khi VNPay redirect đến vnp_ReturnUrl_App
    if (currentUrl.includes("/api/v1/payment/vnpay/app/return")) {
      // Gọi service để kiểm tra kết quả thanh toán
      const result = await mealPlanService.checkPaymentReturnUrl(currentUrl);
      if (result.success) {
        Toast.show({
          type: "success",
          text1: "Thành công",
          text2: result.message,
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Thất bại",
          text2: result.message,
        });
      }
      // Quay lại màn hình trước (Cart) hoặc điều hướng đến PaymentStatusScreen
      navigation.goBack();
    }
  };

  if (!url) {
    Toast.show({
      type: "error",
      text1: "Error",
      text2: "Payment URL is missing",
    });
    navigation.goBack();
    return null;
  }

  return (
    <View className="flex-1">
      {loading && (
        <View className="absolute top-0 left-0 right-0 bottom-0 justify-center items-center bg-white">
          <ActivityIndicator size="large" color="#10B981" />
          <Text className="mt-4 text-lg text-gray-700">Đang tải trang thanh toán...</Text>
        </View>
      )}
      <WebView
        source={{ uri: url }}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onNavigationStateChange={handleNavigationStateChange}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error("Webview error:", nativeEvent);
          Alert.alert("Lỗi", "Không thể tải trang thanh toán. Vui lòng thử lại.");
          navigation.goBack();
        }}
      />
    </View>
  );
};

export default PaymentScreen;
