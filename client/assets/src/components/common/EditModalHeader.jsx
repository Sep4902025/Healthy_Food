import { LinearGradient } from "expo-linear-gradient";
import { Dimensions, Image, StyleSheet, TouchableOpacity } from "react-native";
import Ionicons from "./VectorIcons/Ionicons";
import { useTheme } from "../../contexts/ThemeContext";

const WIDTH = Dimensions.get("window").width;
const HEIGHT = Dimensions.get("window").height;
export const EditModalHeader = ({ onCancel }) => {
  const { theme, themeMode } = useTheme();

  return (
    <LinearGradient
      colors={theme.editModalHeaderBackgroundColor}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <Image
        source={
          themeMode === "light"
            ? require("../../../assets/image/EditModalHeaderDecor.png")
            : require("../../../assets/image/EditModalHeaderDecorDark.png")
        }
        style={styles.headerDecor}
        resizeMode="contain"
      />
      <TouchableOpacity style={styles.backButton} onPress={onCancel}>
        <Ionicons name="chevron-back" size={24} color="white" />
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    height: HEIGHT * 0.2,
    width: WIDTH,
    justifyContent: "center",
  },
  backButton: {
    position: "absolute",
    left: "8%",
    padding: 8,
    paddingHorizontal: 2,
    zIndex: 999,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 8,
  },
  headerDecor: {
    position: "absolute",
    height: "100%",
    right: "-15%",
    // top: 0,
  },
});
