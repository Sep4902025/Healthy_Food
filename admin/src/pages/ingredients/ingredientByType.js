import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FaFire, FaDrumstickBite, FaBreadSlice, FaTint } from "react-icons/fa";
import HomeService from "../../services/home.service";

const IngredientList = () => {
  const { type } = useParams();
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const response = await HomeService.getIngredientsByType(type);
        setIngredients(response.data);
      } catch (error) {
        console.error("Error fetching ingredients:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchIngredients();
  }, [type]);

  if (loading) return <p className="text-center text-lg font-semibold">Loading...</p>;
  if (ingredients.length === 0)
    return <p className="text-center text-lg font-semibold">No ingredients found for this type.</p>;

  const displayedIngredients = showAll ? ingredients : ingredients.slice(0, 5);

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold text-center mb-6">Ingredients of Type: {type}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {displayedIngredients.map((ingredient) => (
          <div
            key={ingredient._id}
            className="bg-white shadow-lg rounded-lg p-4 border flex flex-col items-center"
          >
            <img
              src={ingredient.imageUrl}
              alt={ingredient.name}
              className="w-32 h-32 object-cover rounded-full mb-4"
            />
            <h2 className="text-xl font-semibold">{ingredient.name}</h2>
            <p className="text-gray-600 text-sm">{ingredient.description}</p>
            <div className="mt-2 text-sm text-gray-700">
              <p className="flex items-center gap-2"><FaFire className="text-red-500" /> <strong>Calories:</strong> {ingredient.calories} kcal</p>
              <p className="flex items-center gap-2"><FaDrumstickBite className="text-blue-500" /> <strong>Protein:</strong> {ingredient.protein}g</p>
              <p className="flex items-center gap-2"><FaBreadSlice className="text-yellow-500" /> <strong>Carbs:</strong> {ingredient.carbs}g</p>
              <p className="flex items-center gap-2"><FaTint className="text-green-500" /> <strong>Fat:</strong> {ingredient.fat}g</p>
            </div>
          </div>
        ))}
      </div>
      {ingredients.length > 5 && (
        <div className="text-center mt-6">
          <button
            onClick={() => setShowAll(!showAll)}
            className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600"
          >
            {showAll ? "View Less" : "View All"}
          </button>
        </div>
      )}
    </div>
  );
};

export default IngredientList;
