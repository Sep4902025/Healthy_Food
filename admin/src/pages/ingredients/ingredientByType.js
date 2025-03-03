import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import HomeService from "../../services/home.service";

const IngredientList = () => {
  const { type } = useParams(); // Lấy type từ URL
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <p>Loading...</p>;
  if (ingredients.length === 0) return <p>No ingredients found for this type.</p>;

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold">Ingredients of Type: {type}</h1>
      <ul className="mt-4">
        {ingredients.map((ingredient) => (
          <li key={ingredient._id} className="py-2 border-b">
            {ingredient.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default IngredientList;
