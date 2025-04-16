import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

const Pagination = ({ totalItems, handlePageClick, currentPage, text }) => {
  const safeTotalItems = typeof totalItems === "number" ? totalItems : 0;
  const limit = 10; // Hardcode limit = 10
  const pageCount = Math.ceil(safeTotalItems / limit);

  const handlePrevious = () => {
    if (currentPage > 0) {
      handlePageClick({ selected: currentPage - 1 });
    }
  };

  const handleNext = () => {
    if (currentPage < pageCount - 1) {
      handlePageClick({ selected: currentPage + 1 }); 
    }
  };

  return (
    <View className="flex-row items-center justify-center mt-4">
      {/* Previous Button */}
      <TouchableOpacity
        onPress={handlePrevious}
        disabled={currentPage === 0}
        className={`w-8 h-8 rounded-full flex items-center justify-center mx-1 ${
          currentPage === 0 ? "opacity-40" : "bg-custom-green"
        }`}
      >
        <Text className="text-white text-lg">{"<"}</Text>
      </TouchableOpacity>

      {/* Page Numbers */}
      {Array.from({ length: pageCount }, (_, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => handlePageClick({ selected: index })}
          className={`w-8 h-8 rounded-full flex items-center justify-center mx-1 ${
            currentPage === index
              ? "bg-custom-green text-white"
              : "bg-custom-green-100 text-custom-green border border-custom-green"
          }`}
        >
          <Text className={`text-sm ${currentPage === index ? "text-white" : "text-custom-green"}`}>
            {index + 1}
          </Text>
        </TouchableOpacity>
      ))}

      {/* Next Button */}
      <TouchableOpacity
        onPress={handleNext}
        disabled={currentPage === pageCount - 1}
        className={`w-8 h-8 rounded-full flex items-center justify-center mx-1 ${
          currentPage === pageCount - 1 ? "opacity-40" : "bg-custom-green"
        }`}
      >
        <Text className="text-white text-lg">{">"}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Pagination;
