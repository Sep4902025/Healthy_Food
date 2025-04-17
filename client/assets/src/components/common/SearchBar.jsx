import React, { useEffect, useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  PixelRatio,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { saveSearchHistory } from "../../utils/common";

const window = Dimensions.get("window");
const scale = window.width / 375;

// Function to normalize sizes for different screen dimensions
const normalize = (size) => {
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

const SearchBar = ({
  placeholder = "What do you need?",
  value = "",
  onChangeText,
  onSubmit,
  onClear,
}) => {
  const [searchText, setSearchText] = useState(value);

  useEffect(() => {
    if (value !== searchText) {
      setSearchText(value);
    }
  }, [value]);

  const handleClear = () => {
    setSearchText("");
    if (onClear) onClear();
  };

  const handleSubmit = async () => {
    if (searchText.trim() !== "") {
      await saveSearchHistory(searchText);
      onSubmit && onSubmit();
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#999"
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={handleSubmit}
      />

      {searchText ? (
        <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
          <Ionicons name="close-circle" size={normalize(20)} color="#aaa" />
        </TouchableOpacity>
      ) : null}

      <TouchableOpacity style={styles.searchButton} onPress={handleSubmit}>
        <Ionicons name="search" size={normalize(22)} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: normalize(25),
    paddingHorizontal: normalize(16),
    height: normalize(48),
    marginVertical: normalize(10),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: normalize(16),
    color: "#333",
    paddingRight: normalize(40),
  },
  clearButton: {
    position: "absolute",
    right: "20%",
    height: "100%",
    justifyContent: "center",
    paddingHorizontal: normalize(10),
  },
  searchButton: {
    position: "absolute",
    right: 0,
    height: "100%",
    width: normalize(60),
    backgroundColor: "#40B491",
    borderTopRightRadius: normalize(25),
    borderBottomRightRadius: normalize(25),
    justifyContent: "center",
    alignItems: "center",
  },
});

export default SearchBar;
