import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import medicalConditionService from "../../services/nutritionist/medicalConditionServices";

// Simple in-memory cache for condition details
const conditionCache = new Map();

// Memoized MedicalConditionCard component
const MedicalConditionCard = React.memo(({ condition, onClick, observeRef }) => (
  <div
    ref={observeRef}
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
  const observerRef = useRef(null);
  const observedConditions = useRef(new Set());

  // Pre-fetch condition details for a batch of condition IDs
  const preFetchConditionDetails = useCallback(async (conditionIds) => {
    // Filter out already cached or currently fetching conditions
    const idsToFetch = conditionIds.filter(
      (id) => !conditionCache.has(id) && !observedConditions.current.has(id)
    );
    if (idsToFetch.length === 0) return;

    // Mark conditions as being fetched
    idsToFetch.forEach((id) => observedConditions.current.add(id));

    try {
      // Fetch details concurrently
      const responses = await Promise.all(
        idsToFetch.map((id) =>
          medicalConditionService.getMedicalConditionById(id).catch((error) => ({
            success: false,
            id,
            error,
          }))
        )
      );

      responses.forEach((response, index) => {
        const id = idsToFetch[index];
        if (response.success) {
          conditionCache.set(id, response.data);
        } else {
          console.error(`Error pre-fetching condition ${id}:`, response.error);
        }
        observedConditions.current.delete(id);
      });
    } catch (error) {
      console.error("Error in batch pre-fetching conditions:", error);
      idsToFetch.forEach((id) => observedConditions.current.delete(id));
    }
  }, []);

  // Set up IntersectionObserver to pre-fetch details for visible cards
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visibleConditionIds = entries
          .filter((entry) => entry.isIntersecting)
          .map((entry) => entry.target.dataset.conditionId)
          .filter((id) => id);

        if (visibleConditionIds.length > 0) {
          preFetchConditionDetails(visibleConditionIds);
        }
      },
      { threshold: 0.1 }
    );

    // Observe all condition card elements
    const conditionElements = document.querySelectorAll("[data-condition-id]");
    conditionElements.forEach((el) => observerRef.current.observe(el));

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [medicalConditions, showAll, preFetchConditionDetails]);

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
          const conditions = response.data.items || [];
          setMedicalConditions(conditions);
          conditionCache.set("all_conditions", conditions);
        } else {
          toast.error(response.message || "Failed to load health conditions!");
        }
      } catch (error) {
        console.error("Error fetching health conditions:", error);
        toast.error("Error loading health conditions!");
      } finally {
        setLoading(false);
      }
    };

    fetchMedicalConditions();
  }, []);

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
        <p className="text-lg font-semibold text-gray-600">Loading health conditions...</p>
      </div>
    );
  }

  if (medicalConditions.length === 0) {
    return (
      <div className="container mx-auto px-6 py-12 text-center">
        <p className="text-lg font-semibold text-gray-500">No health conditions found.</p>
      </div>
    );
  }

  const displayedConditions = showAll ? medicalConditions : medicalConditions.slice(0, 6);

  return (
    <div className="container mx-auto px-6 py-12 bg-gray-50">
      <h1 className="text-4xl font-extrabold text-center mb-10 font-['Syne'] text-[#40B491]">
        Health Conditions
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-8">
        {displayedConditions.map((condition) => (
          <MedicalConditionCard
            key={condition._id}
            condition={condition}
            onClick={handleConditionClick}
            observeRef={(el) => {
              if (el) {
                el.dataset.conditionId = condition._id;
              }
            }}
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