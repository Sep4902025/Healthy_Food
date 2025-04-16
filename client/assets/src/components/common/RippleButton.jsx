import React, { useState } from "react";
import {
  Pressable,
  Text,
  StyleSheet,
  Animated,
  Platform,
  Dimensions,
  View,
  ActivityIndicator,
} from "react-native";

const WIDTH = Dimensions.get("window").width;
const HEIGHT = Dimensions.get("window").height;

const RippleButton = ({
  onPress, 
  children,
  buttonStyle,
  textStyle,
  backgroundColor = "rgba(256, 256, 256, 0.2)",
  buttonText,
  leftButtonIcon,
  rightButtonIcon,
  contentContainerStyle,
  loading,
}) => {
  const [rippleScale] = useState(new Animated.Value(0));
  const [rippleOpacity] = useState(new Animated.Value(1));
  const [touchCoords, setTouchCoords] = useState({ x: 0, y: 0 });

  const animateRipple = () => {
    rippleScale.setValue(0);
    rippleOpacity.setValue(1);

    Animated.parallel([
      Animated.timing(rippleScale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),

      Animated.timing(rippleOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressIn = (event) => {
    const touch = event.nativeEvent;

    setTouchCoords({
      x: touch.locationX,
      y: touch.locationY,
    });
    animateRipple();
  };

  const handlePress = (event) => {
    if (onPress) {
      onPress(event);
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={Platform.OS === "ios" ? handlePressIn : undefined}
      android_ripple={
        Platform.OS === "android"
          ? {
              color: backgroundColor,
              borderless: false,
              foreground: true,
            }
          : undefined
      }
      // style={({ pressed }) => [
      //   styles.defaultButtonStyle,
      //   buttonStyle,
      //   Platform.OS === "ios" && pressed && styles.iosPressed,
      // ]}
      style={{ ...styles.defaultButtonStyle, ...buttonStyle }}
      disabled={loading}
    >
      {Platform.OS === "ios" && (
        <Animated.View
          style={[
            styles.rippleView,
            {
              backgroundColor,
              opacity: rippleOpacity,
              transform: [{ scale: rippleScale }],
              left: touchCoords.x - WIDTH * 0.09,
              top: touchCoords.y - HEIGHT * 0.09,
            },
          ]}
        />
      )}
      <View style={[styles.contentContainer, contentContainerStyle]}>
        {leftButtonIcon}
        {children ||
          (buttonText && <Text style={textStyle}>{buttonText}</Text>)}
        {rightButtonIcon}
      </View>
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="white" />
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  defaultButtonStyle: {
    overflow: "hidden",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    padding: 12,
    borderRadius: 8,
    position: "relative",
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  rippleView: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  iosPressed: {
    opacity: 0.8,
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
});

export default RippleButton;
