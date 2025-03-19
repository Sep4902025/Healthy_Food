import React from "react";
import { Dimensions, KeyboardAvoidingView, Platform, Text } from "react-native";
import SafeAreaWrapper from "./SafeAreaWrapper";
import Header from "./Header";
import { LinearGradient } from "expo-linear-gradient";
import DecorationDot from "../common/DecorationDot";
import { useTheme } from "../../contexts/ThemeContext";

// Lấy kích thước màn hình
const WIDTH = Dimensions.get("window").width;
const HEIGHT = Dimensions.get("window").height;

function NonBottomTabWrapper({ children, headerHidden, style }) {
  const { theme } = useTheme();

  return (
    <SafeAreaWrapper>
      {!headerHidden && <Header />}

      <LinearGradient
        colors={theme.backgroundColor}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{ flex: 1, minHeight: HEIGHT }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ ...style }}
        >
          {children}
        </KeyboardAvoidingView>
      </LinearGradient>
      {/* {children} */}
      <>
        <DecorationDot
          size={HEIGHT * 0.25}
          top={-(HEIGHT * 0.1)}
          left={-(WIDTH * 0.4)}
          zIndex={1}
          backgroundColor={theme.greenDecorationDotColor}
        />
        <DecorationDot
          size={HEIGHT * 0.25}
          top={-(HEIGHT * 0.2)}
          left={-(WIDTH * 0.2)}
          opacity={0.4}
          zIndex={1}
          backgroundColor={theme.blackDecorationDotColor}
        />

        <DecorationDot
          size={HEIGHT * 0.25}
          top={HEIGHT - HEIGHT * 0.15}
          left={WIDTH - WIDTH * 0.4}
          zIndex={1}
          backgroundColor={theme.greenDecorationDotColor}
        />
        <DecorationDot
          size={HEIGHT * 0.25}
          top={HEIGHT - HEIGHT * 0.3}
          left={WIDTH - WIDTH * 0.6}
          opacity={0.4}
          zIndex={1}
          transform={[{ translateX: 200 }, { translateY: 50 }]}
          backgroundColor={theme.blackDecorationDotColor}
        />
      </>
    </SafeAreaWrapper>
  );
}

export default NonBottomTabWrapper;
