import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from "react-native";
import MaterialCommunityIcons from "../components/common/VectorIcons/MaterialCommunityIcons";
import MainLayoutWrapper from "../components/layout/MainLayoutWrapper";
import DishedV1 from "../components/common/DishedV1";
import { getDishes } from "../services/dishes";

const List = () => {
  const [dishes, setDishes] = useState([]);
  const [sortType, setSortType] = useState(""); // Sorting state
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDishes();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDishes();
    setRefreshing(false);
  };

  const loadDishes = async () => {
    const response = await getDishes();
    if (response.status === 200) {
      setDishes(response.data?.data);
    }
  };

  const toggleSort = () => {
    setSortType((prev) => (prev !== "asc" ? "asc" : "desc"));
  };

  const filterDishes = useMemo(() => {
    const filteredDishes = [...dishes];

    if (sortType === "asc") {
      filteredDishes.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortType === "desc") {
      filteredDishes.sort((a, b) => b.name.localeCompare(a.name));
    }

    return filteredDishes;
  }, [dishes, sortType]); // Added `sortType` as a dependency

  return (
    <MainLayoutWrapper>
      <View style={styles.container}>
        {/* <View style={styles.header}>
          <Text style={styles.headerTitle}>Desserts</Text>
          <View style={styles.headerRight}>
            <Text style={styles.viewAllText}>View All</Text>
          </View>
        </View> */}

        <View style={styles.sortHeader}>
          <View />
          <TouchableOpacity
            style={{ ...styles.sortButton }}
            onPress={toggleSort}
          >
            <Text style={{ ...styles.sortText }}>
              Sort ({sortType || "none"})
            </Text>
            <MaterialCommunityIcons name="sort" size={20} color="#333" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={{ paddingHorizontal: 2 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {filterDishes.map((dish) => (
            <DishedV1 dish={dish} key={dish._id} />
          ))}
        </ScrollView>
      </View>
    </MainLayoutWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    overflow: "visible",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewAllText: {
    color: "#38B2AC",
    fontSize: 14,
  },
  sortHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
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
    marginBottom: 12,
  },
  sortText: {
    marginRight: 5,
    fontSize: 14,
    color: "#333",
  },
});

export default List;
