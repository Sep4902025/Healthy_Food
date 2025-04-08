import React, { useState, useEffect, useCallback, memo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import medicalConditionService from "../../services/nutritionist/medicalConditionServices";
import dishesService from "../../services/nutritionist/dishesServices";
import recipesService from "../../services/nutritionist/recipesServices";
import { toast } from "react-toastify";
import { selectAuth } from "../../store/selectors/authSelectors";
import { Search } from "lucide-react";

// Debounce function to delay search
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Memoized SearchInput component
const SearchInput = memo(({ value, onChange }) => {
  return (
    <div className="max-w-xl mx-auto relative">
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder="Search medical conditions..."
        className="w-full py-3 px-5 pr-12 rounded-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#40B491] shadow-md"
      />
      <Search className="w-6 h-6 absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
    </div>
  );
});

// Memoized MedicalConditionList component to prevent re-renders
const MedicalConditionList = memo(
  ({ conditions, onConditionClick }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {conditions.map((condition) => (
        <article
          key={condition._id}
          className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition duration-300 cursor-pointer transform hover:-translate-y-1"
          onClick={() => onConditionClick(condition._id)}
        >
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-3 font-['Syne'] line-clamp-1">
              {condition.name}
            </h2>
            <p className="text-gray-600 text-base mb-4 line-clamp-3 leading-relaxed">
              {condition.description || "Learn more about this condition and its dietary impacts."}
            </p>
            <button
              className="text-[#40B491] font-semibold hover:text-[#359c7a] transition duration-200 flex items-center"
              onClick={(e) => {
                e.stopPropagation();
                onConditionClick(condition._id);
              }}
            >
              Read More <span className="ml-2">→</span>
            </button>
          </div>
        </article>
      ))}
    </div>
  ),
  (prevProps, nextProps) =>
    prevProps.conditions === nextProps.conditions &&
    prevProps.onConditionClick === nextProps.onConditionClick
);

const Medical = () => {
  const navigate = useNavigate();
  const auth = useSelector(selectAuth);
  const user = auth?.user;
  const [medicalConditions, setMedicalConditions] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [initialLoading, setInitialLoading] = useState(true); // For initial load
  const [searchLoading, setSearchLoading] = useState(false); // For search updates
  const [searchTerm, setSearchTerm] = useState("");
  const [inputValue, setInputValue] = useState("");
  const limit = 6;

  // Fetch danh sách điều kiện y tế
  const fetchMedicalConditions = async (page) => {
    setSearchLoading(true);
    try {
      const response = await medicalConditionService.getAllMedicalConditions(page, limit, searchTerm);
      if (response.success) {
        setMedicalConditions(response.data.items || []);
        setTotalPages(response.data.totalPages || 1);
        setCurrentPage(response.data.currentPage || 1);
      } else {
        toast.error(response.message || "Failed to load medical conditions!");
      }
    } catch (error) {
      console.error("Error fetching medical conditions:", error);
      toast.error("Error loading medical conditions!");
    } finally {
      setSearchLoading(false);
      setInitialLoading(false);
    }
  };

  // Fetch all dishes with nutrition data
  const fetchDishes = async () => {
    try {
      const response = await dishesService.getAllDishes(1, 1000);
      if (response?.success) {
        const dishesData = Array.isArray(response.data.items) ? response.data.items : [];
        const enrichedDishes = await Promise.all(
          dishesData.map(async (dish) => {
            if (dish.recipeId) {
              try {
                const recipeResponse = await recipesService.getRecipeById(dish._id, dish.recipeId);
                if (recipeResponse.success && recipeResponse.data?.status === "success") {
                  const recipe = recipeResponse.data.data;
                  const nutritions = calculateNutritionFromRecipe(recipe);
                  return { ...dish, nutritions };
                }
              } catch (error) {
                console.error(`Error fetching recipe for dish ${dish._id}:`, error);
              }
            }
            return {
              ...dish,
              nutritions: { calories: "N/A", protein: "N/A", carbs: "N/A", fat: "N/A" },
            };
          })
        );
        setDishes(enrichedDishes);
      } else {
        setDishes([]);
        toast.error("Failed to fetch dishes: " + response?.message);
      }
    } catch (error) {
      setDishes([]);
      toast.error("Error fetching dishes: " + error.message);
    }
  };

  const calculateNutritionFromRecipe = (recipe) => {
    let totalCalories = 0;
    let totalProtein = 0;
    let totalFat = 0;
    let totalCarbs = 0;

    if (recipe?.ingredients && Array.isArray(recipe.ingredients)) {
      recipe.ingredients.forEach((ing) => {
        const ingredient = ing.ingredientId;
        if (ingredient && ing.quantity && ing.unit) {
          let conversionFactor;
          if (ing.unit === "g" || ing.unit === "ml") {
            conversionFactor = ing.quantity / 100;
          } else if (ing.unit === "tbsp") {
            conversionFactor = (ing.quantity * 15) / 100;
          } else if (ing.unit === "tsp" || ing.unit === "tp") {
            conversionFactor = (ing.quantity * 5) / 100;
          } else {
            conversionFactor = ing.quantity / 100;
          }
          totalCalories += (ingredient.calories || 0) * conversionFactor;
          totalProtein += (ingredient.protein || 0) * conversionFactor;
          totalFat += (ingredient.fat || 0) * conversionFactor;
          totalCarbs += (ingredient.carbs || 0) * conversionFactor;
        }
      });
    }

    return {
      calories: totalCalories.toFixed(2),
      protein: totalProtein.toFixed(2),
      carbs: totalCarbs.toFixed(2),
      fat: totalFat.toFixed(2),
    };
  };

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((value) => {
      setSearchTerm(value);
      setCurrentPage(1);
    }, 500),
    []
  );

  // Stable onChange handler for SearchInput
  const handleInputChange = useCallback((e) => {
    const value = e.target.value;
    setInputValue(value);
    debouncedSearch(value);
  }, [debouncedSearch]);

  // Stable onConditionClick handler
  const handleConditionClick = useCallback((conditionId) => {
    navigate(`/medical/${conditionId}`);
  }, [navigate]);

  useEffect(() => {
    if (!user) {
      toast.error("Please sign in to view medical conditions!");
      navigate("/signin");
      return;
    }

    fetchMedicalConditions(currentPage);
    fetchDishes();
  }, [currentPage, user, navigate, searchTerm]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-xl font-semibold text-gray-600">Loading medical insights...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <header className="bg-gradient-to-r from-[#40B491] to-[#2e8b6e] text-white py-16 px-6">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold font-['Syne'] mb-4">Health Insights</h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed">
            Discover expert advice on medical conditions and dietary recommendations.
          </p>
          <div className="mt-8">
            <SearchInput value={inputValue} onChange={handleInputChange} />
          </div>
        </div>
      </header>

      {/* Blog Posts Section */}
      <section className="container mx-auto py-12 px-6">
        {medicalConditions.length > 0 ? (
          <div className="relative">
            {searchLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50">
                <p className="text-gray-600">Searching...</p>
              </div>
            )}
            <MedicalConditionList
              conditions={medicalConditions}
              onConditionClick={handleConditionClick}
            />
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-xl text-gray-500 font-medium">No medical conditions found.</p>
            <p className="text-gray-400 mt-2">Try adjusting your search or check back later.</p>
          </div>
        )}
      </section>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center py-12 space-x-3">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-5 py-2 bg-white text-gray-700 rounded-full shadow-md disabled:opacity-50 hover:bg-gray-100 transition duration-200"
          >
            Previous
          </button>
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              onClick={() => handlePageChange(index + 1)}
              className={`px-5 py-2 rounded-full font-semibold shadow-md ${
                currentPage === index + 1
                  ? "bg-[#40B491] text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              } transition duration-200`}
            >
              {index + 1}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-5 py-2 bg-white text-gray-700 rounded-full shadow-md disabled:opacity-50 hover:bg-gray-100 transition duration-200"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Medical;