import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Linking,
  Alert,
} from "react-native";
import MainLayoutWrapper from "../components/layout/MainLayoutWrapper";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import Ionicons from "../components/common/VectorIcons/Ionicons";
import PaddingScrollViewBottom from "../components/common/PaddingScrollViewBottom";
import { useDispatch, useSelector } from "react-redux";
import { favorSelector, userSelector } from "../redux/selectors/selector";
import { toggleFavorite } from "../redux/actions/favoriteThunk";
import MaterialCommunityIcons from "../components/common/VectorIcons/MaterialCommunityIcons";
import SpinnerLoading from "../components/common/SpinnerLoading";
import Rating from "../components/common/Rating";
import { useTheme } from "../contexts/ThemeContext";
import YoutubePlayer from "react-native-youtube-iframe";
import HomeService from "../services/dishes";

const HEIGHT = Dimensions.get("window").height;
const WIDTH = Dimensions.get("window").width;

function FavorAndSuggest({ route }) {
  const [dish, setDish] = useState(null);
  const [recipe, setRecipe] = useState(null);
  const [ingredientDetails, setIngredientDetails] = useState([]);
  const [loading, setLoading] = useState(true);

  const dispatch = useDispatch();
  const favorite = useSelector(favorSelector);
  const user = useSelector(userSelector);
  const { theme } = useTheme();

  // Load dish from route params
  useEffect(() => {
    console.log("Route Params Dish:", route?.params?.dish);
    if (route?.params?.dish) {
      setDish(route.params.dish);
    } else {
      setLoading(false);
      Alert.alert("Error", "Dish data is not available.");
    }
  }, [route?.params?.dish]);

  // Load recipe when dish changes
  useEffect(() => {
    if (!dish?._id || !dish?.recipeId) {
      setLoading(false);
      console.warn("Dish ID or Recipe ID is missing:", dish);
      return;
    }
    loadRecipe();
  }, [dish]);

  // Fetch ingredient details when recipe changes
  useEffect(() => {
    if (recipe?.ingredients?.length > 0) {
      console.log("Recipe Ingredients:", recipe.ingredients);
      fetchIngredientDetails();
    }
  }, [recipe]);

  const loadRecipe = async () => {
    setLoading(true);
    try {
      const response = await HomeService.getRecipeByRecipeId(dish._id, dish.recipeId);
      console.log("Fetched Recipe Response:", response);
      if (response.success) {
        setRecipe(response.data);
      } else {
        Alert.alert("Error", response.message || "Failed to load recipe.");
      }
    } catch (error) {
      console.error("Error loading recipe:", error);
      Alert.alert("Error", "An error occurred while loading the recipe.");
    } finally {
      setLoading(false);
    }
  };

  const fetchIngredientDetails = async () => {
    try {
      setLoading(true);
      const details = recipe.ingredients
        .map((ingredient) => {
          if (!ingredient?.ingredientId || typeof ingredient.ingredientId !== "object") {
            console.warn("Invalid ingredientId:", ingredient);
            return null;
          }
          return {
            ...ingredient.ingredientId, // Use the existing ingredient details
            quantity: ingredient?.quantity,
            unit: ingredient?.unit,
          };
        })
        .filter(Boolean);
      console.log("Final Ingredient Details:", details);
      setIngredientDetails(details);
    } catch (error) {
      console.error("Error processing ingredient details:", error);
      Alert.alert("Error", "Failed to load ingredient details.");
    } finally {
      setLoading(false);
    }
  };

  const isFavorite = (id) => favorite.favoriteList?.includes(id) || false;

  const handleOnSavePress = async (dish) => {
    if (!user?.userId) {
      Alert.alert("Error", "Please log in to save favorites.");
      return;
    }
    try {
      const isLiked = isFavorite(dish._id);
      await HomeService.toggleFavoriteDish(user.userId, dish._id, isLiked);
      dispatch(toggleFavorite({ id: dish._id }));
    } catch (error) {
      console.error("Error toggling favorite:", error);
      Alert.alert("Error", "Failed to toggle favorite.");
    }
  };

  const handleRate = (ratePoint) => {
    setRecipe((prev) => ({ ...prev, rate: ratePoint }));
  };

  const getYouTubeVideoId = (url) => {
    if (!url) return null;
    const regex =
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const renderRecipeCard = () => {
    const [index, setIndex] = useState(0);
    const [routes] = useState([
      { key: "ingredient", title: "Ingredient" },
      { key: "instructions", title: "Instructions" },
    ]);

    const IngredientsRoute = () => (
      <View style={styles.tabContent}>
        {loading ? (
          <SpinnerLoading />
        ) : (
          <>
            <Text style={{ ...styles.sectionTitle, color: theme.greyTextColor }}>
              {ingredientDetails.length} Ingredients
            </Text>
            {ingredientDetails.length > 0 ? (
              ingredientDetails
                .map((ingredient, idx) => {
                  if (!ingredient || typeof ingredient !== "object") {
                    console.warn("Invalid ingredient data:", ingredient);
                    return null;
                  }
                  return (
                    <View key={idx} style={styles.ingredientRow}>
                      <View style={styles.ingredientInfo}>
                        <Text style={{ ...styles.ingredientName, color: theme.greyTextColor }}>
                          {ingredient.name || "Unknown Ingredient"}
                        </Text>
                        {ingredient.type && (
                          <Text style={{ ...styles.ingredientDetail, color: theme.greyTextColor }}>
                            Type: {ingredient.type}
                          </Text>
                        )}
                        {ingredient.description && (
                          <Text style={{ ...styles.ingredientDetail, color: theme.greyTextColor }}>
                            {ingredient.description}
                          </Text>
                        )}
                      </View>
                      <Text style={{ ...styles.ingredientQuantity, color: theme.greyTextColor }}>
                        {ingredient.quantity || "N/A"} {ingredient.unit || ""}
                      </Text>
                    </View>
                  );
                })
                .filter(Boolean)
            ) : (
              <Text style={{ ...styles.noDataText, color: theme.greyTextColor }}>
                No ingredients available.
              </Text>
            )}
          </>
        )}
      </View>
    );

    const InstructionsRoute = () => {
      const videoId = getYouTubeVideoId(dish?.videoUrl);

      return (
        <ScrollView style={styles.tabContent}>
          {videoId ? (
            <View style={styles.videoContainer}>
              <YoutubePlayer
                height={200}
                play={false}
                videoId={videoId}
                onError={(error) => console.error("YouTube Player Error:", error)}
              />
            </View>
          ) : dish?.videoUrl ? (
            <TouchableOpacity
              style={styles.videoLink}
              onPress={() => Linking.openURL(dish.videoUrl)}
            >
              <Text style={styles.videoLinkText}>Watch Video Tutorial</Text>
            </TouchableOpacity>
          ) : null}

          <Text style={{ ...styles.sectionTitle, color: theme.greyTextColor, marginTop: 16 }}>
            Instructions
          </Text>
          {recipe?.instruction?.length > 0 ? (
            recipe.instruction.map((instruction, idx) => (
              <View key={idx} style={styles.instructionRow}>
                <Text style={{ ...styles.instructionStep, color: theme.greyTextColor }}>
                  Step {idx + 1}:
                </Text>
                <Text style={{ ...styles.instructionText, color: theme.greyTextColor }}>
                  {instruction?.description || "No description available."}
                </Text>
              </View>
            ))
          ) : (
            <Text style={{ ...styles.noDataText, color: theme.greyTextColor }}>
              No instructions available.
            </Text>
          )}
          <PaddingScrollViewBottom />
        </ScrollView>
      );
    };

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

    if (!dish?._id) {
      return (
        <View style={styles.container}>
          <Text style={{ ...styles.noDataText, color: theme.greyTextColor, textAlign: "center" }}>
            Dish data is not available.
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.recipeCard}>
        <Image source={{ uri: dish?.imageUrl }} style={styles.recipeImage} />
        <TouchableOpacity style={styles.heartIcon} onPress={() => handleOnSavePress(dish)}>
          {favorite.isLoading ? (
            <ActivityIndicator size={24} color="#FC8019" />
          ) : isFavorite(dish._id) ? (
            <MaterialCommunityIcons name="heart-multiple" size={24} color="#FF8A65" />
          ) : (
            <Ionicons name="heart-outline" size={24} color="#FF8A65" />
          )}
        </TouchableOpacity>
        <View style={{ ...styles.cardContent, backgroundColor: theme.cardBackgroundColor }}>
          <View style={styles.recipeHeader}>
            <Text style={{ ...styles.recipeName, color: theme.greyTextColor }}>{dish.name}</Text>
            <View style={styles.recipeRate}>
              <Rating rate={recipe?.rate ?? 0} starClick={handleRate} size={WIDTH * 0.06} />
            </View>
          </View>
          <Text style={{ ...styles.recipeDescription, color: theme.greyTextColor }}>
            {dish.description}
          </Text>

          <View style={styles.nutritionInfo}>
            <View style={styles.nutritionItem}>
              <Ionicons name="restaurant-outline" size={16} color="#78909C" />
              <Text style={styles.nutritionText}>{recipe?.totalCarbs ?? 0} carbs</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Ionicons name="fitness-outline" size={16} color="#78909C" />
              <Text style={styles.nutritionText}>{recipe?.totalProtein ?? 0} proteins</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Ionicons name="flame-outline" size={16} color="#78909C" />
              <Text style={styles.nutritionText}>{recipe?.totalCalories ?? 0} Kcal</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Ionicons name="water-outline" size={16} color="#78909C" />
              <Text style={styles.nutritionText}>{recipe?.totalFat ?? 0} fats</Text>
            </View>
          </View>

          <View style={styles.tabViewContainer}>
            <TabView
              navigationState={{ index, routes }}
              renderScene={renderScene}
              onIndexChange={setIndex}
              initialLayout={{ width: WIDTH - 32 }}
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
          {renderRecipeCard()}
          <PaddingScrollViewBottom />
        </ScrollView>
      </View>
    </MainLayoutWrapper>
  );
}

// Styles remain the same
const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    paddingHorizontal: 16,
  },
  tabView: {
    marginTop: 8,
    minHeight: 300,
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
  ingredientInfo: {
    flex: 1,
    marginRight: 10,
  },
  ingredientName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#455A64",
  },
  ingredientDetail: {
    fontSize: 12,
    color: "#78909C",
    marginTop: 2,
  },
  ingredientQuantity: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#263238",
  },
  instructionRow: {
    marginBottom: 12,
  },
  instructionStep: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#455A64",
    marginBottom: 4,
  },
  instructionText: {
    fontSize: 14,
    color: "#455A64",
    lineHeight: 20,
  },
  videoContainer: {
    marginBottom: 16,
    borderRadius: 8,
    overflow: "hidden",
  },
  videoLink: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  videoLinkText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  noDataText: {
    fontSize: 14,
    color: "#78909C",
    textAlign: "center",
  },
});

export default FavorAndSuggest;
