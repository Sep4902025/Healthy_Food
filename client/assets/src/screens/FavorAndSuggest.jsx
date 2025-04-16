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
  TextInput,
  Modal,
} from "react-native";
import MainLayoutWrapper from "../components/layout/MainLayoutWrapper";
import { TabView, SceneMap, TabBar, TabBarItem } from "react-native-tab-view";
import Ionicons from "../components/common/VectorIcons/Ionicons";
import { useDispatch, useSelector } from "react-redux";
import { favorSelector, userSelector } from "../redux/selectors/selector";
import { toggleFavorite } from "../redux/actions/favoriteThunk";
import MaterialCommunityIcons from "../components/common/VectorIcons/MaterialCommunityIcons";
import SpinnerLoading from "../components/common/SpinnerLoading";
import Rating from "../components/common/Rating";
import { useTheme } from "../contexts/ThemeContext";
import YoutubePlayer from "react-native-youtube-iframe";
import HomeService from "../services/HomeService";
import { getIngredient } from "../services/ingredient";
import commentService from "./../services/commentService";
import { useNavigation } from "@react-navigation/native";
import RatingModal from "../components/common/RatingModal";
import styles from "./../css/FavorAndSuggestCss";
import { Heart } from "lucide-react-native";
const HEIGHT = Dimensions.get("window").height;
const WIDTH = Dimensions.get("window").width;

