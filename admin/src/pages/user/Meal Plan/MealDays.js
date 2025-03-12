import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import mealPlanService from "../../../services/mealPlanServices";

const MealDays = () => {
  const { mealPlanId } = useParams();
  const [mealDays, setMealDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mealPlanInfo, setMealPlanInfo] = useState(null);

  useEffect(() => {
    const fetchMealPlanData = async () => {
      try {
        // Lấy thông tin của meal plan (nếu có API)
        try {
          const planData = await mealPlanService.getMealPlanById(mealPlanId);
          if (planData && planData.success) {
            setMealPlanInfo(planData.data);
          }
        } catch (err) {
          console.log("Không thể lấy thông tin meal plan");
        }

        // Lấy danh sách meal days
        const data = await mealPlanService.getMealDaysByMealPlan(mealPlanId);
        if (data.success) {
          setMealDays(data.data);
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError("Lỗi khi lấy dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    fetchMealPlanData();
  }, [mealPlanId]);

  // Hàm định dạng ngày tháng từ chuỗi ISO
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );

  if (error)
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mt-4">
        <p className="font-medium">{error}</p>
      </div>
    );

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto">
      {/* Header with breadcrumb */}
      <div className="mb-6">
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <Link to="/mealPlan" className="hover:text-green-600">
            Kế hoạch ăn uống
          </Link>
          <svg
            className="mx-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
          <span className="text-gray-800 font-medium">
            {mealPlanInfo?.name || "Chi tiết kế hoạch"}
          </span>
        </div>
        <h1 className="text-2xl font-bold text-gray-800">{mealPlanInfo?.name || "Lịch ăn uống"}</h1>
        {mealPlanInfo && (
          <div className="flex items-center mt-2 text-gray-600">
            <svg
              className="h-4 w-4 mr-1"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <span className="text-sm">{mealPlanInfo.duration} ngày</span>
            {mealPlanInfo.description && <p className="text-sm ml-4">{mealPlanInfo.description}</p>}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-800">Danh sách ngày</h2>
        <Link to={`/mealPlan/${mealPlanId}/addMealDay`}>
          <button className="flex items-center bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition duration-200">
            <svg
              className="h-4 w-4 mr-1"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Thêm ngày mới
          </button>
        </Link>
      </div>

      {/* Meal days list */}
      {mealDays.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <svg
            className="h-12 w-12 mx-auto text-gray-400 mb-3"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <p className="text-gray-600 mb-4">Chưa có ngày nào được thiết lập cho kế hoạch này.</p>
          <Link to={`/mealPlan/${mealPlanId}/addMealDay`}>
            <button className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition duration-200">
              Thêm ngày đầu tiên
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mealDays.map((mealDay, index) => (
            <div
              key={mealDay._id}
              className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition duration-200"
            >
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">Ngày {index + 1}</span>
                  <span className="text-sm text-gray-500">{formatDate(mealDay.date)}</span>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center mb-3">
                  <svg
                    className="h-4 w-4 text-gray-500 mr-2"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  <span className="text-sm text-gray-600">{mealDay.meals?.length || 0} bữa ăn</span>
                </div>

                <div className="flex justify-between items-center mt-4">
                  <Link
                    to={`/mealPlan/${mealPlanId}/mealDay/${mealDay._id}/meal`}
                    className="text-green-600 hover:text-green-800 font-medium text-sm flex items-center"
                  >
                    Xem chi tiết
                    <svg
                      className="ml-1 h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </Link>
                  <div className="flex gap-2">
                    <button className="text-gray-600 hover:text-green-600 p-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                      </svg>
                    </button>
                    <button className="text-gray-600 hover:text-red-600 p-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MealDays;
