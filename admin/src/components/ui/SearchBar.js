import React, { useState } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";

const SearchBar = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <div className="relative w-full md:w-96">
      {/* Input hiển thị trên màn hình md trở lên */}
      <input
        type="text"
        placeholder="Search your food..."
        className="hidden md:block w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 shadow-sm md:w-80"
      />

      {/* Icon kính lúp (Mobile) */}
      <FaSearch
        className="md:hidden text-2xl text-gray-500 cursor-pointer hover:text-green-500 transition"
        onClick={() => setIsSearchOpen(true)}
      />

      {/* Modal tìm kiếm trên mobile */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white w-80 p-4 rounded-lg shadow-lg">
            <div className="flex justify-between items-center border-b pb-2">
              <h2 className="text-lg font-semibold">Search</h2>
              <FaTimes
                className="text-gray-500 cursor-pointer hover:text-red-500 transition"
                onClick={() => setIsSearchOpen(false)}
              />
            </div>
            <input
              type="text"
              placeholder="Type to search..."
              className="w-full mt-3 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
