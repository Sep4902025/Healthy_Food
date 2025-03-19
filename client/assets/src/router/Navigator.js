
import React, { useEffect } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";
import { StatusBar } from "react-native";

import { ScreensMap } from "./ScreensMap";
import CustomTabBar from "../components/common/CustomTabBar";
import { useTheme } from "../contexts/ThemeContext";


const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();


function HomeStack() {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        gestureDirection: "horizontal",
        
      }}
    >
      {ScreensMap.map((item, index) => (
        <Stack.Screen key={index} name={item.name} component={item.component} />
      ))}
    </Stack.Navigator>
  );
}


const TabNavigator = () => {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} theme={theme} />}
      screenOptions={({ route }) => ({
        tabBarShowLabel: false,
        headerShown: false,
        animation: "shift",
        gestureEnabled: true,
        gestureDirection: "horizontal",
      
        tabBarStyle: {
          backgroundColor: theme.tabBarBackgroundColor,
          borderTopColor: theme.border,
        },
      })}
      backBehavior="history"
    >
      <Tab.Screen name={"Main"} component={HomeStack} />
    </Tab.Navigator>
  );
};


const Navigator = () => {
  const { theme, themeMode } = useTheme();

 
  const navigationTheme = {
    ...(themeMode === "dark" ? DarkTheme : DefaultTheme),
    colors: {
      ...(themeMode === "dark" ? DarkTheme : DefaultTheme).colors,
      card: theme.cardBackground,
      text: theme.textColor,
      border: theme.border,
      primary: theme.primary,
      notification: theme.accent,
   
    },
  };

  return (
    <>
      <StatusBar
        barStyle={themeMode === "dark" ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />
      <NavigationContainer theme={navigationTheme}>
        {TabNavigator()}
      </NavigationContainer>
    </>
  );
};

export default Navigator;
