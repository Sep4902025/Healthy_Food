import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import HomeService from "../../services/home.service";


const DishesList = () => {
  const { type } = useParams(); // Lấy type từ URL
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const response = await HomeService.getDishesByType(type);
        setDishes(response.data);
      } catch (error) {
        console.error("Error fetching ingredients:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchIngredients();
  }, [type]);

  if (loading) return <p>Loading...</p>;
  if (dishes.length === 0) return <p>No dish found for this type.</p>;

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold">Dish of Type: {type}</h1>
      <ul className="mt-4">
        {dishes.map((dish) => (
          <li key={dish._id} className="py-2 border-b">
            {dish.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DishesList;
