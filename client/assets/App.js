
import "react-native-gesture-handler";
import { Provider } from "react-redux";
import { ActivityIndicator, Text, View } from "react-native";
import store from "./src/redux/store";
import Navigator from "./src/router/Navigator";
import React, { useEffect } from "react";
import Toast from "react-native-toast-message";


import {
  useFonts,
  Aleo_300Light,
  Aleo_300Light_Italic,
  Aleo_400Regular,
  Aleo_400Regular_Italic,
  Aleo_700Bold,
  Aleo_700Bold_Italic,
} from "@expo-google-fonts/aleo";
import { ThemeProvider } from "./src/contexts/ThemeContext";
import messageSocket from "./src/services/messageSocket";


const DefaultText = Text.render;
const customTextRender = function (...args) {
  const originText = DefaultText.apply(this, args);
  return React.cloneElement(originText, {
    style: [{ fontFamily: "Aleo_400Regular" }, originText.props.style],
  });
};

Text.render = customTextRender;

export default function App() {
  let [fontsLoaded] = useFonts({
    Aleo_300Light,
    Aleo_300Light_Italic,
    Aleo_400Regular,
    Aleo_400Regular_Italic,
    Aleo_700Bold,
    Aleo_700Bold_Italic,
  });

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" />;
  }

  
  const toastConfig = {
    success: ({ text1, text2, props }) => (
      <View style={{ backgroundColor: "green", padding: 10, borderRadius: 5 }}>
        <Text style={{ color: "white" }}>{text1}</Text>
        {text2 && <Text style={{ color: "white" }}>{text2}</Text>}
      </View>
    ),
    error: ({ text1, text2, props }) => (
      <View style={{ backgroundColor: "red", padding: 10, borderRadius: 5 }}>
        <Text style={{ color: "white" }}>{text1}</Text>
        {text2 && <Text style={{ color: "white" }}>{text2}</Text>}
      </View>
    ),
    info: ({ text1, text2, props }) => (
      <View style={{ backgroundColor: "blue", padding: 10, borderRadius: 5 }}>
        <Text style={{ color: "white" }}>{text1}</Text>
        {text2 && <Text style={{ color: "white" }}>{text2}</Text>}
      </View>
    ),
  };

  return (
    <Provider store={store}>
      <ThemeProvider>
        <Navigator />
        <Toast config={toastConfig} />
      </ThemeProvider>
    </Provider>
  );
}
