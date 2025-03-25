import React from "react";
import ReactPaginate from "react-paginate";
import { MdNavigateBefore, MdNavigateNext } from "react-icons/md";

const Pagination = ({ limit, setLimit, totalItems, handlePageClick, text }) => {
  // Fallback to 0 if totalItems is undefined
  const safeTotalItems = typeof totalItems === "number" ? totalItems : 0;

  return (
    <div className="flex items-center justify-between">
      {/* Show items per page */}
      <div className="flex items-center gap-2.5">
        <p className="text-sm">Show</p>
        <div className="relative">
          <select
            className="w-16 h-[25px] px-1 bg-custom-green text-sm text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-custom-green-300 border border-white custom-select appearance-none pr-6"
            value={limit}
            onChange={(e) => setLimit(parseInt(e.target.value))}
          >
            <option value="6">6</option>
            <option value="7">7</option>
            <option value="8">8</option>
            <option value="9">9</option>
          </select>
          {/* Thêm mũi tên trắng tùy chỉnh */}
          <span className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <svg
              className="w-3 h-3 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </span>
        </div>
        <p className="text-sm">
          of {safeTotalItems} {text}
        </p>
      </div>

      {/* Pagination */}
      <ReactPaginate
        previousLabel={<MdNavigateBefore />}
        nextLabel={<MdNavigateNext />}
        pageClassName="w-[25px] h-[25px] rounded-full flex items-center justify-center text-xs font-semibold transition-colors duration-300"
        pageLinkClassName="w-full h-full flex items-center justify-center bg-custom-green-100 rounded-full text-custom-green border border-custom-green transition-colors duration-300 hover:bg-custom-green hover:text-white"
        previousClassName="w-[25px] h-[25px] rounded-full flex items-center justify-center text-xs font-semibold text-white"
        previousLinkClassName="w-full h-full flex items-center justify-center bg-custom-green rounded-full transition-colors duration-300 hover:bg-custom-green-600"
        nextClassName="w-[25px] h-[25px] rounded-full flex items-center justify-center text-xs font-semibold text-white"
        nextLinkClassName="w-full h-full flex items-center justify-center bg-custom-green rounded-full transition-colors duration-300 hover:bg-custom-green-600"
        breakLabel="..."
        breakClassName="w-[25px] h-[25px] rounded-full flex items-center justify-center text-xs font-semibold"
        breakLinkClassName="w-full h-full flex items-center justify-center bg-custom-green-100 rounded-full text-custom-green"
        pageCount={Math.ceil(safeTotalItems / limit)}
        marginPagesDisplayed={2}
        pageRangeDisplayed={5}
        containerClassName="flex items-center gap-[5px]"
        activeClassName="text-white"
        activeLinkClassName="bg-custom-green text-white"
        onPageChange={handlePageClick}
        disabledClassName="opacity-40 cursor-not-allowed"
      />
    </div>
  );
};

export default Pagination;
