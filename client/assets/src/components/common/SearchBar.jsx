import React, { useEffect, useState } from "react";
import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { saveSearchHistory } from "../../utils/common";

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
          <Ionicons name="close-circle" size={20} color="#aaa" />
        </TouchableOpacity>
      ) : null}

      <TouchableOpacity style={styles.searchButton} onPress={handleSubmit}>
        <Ionicons name="search" size={22} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 25,
    paddingHorizontal: 16,
    height: 48,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 16,
    color: "#333",
    paddingRight: 40,
  },
  clearButton: {
    position: "absolute",
    right: "20%",
    height: "100%",
    justifyContent: "center",
  },
  searchButton: {
    position: "absolute",
    right: 0,
    height: 48,
    width: 64,
    backgroundColor: "#40B491",
    borderTopRightRadius: 25,
    borderBottomRightRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default SearchBar;
