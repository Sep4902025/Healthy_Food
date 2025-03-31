import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Thêm useNavigate
import HomeService from "../../services/home.service";

const DishesList = () => {
  const { type } = useParams(); // Lấy type từ URL
  const navigate = useNavigate(); // Khởi tạo useNavigate để điều hướng
  console.log("TTTType", type);

  const [dishes, setDishes] = useState([]);
  console.log("dishes", dishes);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDishes = async () => {
      try {
        const response = await HomeService.getDishesByType(type);
        console.log("RESSSSSSSSS", response);
        setDishes(response.data); // Giả sử response.data là mảng dishes từ API
      } catch (error) {
        console.error("Error fetching dishes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDishes();
  }, [type]);

  // Hàm xử lý khi click vào món ăn
  const handleDishClick = (dishId, recipeId) => {
    if (recipeId) {
      // Nếu món ăn có recipeId, điều hướng đến trang công thức
      navigate(`/${dishId}/recipes/${recipeId}`);
    } else {
      // Nếu không có recipeId, có thể hiển thị thông báo hoặc không làm gì
      console.log(`Dish ${dishId} does not have a recipe.`);
    }
  };

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;
  if (dishes.length === 0)
    return <p className="text-center text-gray-500">No dishes found for this type.</p>;

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dishes of Type: {type}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {dishes.map((dish) => (
          <div
            key={dish._id}
            className={`bg-white rounded-lg shadow-md overflow-hidden transition-shadow duration-300 ${
              dish.recipeId ? "cursor-pointer hover:shadow-lg" : "cursor-default"
            }`} // Thêm cursor-pointer nếu có recipeId
            onClick={() => handleDishClick(dish._id, dish.recipeId)} // Gọi handleDishClick khi click
          >
            {/* Hình ảnh món ăn */}
            <img
              src={dish.imageUrl || "/fallback-image.jpg"}
              alt={dish.name}
              className="w-full h-48 object-cover"
              onError={(e) => (e.target.src = "/fallback-image.jpg")}
            />

            {/* Thông tin món ăn */}
            <div className="p-4">
              <h2 className="text-xl font-semibold text-gray-800">{dish.name}</h2>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{dish.description}</p>

              {/* Thông tin dinh dưỡng */}
              <div className="mt-3 text-sm text-gray-700">
                <p>
                  <span className="font-semibold">Cooking Time:</span>{" "}
                  {dish.cookingTime > 0 ? `${dish.cookingTime} mins` : "N/A"}
                </p>
                <p>
                  <span className="font-semibold">Calories:</span>{" "}
                  {dish.calories > 0 ? `${dish.calories} kcal` : "N/A"}
                </p>
                <p>
                  <span className="font-semibold">Servings:</span>{" "}
                  {dish.totalServing > 0 ? dish.totalServing : "N/A"}
                </p>
              </div>

              {/* Hương vị */}
              <div className="mt-2">
                <span className="font-semibold text-gray-700">Flavors:</span>{" "}
                <span className="text-gray-600">
                  {dish.flavor.length > 0 ? dish.flavor.join(", ") : "N/A"}
                </span>
              </div>

              {/* Mùa (nếu có) */}
              {dish.season && (
                <div className="mt-2">
                  <span className="font-semibold text-gray-700">Season:</span>{" "}
                  <span className="text-gray-600">{dish.season}</span>
                </div>
              )}

              {/* Thông báo nếu không có công thức */}
              {!dish.recipeId && <p className="mt-2 text-sm text-red-500">No recipe available</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DishesList;
