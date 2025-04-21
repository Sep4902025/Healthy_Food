import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import medicalConditionService from "../../services/nutritionist/medicalConditionServices";

// Simple in-memory cache for condition details
const conditionCache = new Map();

// Memoized MedicalConditionCard component
const MedicalConditionCard = React.memo(({ condition, onClick }) => (
  <div
    className="bg-white shadow-lg rounded-2xl p-6 border border-gray-100 cursor-pointer hover:shadow-xl hover:border-[#40B491] hover:scale-105 transition-all duration-300 flex flex-col bg-gradient-to-br from-white to-[#40B491]/5 min-h-[180px]"
    onClick={() => onClick(condition._id)}
  >
    <h2 className="text-2xl font-extrabold text-[#40B491] mb-4 font-['Syne']">
      {condition.name}
    </h2>
    <p className="text-gray-700 text-base leading-relaxed flex-grow line-clamp-3">
      {condition.description || "Learn more about this condition and its dietary impacts."}
    </p>
  </div>
));

const Medical = () => {
  const navigate = useNavigate();
  const [medicalConditions, setMedicalConditions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const preFetchQueue = useRef(new Set());

  // Pre-fetch condition details
  const preFetchConditionDetails = useCallback(async (conditionId) => {
    if (conditionCache.has(conditionId) || preFetchQueue.current.has(conditionId)) {
      return;
    }

    preFetchQueue.current.add(conditionId);
    try {
      const response = await medicalConditionService.getMedicalConditionById(conditionId);
      if (response.success) {
        conditionCache.set(conditionId, response.data);
      }
    } catch (error) {
      console.error(`Error pre-fetching condition ${conditionId}:`, error);
    } finally {
      preFetchQueue.current.delete(conditionId);
    }
  }, []);

  // Fetch medical conditions
  useEffect(() => {
    const fetchMedicalConditions = async () => {
      try {
        // Check cache first
        const cachedConditions = conditionCache.get("all_conditions");
        if (cachedConditions) {
          setMedicalConditions(cachedConditions);
          setLoading(false);
          return;
        }

        const response = await medicalConditionService.getAllMedicalConditions(1, 1000, "");
        if (response.success) {
          setMedicalConditions(response.data.items || []);
          conditionCache.set("all_conditions", response.data.items || []);
        } else {
          toast.error(response.message || "Failed to load medical conditions!");
        }
      } catch (error) {
        console.error("Error fetching medical conditions:", error);
        toast.error("Error loading medical conditions!");
      } finally {
        setLoading(false);
      }
    };

    fetchMedicalConditions();
  }, []);

  // Pre-fetch details for visible conditions
  useEffect(() => {
    const visibleConditions = showAll ? medicalConditions : medicalConditions.slice(0, 6);
    visibleConditions.forEach((condition) => {
      preFetchConditionDetails(condition._id);
    });
  }, [medicalConditions, showAll, preFetchConditionDetails]);

  // Handle condition click
  const handleConditionClick = useCallback(
    (conditionId) => {
      navigate(`/medical/${conditionId}`);
    },
    [navigate]
  );

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-12 text-center">
        <p className="text-lg font-semibold text-gray-600">Loading medical conditions...</p>
      </div>
    );
  }

  if (medicalConditions.length === 0) {
    return (
      <div className="container mx-auto px-6 py-12 text-center">
        <p className="text-lg font-semibold text-gray-500">No medical conditions found.</p>
      </div>
    );
  }

  const displayedConditions = showAll ? medicalConditions : medicalConditions.slice(0, 6);

  return (
    <div className="container mx-auto px-6 py-12 bg-gray-50">
      <h1 className="text-4xl font-extrabold text-center mb-10 font-['Syne'] text-[#40B491]">
        Medical Conditions
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-8">
        {displayedConditions.map((condition) => (
          <MedicalConditionCard
            key={condition._id}
            condition={condition}
            onClick={handleConditionClick}
          />
        ))}
      </div>
      {medicalConditions.length > 6 && (
        <div className="text-center mt-10">
          <button
            onClick={() => setShowAll(!showAll)}
            className="px-8 py-3 bg-[#40B491] text-white font-semibold rounded-full shadow-lg hover:bg-[#359c7a] hover:scale-105 transition-all duration-200"
          >
            {showAll ? "View Less" : "View All"}
          </button>
        </div>
      )}
    </div>
  );
};

export default Medical;