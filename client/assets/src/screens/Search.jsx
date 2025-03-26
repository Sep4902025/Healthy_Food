import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Dimensions,
} from "react-native";
import MaterialCommunityIcons from "../components/common/VectorIcons/MaterialCommunityIcons";
import MainLayoutWrapper from "../components/layout/MainLayoutWrapper";
import SearchBar from "../components/common/SearchBar";
import DishedV2 from "../components/common/DishedV2";
import CategoryCard from "../components/common/CategoryCard";
import {
  getIngredientByName,
  getIngredientByType,
} from "../services/ingredient";
import { DishType } from "../constants/DishType";
import { getDishes } from "../services/dishes";
// import CustomToast from "../components/common/CustomToast";
import ShowToast from "../components/common/CustomToast";
import { getSearchHistory } from "../utils/common";
import { useTheme } from "../contexts/ThemeContext";

const WIDTH = Dimensions.get("window").width;

const CategoryButton = ({ title, isActive = false, onclick }) => (
  <TouchableOpacity
    style={[
      styles.categoryButton,
      { backgroundColor: isActive ? "#38B2AC" : "#F8E1D4" },
    ]}
    onPress={() => {
      onclick && onclick();
    }}
  >
    <Text
      style={[
        styles.categoryButtonText,
        { color: isActive ? "white" : "#FF6B00" },
      ]}
    >
      {title}
    </Text>
  </TouchableOpacity>
);

const SearchScreen = ({ route }) => {
  const [searchResults, setSearchResults] = useState([]);
  const [searchMode, setSearchMode] = useState("initial"); // 'initial', 'results'
  const [searchQuery, setSearchQuery] = useState("");
  const [history, setHistory] = useState([]);
  const [sortType, setSortType] = useState(""); // Sorting state
  const { theme } = useTheme();

  // const showToast = CustomToast();
  const loadHistory = async () => {
    const savedHistory = await getSearchHistory();
    setHistory(savedHistory);
  };

  useEffect(() => {
    if (route.params?.category || route.params?.searchQuery) {
      if (route.params?.category) {
        handleSearchByCategory(route.params?.category);
      }

      if (route.params?.searchQuery) {
        setSearchQuery(route.params?.searchQuery);
        handleSearch(route.params?.searchQuery);
      }
    } else {
      loadHistory();
    }
  }, [route.params?.category || route.params?.searchQuery]);

  useEffect(() => {
    if (searchResults.length > 0) {
      setSearchMode("results");
    }
  }, [searchResults]);

  const handleSearch = async (searchString) => {
    // loadHistory();
    // const response = await getIngredientByName(searchString);
    // if (response.status === 200) {
    //   setSearchResults(response.data?.data);
    //   setSearchMode("results");
    // }
    const response = await getDishes();
    if (response.status === 200) {
      const resultList = response.data?.data?.filter((item) =>
        item.name.toLowerCase().includes(searchString.toLowerCase())
      );
      if (resultList.length === 0) {
        ShowToast("error", "No results found");
      }
      setSearchResults(resultList);
    } else {
      ShowToast("error", "Something went wrong");
    }
    loadHistory();
  };

  const handleSearchByCategory = async (type) => {
    const response = await getDishes();

    setSearchQuery(type.name);
    if (response.status === 200) {
      const resultList = response.data?.data?.filter(
        (item) => item.type == type.name
      );
      if (resultList.length === 0) {
        ShowToast("error", "No results found");
      }
      setSearchResults(resultList);
    }
    loadHistory();

    // const response = await getIngredientByType(type);
    // if (response.status === 200) {
    //   setSearchResults(response.data?.data);
    //   setSearchMode("results");
    // }
  };

  const handleClear = () => {
    setSearchQuery("");
    setSearchResults([]);
    setSearchMode("initial");
  };

  const toggleSort = () => {
    setSortType((prev) => (prev !== "asc" ? "asc" : "desc"));
  };

  const filterResult = useMemo(() => {
    const filteredResult = [...searchResults];

    if (sortType === "asc") {
      filteredResult.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortType === "desc") {
      filteredResult.sort((a, b) => b.name.localeCompare(a.name));
    }

    return filteredResult;
  }, [searchResults, sortType]);

  const renderInitialContent = () => (
    <>
      {history.length > 0 && (
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>Your search history</Text>
          <View style={styles.categoryButtonsRow}>
            {history.map((item, key) => (
              <CategoryButton
                title={item}
                key={key}
                onclick={() => {
                  setSearchQuery(item);
                  handleSearch(item);
                }}
              />
            ))}
          </View>
        </View>
      )}

      <View style={styles.browseSection}>
        <Text style={styles.sectionTitle}>Browse by category</Text>
        <View style={styles.categoriesGrid}>
          {/* {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onPress={() => handleSearchByCategory(category.title)}
              // cardWidth={"30%"}
              // imageSize={WIDTH * 0.2}
            />
          ))} */}
          {Object.values(DishType).map((category, key) => (
            <CategoryCard
              key={key}
              onPress={() => handleSearchByCategory(category)}
              category={{
                id: key,
                ...category,
              }}
            />
          ))}
        </View>
      </View>
    </>
  );

  const renderResultsContent = () => (
    <View style={styles.resultsContainer}>
      <View style={styles.sortHeader}>
        <View />
        <TouchableOpacity style={{ ...styles.sortButton }} onPress={toggleSort}>
          <Text style={{ ...styles.sortText }}>
            Sort ({sortType || "none"})
          </Text>
          <MaterialCommunityIcons name="sort" size={20} color="#333" />
        </TouchableOpacity>
      </View>

      {filterResult.length > 0 ? (
        filterResult.map((item) => <DishedV2 key={item._id} item={item} />)
      ) : (
        <Text style={styles.noResultsText}>No results found</Text>
      )}
    </View>
  );

  return (
    <MainLayoutWrapper>
      <View style={styles.container}>
        <SearchBar
          placeholder="What do you need?"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmit={() => handleSearch(searchQuery)}
          onClear={handleClear}
        />
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {searchMode === "initial"
            ? renderInitialContent()
            : renderResultsContent()}
        </ScrollView>
      </View>
    </MainLayoutWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 25,
    marginLeft: 12,
    height: 48,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 16,
    fontSize: 16,
  },
  clearButton: {
    padding: 8,
  },
  searchButton: {
    height: 48,
    width: 48,
    backgroundColor: "#3CB4AD",
    borderTopRightRadius: 25,
    borderBottomRightRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  historySection: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    color: "#38B2AC",
    marginBottom: 12,
  },
  categoryButtonsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  categoryButtonText: {
    fontSize: 14,
  },
  browseSection: {
    marginTop: 24,
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
  },
  resultsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sortHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 4,
    borderRadius: 8,
    backgroundColor: "white",
    shadowColor: "#343C41",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,
  },
  sortText: {
    marginRight: 5,
    fontSize: 14,
  },
  resultCard: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    position: "relative",
  },
  resultInfo: {
    flex: 1,
    justifyContent: "center",
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  resultDescription: {
    fontSize: 12,
    color: "#999",
  },
  resultImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  favoriteButton: {
    position: "absolute",
    bottom: 16,
    right: 16,
  },
  noResultsText: {
    width: "100%",
    textAlign: "center",
    fontSize: 20,
  },
});

export default SearchScreen;
