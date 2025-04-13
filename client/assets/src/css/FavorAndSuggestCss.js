import { StyleSheet } from "react-native";

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
  playIcon: {
    position: "absolute",
    top: 16,
    left: 16,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 20,
    padding: 8,
  },
  cardContent: {
    height: "90%", // From first stylesheet
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
    height: "65%", // From first stylesheet
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
    fontWeight: "600", // From second stylesheet for bolder text
    marginBottom: 16,
    marginTop: 8,
    color: "#263238", // From second stylesheet
  },
  ingredientRow: {
    flexDirection: "row",
    alignItems: "flex-start", // From second stylesheet
    marginBottom: 16,
    backgroundColor: "#FAFAFA", // From second stylesheet
    borderRadius: 10,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  ingredientImage: {
    width: 64, // From second stylesheet
    height: 64,
    resizeMode: "cover", // From second stylesheet
    borderRadius: 8,
    marginRight: 12,
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
    fontWeight: "500", // From second stylesheet
    alignSelf: "flex-start", // From second stylesheet
    marginTop: 4,
    color: "#607D8B", // From second stylesheet
  },
  instructionRow: {
    marginBottom: 16,
    backgroundColor: "#F9F9F9", // From second stylesheet
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0", // From second stylesheet
  },
  instructionStep: {
    fontSize: 15, // From second stylesheet
    fontWeight: "600", // From second stylesheet
    marginBottom: 6, // From second stylesheet
    color: "#37474F", // From second stylesheet
  },
  instructionText: {
    fontSize: 14,
    color: "#546E7A",
    lineHeight: 22, // From second stylesheet
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
  ratingSummary: {
    marginBottom: 12,
    padding: 10,
    backgroundColor: "#f2f2f2",
    borderRadius: 8,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
  ratingValue: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 4,
  },
  commentContainer: {
    padding: 14,
    marginBottom: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ECEFF1",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  loginButton: {
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  commentBox: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  commentUser: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#263238", // Added color to match theme
  },
  commentRating: {
    fontSize: 14,
    color: "#546E7A", // Added color to match theme
  },
  commentText: {
    fontSize: 15,
    marginTop: 6,
    color: "#546E7A", // Added color to match theme
  },
  commentFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
  },
  likeButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  likeCount: {
    fontSize: 14,
    marginLeft: 6,
    color: "#78909C", // Added color to match theme
  },
  openModal: {
    marginTop: 4,
  },
});

export default styles;
