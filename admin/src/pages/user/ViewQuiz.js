import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectAuth } from "../../store/selectors/authSelectors";
import quizService from "../../services/quizService";

const ViewQuiz = () => {
  const { user } = useSelector(selectAuth);
  const [userData, setUserData] = useState(null);
  console.log("userdata", userData);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserPreferences = async () => {
      if (user && user._id) {
        const { success, data, message } = await quizService.getUserPreference(
          user._id
        );
        if (success) {
          setUserData(data);
        } else {
          setError(message);
        }
      } else {
        setError("User ID is missing. Please log in again.");
      }
    };

    fetchUserPreferences();
  }, [user]);

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (!userData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">User Preferences</h1>
      <div className="grid grid-cols-2 gap-4">
        <InfoItem label="Name" value={userData.data.name} />
        <InfoItem label="Email" value={userData.data.email} />
        <InfoItem label="Age" value={userData.data.age} />
        <InfoItem label="Gender" value={userData.gender} />
        <InfoItem label="Phone Number" value={userData.phoneNumber} />
        <InfoItem label="Height (cm)" value={userData.height} />
        <InfoItem label="Weight (kg)" value={userData.weight} />
        <InfoItem label="Weight Goal (kg)" value={userData.weightGoal} />
        <InfoItem label="Diet" value={userData.diet} />
        <InfoItem label="Eating Habits" value={userData.eatHabit?.join(", ")} />
        <InfoItem label="Favorites" value={userData.favorite?.join(", ")} />
        <InfoItem label="Dislikes" value={userData.hate?.join(", ")} />
        <InfoItem label="Plan Duration" value={userData.longOfPlan} />
        <InfoItem label="Meals Per Day" value={userData.mealNumber} />
        <InfoItem label="Goal" value={userData.goal} />
        <InfoItem label="Sleep Time" value={userData.sleepTime} />
        <InfoItem label="Water Intake (L)" value={userData.waterDrink} />
        <InfoItem label="Underlying Disease" value={userData.underDisease} />
        <InfoItem
          label="Created At"
          value={new Date(userData.createdAt).toLocaleString()}
        />
        <InfoItem
          label="Updated At"
          value={new Date(userData.updatedAt).toLocaleString()}
        />
      </div>
    </div>
  );
};

const InfoItem = ({ label, value }) => (
  <div className="p-2 border rounded shadow-sm">
    <p className="font-medium">{label}</p>
    <p className="text-gray-700">{value || "N/A"}</p>
  </div>
);

export default ViewQuiz;