function FavorAndSuggest({ route }) {
  const [dish, setDish] = useState(null);
  const [recipe, setRecipe] = useState(null);
  const [ingredientDetails, setIngredientDetails] = useState([]);
  const [personalRate, setPersonalRate] = useState({});
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const dispatch = useDispatch();
  const favorite = useSelector(favorSelector);
  const user = useSelector(userSelector);
  const { theme } = useTheme();
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const navigation = useNavigation();
  const [comment, setComment] = useState([]);
  const [commentList, setCommentList] = useState([]);

  useEffect(() => {
    if (route?.params?.dish) {
      setDish(route.params.dish);
    } else {
      setLoading(false);
      Alert.alert("Error", "Dish data is not available.");
    }
  }, [route?.params?.dish]);

  const submitComment = async (commentText) => {
    if (!user?._id) {
      setLoginModalVisible(true);
      return;
    }

    try {
      const res = await commentService.addComment(
        dish._id,
        commentText,
        user._id
      );
      if (!res.success) {
        Alert.alert("Error", res.message || "Failed to submit comment.");
        return;
      }
      const newComment = res.data;
      setCommentList((prev) => [newComment, ...prev]);
      setComment("");
      Alert.alert("Success", "Your comment has been submitted!");
    } catch (error) {
      console.error("Submit comment error:", error);
      Alert.alert("Error", "Failed to submit comment. Please try again.");
    }
  };

  useEffect(() => {
    const fetchComments = async () => {
      if (!dish?._id) return;

      setLoading(true);
      try {
        const res = await commentService.getCommentsByDishId(dish._id);
        let cmtList = res?.data;

        if (Array.isArray(cmtList)) {
          cmtList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

          // ✅ Gán thêm isLiked cho mỗi comment
          const commentsWithIsLiked = cmtList.map((comment) => ({
            ...comment,
            isLiked: comment.likedBy?.includes(user?._id),
          }));

          setCommentList(commentsWithIsLiked);
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách comment:", error);
      }

      setLoading(false);
    };

    fetchComments();
  }, [dish, user?._id]); // nhớ thêm `user._id` để refetch đúng khi user thay đổi

  const handleLike = async (commentId) => {
    try {
      if (!user?._id || !user) {
        setLoginModalVisible(true);
        return;
      }

      const res = await commentService.toggleLikeComment(commentId, user._id);

      if (res.success) {
        const updatedComments = commentList.map((item) =>
          item._id === commentId
            ? {
                ...item,
                isLiked: !item.isLiked,
                likeCount: item.isLiked
                  ? item.likeCount - 1
                  : item.likeCount + 1,
              }
            : item
        );
        setCommentList(updatedComments);
      } else {
        console.warn("Toggle like failed:", res.message);
      }
    } catch (error) {
      console.log("Like error", error);
    }
  };

  const fetchRating = async () => {
    if (!recipe?._id || !user?._id) return;

    try {
      const response = await commentService.getRatingsByRecipe(recipe._id);
      const ratings = response?.data;
      if (ratings && Array.isArray(ratings)) {
        const myRating = ratings.find(
          (rating) =>
            rating.userId._id === user._id && rating.recipeId === recipe._id
        );
        const total = ratings.reduce((sum, r) => sum + r.star, 0);
        const average = ratings.length > 0 ? total / ratings.length : 0;
        setRating(myRating ?? null);
        setAverageRating(average.toFixed(1));
        console.log("⭐️ My rating:", myRating);
      } else {
        console.warn("Không nhận được dữ liệu từ getRatingsByRecipe");
      }
    } catch (error) {
      console.error("Lỗi khi gọi getRatingsByRecipe:", error);
    }
  };

  const handleRate = async (ratePoint) => {
    setRecipe((prev) => ({ ...prev, rate: ratePoint }));
    try {
      const res = await commentService.rateRecipe(
        dish.recipeId,
        user._id,
        ratePoint
      );

      console.log("⭐️ Đánh giá thành công:", res);

      await fetchRating();
    } catch (err) {
      console.error("Lỗi khi gọi rateRecipe:", err);
    }
  };

  // Load rating
  useEffect(() => {
    fetchRating();
  }, [recipe, user]);

  // Load recipe when dish changes
  useEffect(() => {
    if (!dish?._id || !dish?.recipeId) {
      setLoading(false);
      console.warn("Dish ID or Recipe ID is missing:", dish);
      return;
    }
    loadRecipe();
    loadRate();
  }, [dish]);

  // Fetch ingredient details when recipe changes
  useEffect(() => {
    const fetchIngredientDetails = async () => {
      if (!recipe?.ingredients?.length) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const detailsObj = [];

        const promises = recipe.ingredients.map(async (ingredient) => {
          console.log("Ingredient:", ingredient);
          console.log("Ingredient ID:", ingredient?.ingredientId);

          if (!ingredient?.ingredientId) return;

          const ingredientId =
            typeof ingredient.ingredientId === "object" &&
            ingredient.ingredientId?._id
              ? ingredient.ingredientId._id
              : ingredient.ingredientId;

          if (!ingredientId || typeof ingredientId !== "string") {
            console.warn("Invalid ingredientId:", ingredientId);
            return;
          }

          const response = await getIngredient(ingredientId);
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

  const loadRate = async () => {
    const response = await getRatingsByRecipeId(dish.recipeId);
    if (response?.status === 200) {
      const findRate = response?.data?.data?.find(
        (item) => item?.userId?._id === user?._id
      );
      if (findRate) {
        setPersonalRate(findRate);
      }
    } else {
      console.log(response?.response?.data);
    }
  };

  const loadRecipe = async () => {
    setLoading(true);

    try {
      const response = await HomeService.getRecipeByRecipeId(
        dish._id,
        dish.recipeId
      );
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

  const isFavorite = (id) => {
    return favorite.favoriteList?.includes(id);
  };

  const handleOnSavePress = async (dish) => {
    if (!user?._id) {
      Alert.alert("Error", "Please log in to save favorites.");
      return;
    }
    try {
      // const isLiked = isFavorite(dish._id);
      // await HomeService.toggleFavoriteDish(user.userId, dish._id, isLiked);
      dispatch(toggleFavorite({ id: dish._id }));
    } catch (error) {
      console.error("Error toggling favorite:", error);
      Alert.alert("Error", "Failed to toggle favorite.");
    }
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
      { key: "comments", title: "Comments" },
    ]);

    const IngredientsRoute = () => (
      <ScrollView
        style={{ ...styles.tabContent }}
        nestedScrollEnabled={true}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <SpinnerLoading />
        ) : (
          <>
            <Text
              style={{ ...styles.sectionTitle, color: theme.greyTextColor }}
            >
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
                      <Image
                        source={{ uri: ingredient.imageUrl }}
                        style={styles.ingredientImage}
                      />
                      <View style={styles.ingredientInfo}>
                        <Text
                          style={{
                            ...styles.ingredientName,
                            color: theme.greyTextColor,
                          }}
                        >
                          {ingredient.name || "Unknown Ingredient"}
                        </Text>
                        {ingredient.type && (
                          <Text
                            style={{
                              ...styles.ingredientDetail,
                              color: theme.greyTextColor,
                            }}
                          >
                            Type: {ingredient.type}
                          </Text>
                        )}
                        {ingredient.description && (
                          <Text
                            style={{
                              ...styles.ingredientDetail,
                              color: theme.greyTextColor,
                            }}
                          >
                            {ingredient.description}
                          </Text>
                        )}
                      </View>
                      <Text
                        style={{
                          ...styles.ingredientQuantity,
                          color: theme.greyTextColor,
                        }}
                      >
                        {ingredient.quantity || "N/A"} {ingredient.unit || ""}
                      </Text>
                    </View>
                  );
                })
                .filter(Boolean)
            ) : (
              <Text
                style={{ ...styles.noDataText, color: theme.greyTextColor }}
              >
                Failed to load ingredients. Please try again later.
              </Text>
            )}
          </>
        )}
      </ScrollView>
    );

    const InstructionsRoute = () => {
      const videoId = getYouTubeVideoId(dish?.videoUrl);

      return (
        <ScrollView
          style={styles.tabContent}
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={false}
        >
          {videoId ? (
            <View style={styles.videoContainer}>
              <YoutubePlayer
                height={200}
                play={false}
                videoId={videoId}
                onError={(error) =>
                  console.error("YouTube Player Error:", error)
                }
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

          <Text
            style={{
              ...styles.sectionTitle,
              color: theme.greyTextColor,
              marginTop: 16,
            }}
          >
            Instructions
          </Text>
          {recipe?.instruction?.length > 0 ? (
            recipe.instruction.map((instruction, idx) => (
              <View key={idx} style={styles.instructionRow}>
                <Text
                  style={{
                    ...styles.instructionStep,
                    color: theme.greyTextColor,
                  }}
                >
                  Step {idx + 1}:
                </Text>
                <Text
                  style={{
                    ...styles.instructionText,
                    color: theme.greyTextColor,
                  }}
                >
                  {instruction?.description || "No description available."}
                </Text>
              </View>
            ))
          ) : (
            <Text style={{ ...styles.noDataText, color: theme.greyTextColor }}>
              No instructions available.
            </Text>
          )}
        </ScrollView>
      );
    };

    const CommentRatingRoute = () => (
      <ScrollView
        style={styles.tabContent}
        nestedScrollEnabled={true}
        showsVerticalScrollIndicator={false}
      >
        <Text style={{ ...styles.sectionTitle, color: theme.greyTextColor }}>
          All Comments
        </Text>

        {/* Danh sách bình luận */}
        {commentList.length > 0 ? (
          commentList.map((comment, index) => (
            <View key={index} style={styles.commentBox}>
              {/* Avatar + tên người dùng + đánh giá sao */}
              <View style={styles.commentHeader}>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      ...styles.commentUser,
                      color: theme.greyTextColor,
                    }}
                  >
                    {comment.userId.email || "Anonymous"}
                  </Text>
                  {comment.star !== undefined && (
                    <Text
                      style={{
                        ...styles.commentRating,
                        color: theme.greyTextColor,
                      }}
                    >
                      Rating: {comment.star} ★
                    </Text>
                  )}
                </View>
              </View>

              {/* Nội dung bình luận */}
              <Text
                style={{ ...styles.commentText, color: theme.greyTextColor }}
              >
                {comment.text}
              </Text>

              {/* Nút like + số lượt like */}
              <View style={styles.commentFooter}>
                <TouchableOpacity
                  style={styles.likeButton}
                  onPress={() => handleLike(comment._id)}
                >
                  <Heart
                    size={20}
                    color={comment.isLiked ? "red" : "gray"}
                    fill={comment.isLiked ? "red" : "none"}
                  />
                  <Text style={styles.likeCount}>{comment.likeCount || 0}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <Text style={{ ...styles.noDataText, color: theme.greyTextColor }}>
            No comments yet. Be the first to share your thoughts!
          </Text>
        )}
      </ScrollView>
    );

    if (loading) {
      return <Text style={{ padding: 16 }}>Đang tải dữ liệu...</Text>;
    }

    const renderScene = SceneMap({
      ingredient: IngredientsRoute,
      instructions: InstructionsRoute,
      comments: CommentRatingRoute,
    });

    const renderTabBar = (props) => (
      <TabBar
        {...props}
        indicatorStyle={{
          backgroundColor: "#4CAF50",
          height: "80%",
          width: "28%",
          borderRadius: 8,
          marginHorizontal: "2.5%",
          marginVertical: "10%",
        }}
        style={{ backgroundColor: "#C4F9D7", borderRadius: 8, fontSize: 8 }}
        renderTabBarItem={({ key, ...props }) => (
          <TabBarItem
            key={key}
            {...props}
            labelStyle={{ fontSize: 12 }} // Set your desired font size here
          />
        )}
        activeColor="#ffffff"
        inactiveColor="#000000"
        pressColor="rgba(76, 175, 80, 0.1)"
      />
    );

    if (!dish?._id) {
      return (
        <View style={styles.container}>
          <Text
            style={{
              ...styles.noDataText,
              color: theme.greyTextColor,
              textAlign: "center",
            }}
          >
            Dish data is not available.
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.recipeCard}>
        <Image source={{ uri: dish?.imageUrl }} style={styles.recipeImage} />
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
              <Text
                style={{ fontSize: 14, marginBottom: 4 }}
                className="text-yellow-500 font-semibold"
              >
                Average Rating:
              </Text>

              <Rating rate={averageRating ?? 0} size={WIDTH * 0.06} disabled />

              <TouchableOpacity
                onPress={() => {
                  if (!user?._id) {
                    setLoginModalVisible(true);
                  } else {
                    setRatingModalVisible(true);
                  }
                }}
                style={styles.openModal}
              >
                <Text style={{ fontSize: 14, color: "#40B491" }}>
                  Rating now
                </Text>
              </TouchableOpacity>
            </View>

            <Modal
              visible={loginModalVisible}
              animationType="fade"
              transparent
              onRequestClose={() => setLoginModalVisible(false)}
            >
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "rgba(0,0,0,0.5)",
                }}
              >
                <View
                  style={{
                    backgroundColor: "#fff",
                    padding: 20,
                    borderRadius: 10,
                    width: "80%",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ fontSize: 16, marginBottom: 10 }}>
                    You need to sign in to do this action.
                  </Text>

                  <TouchableOpacity
                    onPress={() => {
                      setLoginModalVisible(false);
                      navigation.navigate("signin");
                    }}
                    style={styles.loginButton}
                  >
                    <Text style={{ color: "#fff", fontWeight: "bold" }}>
                      Sign In
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setLoginModalVisible(false)}
                    style={{ marginTop: 10 }}
                  >
                    <Text style={{ color: "#888" }}>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

            <RatingModal
              visible={ratingModalVisible}
              onClose={() => setRatingModalVisible(false)}
              rating={rating}
              setRating={setRating}
              comment={comment}
              setComment={setComment}
              handleRate={handleRate}
              submitComment={submitComment}
            />
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
              initialLayout={{ width: WIDTH - 16 }}
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
        <ScrollView
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
        >
          {renderRecipeCard()}
        </ScrollView>
      </View>
    </MainLayoutWrapper>
  );
}

export default FavorAndSuggest;
