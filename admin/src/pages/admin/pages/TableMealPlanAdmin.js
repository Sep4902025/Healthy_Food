import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { selectAuth } from "../../../store/selectors/authSelectors";
import mealPlanService from "../../../services/mealPlanServices";
import Pagination from "../../../components/Pagination";
import Loading from "../../../components/Loading";
import {
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
} from "docx";
import { saveAs } from "file-saver";

const TableMealPlanAdmin = () => {
  const { user } = useSelector(selectAuth);
  const [mealPlans, setMealPlans] = useState([]);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0); // 0-based for ReactPaginate
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Fetch meal plans (admin view - all meal plans)
  const fetchMealPlans = async () => {
    setIsTransitioning(true);
    try {
      const response = await mealPlanService.getAllMealPlans(
        currentPage + 1,
        limit
      );
      if (response.success) {
        setMealPlans(response.data.mealPlans || []);
        setTotalPages(response.totalPages || 1);
        setTotalItems(response.total || 0);
      } else {
        setError(response.message);
        setMealPlans([]);
        setTotalPages(1);
        setTotalItems(0);
      }
    } catch (err) {
      setError("An unknown error occurred while loading data");
      setMealPlans([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setIsTransitioning(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") {
      fetchMealPlans();
    }
  }, [currentPage, limit, user]);

  // Handle page change for Pagination component
  const handlePageClick = (data) => {
    setCurrentPage(data.selected); // ReactPaginate uses 0-based index
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format price (assuming price is in VND)
  const formatPrice = (price) => {
    return price ? `${price.toLocaleString("vi-VN")} VND` : "N/A";
  };

  // Check if meal plan is expired
  const isExpired = (startDate, duration) => {
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + duration);
    return new Date() > end;
  };

  // Export to Word function
  const exportToWord = () => {
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              text: "Meal Plans Report (Admin View)",
              heading: HeadingLevel.TITLE,
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 },
            }),
            new Paragraph({
              text: `Generated on: ${new Date().toLocaleDateString('en-US', {
                month: 'long',
                day: '2-digit',
                year: 'numeric'
              })}`,
              alignment: AlignmentType.CENTER,
              spacing: { after: 300 },
            }),
            new Paragraph({
              text: "Meal Plans List",
              heading: HeadingLevel.HEADING_1,
              spacing: { after: 200 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Total Meal Plans: ${totalItems}`,
                  bold: true,
                }),
              ],
              spacing: { before: 200 },
            }),
            ...mealPlans.map((mealPlan, index) => {
              const expired = isExpired(mealPlan.startDate, mealPlan.duration);
              const status = expired
                ? "Expired"
                : mealPlan.isPause
                ? "Paused"
                : mealPlan.isBlock
                ? "Blocked"
                : "Active";

              return new Paragraph({
                children: [
                  
                  new TextRun(`No. ${currentPage * limit + index + 1}`),
                  new TextRun({ text: `\nTitle: ${mealPlan.title}`, break: 1 }),
                  new TextRun({
                    text: `\nStart Date: ${formatDate(mealPlan.startDate)}`,
                    break: 1,
                  }),
                  new TextRun({
                    text: `\nDuration: ${mealPlan.duration} days`,
                    break: 1,
                  }),
                  new TextRun({
                    text: `\nType: ${
                      mealPlan.type === "fixed" ? "Fixed" : "Custom"
                    }`,
                    break: 1,
                  }),
                  new TextRun({
                    text: `\nPrice: ${formatPrice(mealPlan.price)}`,
                    break: 1,
                  }),
                  new TextRun({
                    text: `\nCreated For: ${
                      mealPlan.userId?.username || mealPlan.userId || "Unknown"
                    }`,
                    break: 1,
                  }),
                  new TextRun({
                    text: `\nCreated By: ${
                      mealPlan.createdBy?.username ||
                      mealPlan.createdBy ||
                      "Unknown"
                    }`,
                    break: 1,
                  }),
                  new TextRun({ text: `\nStatus: ${status}`, break: 1 }),
                ],
                spacing: { after: 200, before: 400 },
              });
            }),
          ],
        },
      ],
    });

    Packer.toBlob(doc).then((blob) => {
      saveAs(blob, "Meal_Plans_Report.docx");
    });
  };

  if (user?.role !== "admin") {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-red-500 text-lg font-semibold">
          Access Denied: Admin Only
        </p>
      </div>
    );
  }

  if (isTransitioning) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-[#40B491] text-lg font-semibold">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-red-500 text-lg font-semibold">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-extrabold text-[#40B491] tracking-tight">
          All Meal Plans (Admin View)
        </h1>
        <button
          onClick={exportToWord}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Export to Word
        </button>
      </div>

      {/* Data Container */}
      <Loading isLoading={isTransitioning}>
        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-11 gap-4 bg-[#40B491] text-white p-4 font-semibold text-sm uppercase tracking-wider">
            <div className="col-span-1">No.</div>
            <div className="col-span-2">Title</div>
            <div className="col-span-1">Start Date</div>
            <div className="col-span-1">Duration</div>
            <div className="col-span-1">Type</div>
            <div className="col-span-1">Price</div>
            <div className="col-span-2">Created For</div>
            <div className="col-span-1">Created By</div>
            <div className="col-span-1 text-center">Status</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-200">
            {mealPlans.length > 0 ? (
              mealPlans.map((mealPlan, index) => {
                const expired = isExpired(
                  mealPlan.startDate,
                  mealPlan.duration
                );
                return (
                  <div
                    key={mealPlan._id}
                    className={`grid grid-cols-11 gap-4 p-4 hover:bg-gray-50 transition-opacity duration-300 ${
                      isTransitioning ? "opacity-0" : "opacity-100"
                    }`}
                  >
                    <div className="col-span-1 text-gray-600 font-medium">
                      {currentPage * limit + index + 1}
                    </div>
                    <div className="col-span-2 text-gray-700 text-sm line-clamp-2">
                      {mealPlan.title}
                    </div>
                    <div className="col-span-1 text-gray-700 text-sm">
                      {formatDate(mealPlan.startDate)}
                    </div>
                    <div className="col-span-1 text-gray-700 text-sm">
                      {mealPlan.duration} days
                    </div>
                    <div className="col-span-1 text-gray-700 text-sm">
                      {mealPlan.type === "fixed" ? "Fixed" : "Custom"}
                    </div>
                    <div className="col-span-1 text-gray-700 text-sm">
                      {formatPrice(mealPlan.price)}
                    </div>
                    <div className="col-span-2 text-gray-700 text-sm flex items-center">
                      <img
                        src={
                          mealPlan.userId?.avatarUrl ||
                          "https://i.pinimg.com/736x/81/ec/02/81ec02c841e7aa13d0f099b5df02b25c.jpg"
                        }
                        alt="User Avatar"
                        className="w-8 h-8 rounded-full mr-2 ml-14"
                      />
                      <span className="line-clamp-1">
                        {mealPlan.userId?.username ||
                          mealPlan.userId ||
                          "Unknown"}
                      </span>
                    </div>
                    <div className="col-span-1 text-gray-700 text-sm flex items-center">
                      <img
                        src={
                          mealPlan.createdBy?.avatarUrl ||
                          "https://i.pinimg.com/736x/81/ec/02/81ec02c841e7aa13d0f099b5df02b25c.jpg"
                        }
                        alt="Creator Avatar"
                        className="w-8 h-8 rounded-full mr-2"
                      />
                      <span className="line-clamp-1">
                        {mealPlan.createdBy?.username ||
                          mealPlan.createdBy ||
                          "Unknown"}
                      </span>
                    </div>
                    <div className="col-span-1 text-center">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          expired
                            ? "bg-red-100 text-red-800"
                            : mealPlan.isPause
                            ? "bg-yellow-100 text-yellow-800"
                            : mealPlan.isBlock
                            ? "bg-gray-100 text-gray-800"
                            : "bg-[#40B491] text-white"
                        }`}
                      >
                        {expired
                          ? "Expired"
                          : mealPlan.isPause
                          ? "Paused"
                          : mealPlan.isBlock
                          ? "Blocked"
                          : "Active"}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-6 text-center text-gray-500">
                No meal plans found.
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="p-4 bg-gray-50">
            <Pagination
              limit={limit}
              setLimit={setLimit}
              totalItems={totalItems}
              handlePageClick={handlePageClick}
              currentPage={currentPage}
              text={"Meal Plans"}
            />
          </div>
        </div>
      </Loading>
    </div>
  );
};

export default TableMealPlanAdmin;
