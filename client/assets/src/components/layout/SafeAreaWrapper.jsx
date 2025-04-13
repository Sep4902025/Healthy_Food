import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Platform,
  ImageBackground,
  Dimensions,
} from "react-native";
import { SafeAreaView, SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { useTheme } from "../../contexts/ThemeContext";

const WIDTH = Dimensions.get("window").width;
const HEIGHT = Dimensions.get("window").height;

const SafeAreaWrapper = ({
  headerTitle = "",
  headerStyle = {
    backgroundColor: "transparent",
    textColor: "#000000",
    theme: "black",
  },
  backgroundImage,
  backgroundStyle,
  children,
}) => {
  const { backgroundColor, textColor, height } = headerStyle;
  const insets = useSafeAreaInsets();

  const { theme, themeMode } = useTheme();

  useFocusEffect(
    React.useCallback(() => {
      StatusBar.setBarStyle(themeMode !== "light" ? "light-content" : "dark-content", true);
    }, [])
  );

  useEffect(() => {
    StatusBar.setBarStyle(themeMode !== "light" ? "light-content" : "dark-content", true);
    if (Platform.OS === "android") {
      StatusBar.setBackgroundColor(theme.safeAreaBackgroundColor);
      StatusBar.setTranslucent(true);
    }
  }, [themeMode]);

  return (
    <SafeAreaProvider>
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: height ?? insets.top,
          backgroundColor: theme.safeAreaBackgroundColor,
          zIndex: 2,
        }}
      />

      <SafeAreaView style={styles.container}>
        {backgroundImage ? (
          <ImageBackground
            source={backgroundImage}
            style={[styles.background, backgroundStyle || {}]}
            imageStyle={{ resizeMode: "cover" }}
          >
            {headerTitle ? (
              <View style={styles.header}>
                <Text style={[styles.headerText, { color: textColor }]}>{headerTitle}</Text>
              </View>
            ) : null}
            <View style={styles.content}>{children}</View>
          </ImageBackground>
        ) : (
          <>
            {headerTitle ? (
              <View style={[styles.header, { backgroundColor }]}>
                <Text style={[styles.headerText, { color: textColor }]}>{headerTitle}</Text>
              </View>
            ) : null}
            <View style={[styles.content, backgroundStyle]}>{children}</View>
          </>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: WIDTH,
    height: HEIGHT,
    position: "relative",
  },
  background: {
    flex: 1,
    backgroundColor: "red",
  },
  header: {
    paddingTop: Platform.OS === "ios" ? 15 : 10,
    justifyContent: "center",
    alignItems: "center",
    height: 60,
    zIndex: 1,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    zIndex: 0,
  },
});

export default SafeAreaWrapper;
