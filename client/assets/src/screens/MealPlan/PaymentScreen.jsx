import React, { useEffect } from "react";
import { View, Text, ActivityIndicator, Linking, Platform } from "react-native";
import Toast from "react-native-toast-message";

const PaymentScreen = ({ route, navigation }) => {
  const { url } = route.params; // Lấy URL VNPAY từ params

  useEffect(() => {
    if (!url) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Payment URL is missing",
      });
      navigation.goBack();
      return;
    }

    // Mở URL VNPAY trong trình duyệt mặc định của thiết bị
    const openPaymentUrl = async () => {
      try {
        const supported = await Linking.canOpenURL(url);
        if (supported) {
          await Linking.openURL(url);
        } else {
          Toast.show({
            type: "error",
            text1: "Error",
            text2: "Cannot open payment URL",
          });
        }
      } catch (error) {
        console.error("Error opening payment URL:", error);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to open payment URL",
        });
      } finally {
        // Quay lại màn hình trước (Cart) sau khi mở URL
        // Bạn có thể điều chỉnh logic này tùy theo yêu cầu
        navigation.goBack();
      }
    };

    openPaymentUrl();
  }, [url, navigation]);

  return (
    <View className="flex-1 justify-center items-center bg-white">
      <ActivityIndicator size="large" color="#10B981" />
      <Text className="mt-4 text-lg text-gray-700">Redirecting to payment...</Text>
    </View>
  );
};

export default PaymentScreen;
