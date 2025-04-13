import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import MaterialCommunityIcons from "../components/common/VectorIcons/MaterialCommunityIcons";
import MainLayoutWrapper from "../components/layout/MainLayoutWrapper";
import SearchBar from "../components/common/SearchBar";
import DishedV2 from "../components/common/DishedV2";
import CategoryCard from "../components/common/CategoryCard";
import { DishType } from "../constants/DishType";
import ShowToast from "../components/common/CustomToast";
import { getSearchHistory } from "../utils/common";
import { useTheme } from "../contexts/ThemeContext";
import { ScreensName } from "../constants/ScreensName";
import dishService from "../services/dishService";

const WIDTH = Dimensions.get("window").width;

const CategoryButton = ({ title, isActive = false, onclick }) => (
  <TouchableOpacity
    style={[styles.categoryButton, { backgroundColor: isActive ? "#38B2AC" : "#F8E1D4" }]}
    onPress={() => {
      onclick && onclick();
    }}
  >
    <Text style={[styles.categoryButtonText, { color: isActive ? "white" : "#FF6B00" }]}>
      {title}
    </Text>
  </TouchableOpacity>
);

const SearchScreen = ({ route, navigation }) => {
  const [searchResults, setSearchResults] = useState([]);
  const [searchMode, setSearchMode] = useState("initial");
  const [searchQuery, setSearchQuery] = useState("");
  const [history, setHistory] = useState([]);
  const [sortType, setSortType] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState({ initial: false, more: false });
  const [searchType, setSearchType] = useState("name");
  const [category, setCategory] = useState("");
  const limit = 10;
  const { theme } = useTheme();

  const loadHistory = async () => {
    const savedHistory = await getSearchHistory();
    setHistory(savedHistory);
  };

  useEffect(() => {
    if (route.params?.category || route.params?.searchQuery) {
      if (route.params?.category) {
        setSearchQuery(route.params.category.name);
        handleSearchByCategory(route.params.category.name, 1, true);
      }

      if (route.params?.searchQuery) {
        setSearchQuery(route.params.searchQuery);
        handleSearch(route.params.searchQuery, 1, true);
      }
    } else {
      loadHistory();
    }
  }, [route.params?.category, route.params?.searchQuery]);

  useEffect(() => {
    if (searchResults.length > 0) {
      setSearchMode("results");
    } else if (searchMode === "results" && !loading.initial) {
      ShowToast("error", "No results found");
    }
  }, [searchResults, searchMode, loading.initial]);

  const handleSearch = async (searchString, pageNum = 1, isRefresh = false) => {
    setLoading((prev) => ({ ...prev, initial: isRefresh }));
    setSearchType("name");

    try {
      const params = {
        name: searchString,
        page: pageNum,
        limit,
        sort: "createdAt",
        order: "desc",
      };
      const response = await dishService.searchDishByName(params);

      if (response.status === "success") {
        const newDishes = response.data.items;

        setSearchResults((prev) => {
          const existingIds = new Set(isRefresh ? [] : prev.map((dish) => dish._id));
          const filteredNewDishes = newDishes.filter((dish) => !existingIds.has(dish._id));
          return isRefresh ? filteredNewDishes : [...prev, ...filteredNewDishes];
        });

        setPage(pageNum);
        setHasMore(pageNum < response.data.totalPages);
      } else {
        ShowToast("error", response.message || "Something went wrong");
        setHasMore(false);
      }
    } catch (error) {
      ShowToast("error", error.message || "Something went wrong");
      setHasMore(false);
    } finally {
      setLoading((prev) => ({ ...prev, initial: false }));
    }

    loadHistory();
  };

  const handleSearchByCategory = async (typeName, pageNum = 1, isRefresh = false) => {
    setLoading((prev) => ({ ...prev, initial: isRefresh }));
    setSearchType("category");
    setCategory(typeName);

    try {
      const params = {
        page: pageNum,
        limit,
        sort: "createdAt",
        order: "desc",
      };
      const response = await dishService.getDishByType(typeName, params);

      if (response.status === "success") {
        const newDishes = response.data.items;

        setSearchResults((prev) => {
          const existingIds = new Set(isRefresh ? [] : prev.map((dish) => dish._id));
          const filteredNewDishes = newDishes.filter((dish) => !existingIds.has(dish._id));
          return isRefresh ? filteredNewDishes : [...prev, ...filteredNewDishes];
        });

        setPage(pageNum);
        setHasMore(pageNum < response.data.totalPages);
      } else {
        ShowToast("error", response.message || "No results found");
        setHasMore(false);
      }
    } catch (error) {
      ShowToast("error", error.message || "Failed to fetch dishes by type");
      setHasMore(false);
    } finally {
      setLoading((prev) => ({ ...prev, initial: false }));
    }

    loadHistory();
  };

  const loadMoreResults = async () => {
    if (!hasMore || loading.more) return;
    setLoading((prev) => ({ ...prev, more: true }));

    if (searchType === "name") {
      await handleSearch(searchQuery, page + 1);
    } else if (searchType === "category") {
      await handleSearchByCategory(category, page + 1);
    }

    setLoading((prev) => ({ ...prev, more: false }));
  };

  const handleClear = () => {
    setSearchQuery("");
    setSearchResults([]);
    setSearchMode("initial");
    setPage(1);
    setHasMore(true);
    setSearchType("name");
    setCategory("");
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

  const handleScroll = useCallback(
    ({ nativeEvent }) => {
      const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
      const paddingToBottom = 20;
      if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
        loadMoreResults();
      }
    },
    [hasMore, loading.more, page, searchType, searchQuery, category]
  );

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
                  handleSearch(item, 1, true);
                }}
              />
            ))}
          </View>
        </View>
      )}

      <View style={styles.browseSection}>
        <Text style={styles.sectionTitle}>Browse by category</Text>
        <View style={styles.categoriesGrid}>
          {Object.values(DishType).map((category, key) => (
            <CategoryCard
              key={key}
              onPress={() => handleSearchByCategory(category.name, 1, true)}
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
        <TouchableOpacity style={styles.sortButton} onPress={toggleSort}>
          <Text style={styles.sortText}>Sort ({sortType || "none"})</Text>
          <MaterialCommunityIcons name="sort" size={20} color="#333" />
        </TouchableOpacity>
      </View>

      {loading.initial ? (
        <ActivityIndicator size="large" color="#38B2AC" style={styles.loading} />
      ) : filterResult.length > 0 ? (
        filterResult.map((item) => (
          <DishedV2
            key={item._id}
            item={item}
            onPress={() => navigation.navigate(ScreensName.favorAndSuggest, { dish: item })}
          />
        ))
      ) : (
        <Text style={styles.noResultsText}>No results found</Text>
      )}

      {loading.more && (
        <ActivityIndicator size="large" color="#38B2AC" style={styles.loadingMore} />
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
          onSubmit={() => handleSearch(searchQuery, 1, true)}
          onClear={handleClear}
        />
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {searchMode === "initial" ? renderInitialContent() : renderResultsContent()}
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
  noResultsText: {
    width: "100%",
    textAlign: "center",
    fontSize: 20,
  },
  loading: {
    marginVertical: 20,
  },
  loadingMore: {
    marginVertical: 20,
  },
});

export default SearchScreen;
