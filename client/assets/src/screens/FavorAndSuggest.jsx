import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  useWindowDimensions,
  ActivityIndicator,
} from "react-native";
import MainLayoutWrapper from "../components/layout/MainLayoutWrapper";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import Ionicons from "../components/common/VectorIcons/Ionicons";
import PaddingScrollViewBottom from "../components/common/PaddingScrollViewBottom";
import { useDispatch, useSelector } from "react-redux";
import { favorSelector } from "../redux/selectors/selector";
import { toggleFavorite } from "../redux/actions/favoriteThunk";
import MaterialCommunityIcons from "../components/common/VectorIcons/MaterialCommunityIcons";
import { getRecipesById } from "../services/dishes";
import SpinnerLoading from "../components/common/SpinnerLoading";
import Rating from "../components/common/Rating";
import { getIngredient } from "../services/ingredient";
import { useTheme } from "../contexts/ThemeContext";
const HEIGHT = Dimensions.get("window").height;
const WIDTH = Dimensions.get("window").width;

function FavorAndSuggest({ route }) {
  const [dish, setDish] = useState({});
  const [recipe, setRecipe] = useState({});
  const [ingredientDetails, setIngredientDetails] = useState([]);
  const dispatch = useDispatch();
  const favorite = useSelector(favorSelector);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    setDish(route.params.dish);
  }, [route.params.dish]);

  useEffect(() => {
    loadRecipe();
  }, [dish]);

  useEffect(() => {
    const fetchIngredientDetails = async () => {
      if (!recipe?.ingredients?.length) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const detailsObj = [];

        // Create an array of promises for all ingredient fetches
        const promises = recipe.ingredients.map(async (ingredient) => {
          if (!ingredient?.ingredientId) return;

          const response = await getIngredient(ingredient.ingredientId);
          if (response?.data?.data) {
            detailsObj.push({
              ...response.data.data,
              quantity: ingredient?.quantity,
              unit: ingredient?.unit,
            });
          }
        });

        
        await Promise.all(promises);

        setIngredientDetails(detailsObj);
      } catch (error) {
        console.error("Error fetching ingredient details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchIngredientDetails();
  }, [recipe]);

  const loadRecipe = async () => {
    setLoading(true);
    const response = await getRecipesById(dish._id, dish?.recipe_id);
    setRecipe(response?.data?.data);
    setLoading(false);
  };

  const isFavorite = (id) => {
    return favorite.favoriteList?.includes(id);
  };

  const handleOnSavePress = (dish) => {
    dispatch(toggleFavorite({ id: dish._id }));
  };

  const handleRate = (ratePoint) => {
    setRecipe((prev) => ({ ...prev, rate: ratePoint }));
  };

  const layout = useWindowDimensions();

  const renderRecipeCard = () => {
    const [index, setIndex] = useState(0);
    const [routes] = useState([
      { key: "ingredient", title: "Ingredient" },
      { key: "instructions", title: "Instructions" },
    ]);

    const IngredientsRoute = () => {
      if (loading) {
        return <SpinnerLoading />;
      }

      return (
        <ScrollView style={styles.tabContent}>
          <Text style={{ ...styles.sectionTitle, color: theme.greyTextColor }}>
            {recipe?.ingredients?.length ?? 0} Ingredients
          </Text>
          {ingredientDetails?.map((ingredient, idx) => (
            <View key={idx} style={styles.ingredientRow}>
              <Text
                style={{ ...styles.ingredientName, color: theme.greyTextColor }}
              >
                {ingredient?.name}
              </Text>
              <Text
                style={{
                  ...styles.ingredientQuantity,
                  color: theme.greyTextColor,
                }}
              >
                {ingredient?.quantity} {ingredient?.unit}
              </Text>
            </View>
          ))}
          <PaddingScrollViewBottom />
        </ScrollView>
      );
    };

    const InstructionsRoute = () => (
      <ScrollView style={styles.tabContent}>
        {recipe?.instruction?.map((instruction, idx) => (
          <Text
            key={idx}
            style={{ ...styles.instructionText, color: theme.greyTextColor }}
          >
            • {instruction?.description}
          </Text>
        ))}
        <PaddingScrollViewBottom />
      </ScrollView>
    );

    const renderScene = SceneMap({
      ingredient: IngredientsRoute,
      instructions: InstructionsRoute,
    });

    const renderTabBar = (props) => (
      <TabBar
        {...props}
        indicatorStyle={{
          backgroundColor: "#4CAF50",
          height: "80%",
          width: "45%",
          borderRadius: 8,
          marginHorizontal: "2.5%",
          marginVertical: "10%",
        }}
        style={{ backgroundColor: "#C4F9D7", borderRadius: 8 }}
        labelStyle={{ color: "#000000", fontSize: 14, textTransform: "none" }}
        activeColor="#ffffff"
        inactiveColor="#000000"
        pressColor="rgba(76, 175, 80, 0.1)"
      />
    );

    return (
      <View key={dish._id} style={styles.recipeCard}>
        <Image source={{ uri: dish?.image_url }} style={styles.recipeImage} />
        <TouchableOpacity
          style={styles.heartIcon}
          onPress={() => handleOnSavePress(dish)}
        >
          {favorite.isLoading ? (
            <ActivityIndicator size={24} color="#FC8019" />
          ) : isFavorite(dish._id) ? (
            <MaterialCommunityIcons
              name="heart-multiple"
              size={24}
              color="#FF8A65"
            />
          ) : (
            <Ionicons name="heart-outline" size={24} color="#FF8A65" />
          )}
        </TouchableOpacity>
        <View
          style={{
            ...styles.cardContent,
            backgroundColor: theme.cardBackgroundColor,
          }}
        >
          <View style={styles.recipeHeader}>
            <Text style={{ ...styles.recipeName, color: theme.greyTextColor }}>
              {dish.name}
            </Text>
            <View style={styles.recipeRate}>
              <Rating
                rate={recipe?.rate ?? 0}
                starClick={handleRate}
                size={WIDTH * 0.06}
              />
            </View>
          </View>
          <Text
            style={{ ...styles.recipeDescription, color: theme.greyTextColor }}
          >
            {dish.description}
          </Text>

          <View style={styles.nutritionInfo}>
            <View style={styles.nutritionItem}>
              <Ionicons name="restaurant-outline" size={16} color="#78909C" />
              <Text style={styles.nutritionText}>
                {recipe?.totalCarbs ?? 0} carbs
              </Text>
            </View>
            <View style={styles.nutritionItem}>
              <Ionicons name="fitness-outline" size={16} color="#78909C" />
              <Text style={styles.nutritionText}>
                {recipe?.totalProtein ?? 0} proteins
              </Text>
            </View>
            <View style={styles.nutritionItem}>
              <Ionicons name="flame-outline" size={16} color="#78909C" />
              <Text style={styles.nutritionText}>
                {recipe?.totalCalories ?? 0} Kcal
              </Text>
            </View>
            <View style={styles.nutritionItem}>
              <Ionicons name="water-outline" size={16} color="#78909C" />
              <Text style={styles.nutritionText}>
                {recipe?.totalFat ?? 0} fats
              </Text>
            </View>
          </View>

          <View style={styles.tabViewContainer}>
            <TabView
              navigationState={{ index, routes }}
              renderScene={renderScene}
              onIndexChange={setIndex}
              initialLayout={{ width: layout.width - 32 }}
              renderTabBar={renderTabBar}
              style={styles.tabView}
            />
          </View>
        </View>

        
      </View>
    );
  };

  return (
    <MainLayoutWrapper>
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {renderRecipeCard(dish)}
        </ScrollView>
      </View>
    </MainLayoutWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#455A64",
  },
  recipeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recipeImage: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  heartIcon: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 20,
    padding: 8,
  },
  cardContent: {
    padding: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    transform: [{ translateY: -10 }],
    // backgroundColor: "white",
  },
  recipeHeader: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
    alignItems: "center",
  },
  recipeName: {
    width: "50%",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#263238",
  },
  recipeRate: {
    width: "50%",
    alignItems: "flex-end",
    paddingRight: 12,
  },
  recipeDescription: {
    fontSize: 14,
    color: "#546E7A",
    marginBottom: 16,
  },
  nutritionInfo: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  nutritionItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    marginBottom: 8,
  },
  nutritionText: {
    fontSize: 12,
    color: "#78909C",
    marginLeft: 4,
  },
  tabViewContainer: {
    height: HEIGHT * 0.5, 
    paddingHorizontal: 16,
  },
  tabView: {
    marginTop: 8,
  },
  tabContent: {
    paddingTop: 16,
    
    paddingHorizontal: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 12,
    color: "#37474F",
  },
  ingredientRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ECEFF1",
  },
  ingredientName: {
    color: "#455A64",
  },
  ingredientQuantity: {
    fontWeight: "bold",
    color: "#263238",
  },
  instructionText: {
    fontSize: 14,
    color: "#455A64",
    marginBottom: 8,
    lineHeight: 20,
  },
  avatarContainer: {
    position: "absolute",
    bottom: 16,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E0F2F1",
    borderWidth: 2,
    borderColor: "#B2DFDB",
  },
});

export default FavorAndSuggest;
