// Cart.js
import React from "react";
import { RiShoppingBag4Line } from "react-icons/ri";

const Cart = ({
  cartMenuOpen,
  toggleCartMenu,
  cartMenuRef,
  cartViewed,
  mealPlans,
  isLoadingMealPlans,
  activeTab,
  setActiveTab,
  paymentHistory,
  handlePayMealPlan,
  handlePreviewMealPlan,
}) => {
  console.log("cartML", mealPlans);

  return (
    <div className="relative" ref={cartMenuRef}>
      <div className="relative inline-block">
        <RiShoppingBag4Line className="cursor-pointer w-[16px] h-[16px]" onClick={toggleCartMenu} />
        {!cartViewed && mealPlans?.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-custom-green text-white text-xs font-bold rounded-full w-[15px] h-[15px] flex items-center justify-center">
            {mealPlans.length}
          </span>
        )}
      </div>
      {cartMenuOpen && (
        <div className="absolute right-0 mt-2 w-60 bg-white border rounded-lg shadow-lg z-10">
          {/* Tabs */}
          <div className="flex border-b px-2">
            <button
              className={`flex-1 py-2 text-center ${
                activeTab === "mealPlan"
                  ? "border-b-2 border-green-500 text-green-600"
                  : "text-gray-600"
              }`}
              onClick={() => setActiveTab("mealPlan")}
            >
              Meal Plans
            </button>
            <button
              className={`flex py-2 text-center ${
                activeTab === "history"
                  ? "border-b-2 border-green-500 text-green-600"
                  : "text-gray-600"
              }`}
              onClick={() => setActiveTab("history")}
            >
              Payment History
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex flex-col justify-center items-center max-h-48 overflow-y-auto">
            {activeTab === "mealPlan" ? (
              isLoadingMealPlans ? (
                <p className="text-sm text-gray-500">Loading meal plans...</p>
              ) : mealPlans?.length > 0 ? (
                <div className="w-full">
                  {mealPlans.map((mealPlan, index) => (
                    <div key={mealPlan._id} className="border-b py-2 last:border-b-0 px-4">
                      {/* Display meal plan with numbering */}
                      <p className="font-medium text-gray-700">
                        {index + 1}. Name: {mealPlan.title}
                      </p>
                      <p className="text-sm text-gray-600">
                        Start: {new Date(mealPlan.startDate).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        Price: {(mealPlan.price || 1500000).toLocaleString()} VND
                      </p>
                      <div className="mt-2 flex justify-center space-x-2">
                        <button
                          onClick={() => handlePayMealPlan(mealPlan)}
                          className="bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded-md text-xs font-medium"
                        >
                          Pay Now
                        </button>
                        <button
                          onClick={() => handlePreviewMealPlan(mealPlan)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded-md text-xs font-medium"
                        >
                          Preview
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No meal plans to pay.</p>
              )
            ) : (
              <div className="w-full">
                {paymentHistory.length > 0 ? (
                  <div className="max-h-48 overflow-y-auto">
                    {paymentHistory.map((payment) => (
                      <div key={payment._id} className="border-b py-2 text-sm text-gray-600 px-4">
                        <p>
                          <strong>Meal Plan:</strong> {payment.mealPlanName || "N/A"}
                        </p>
                        <p>
                          <strong>Amount:</strong> {payment.amount.toLocaleString()} VND
                        </p>
                        <p>
                          <strong>Status:</strong> {payment.status}
                        </p>
                        <p>
                          <strong>Date:</strong> {new Date(payment.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No payment history.</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
