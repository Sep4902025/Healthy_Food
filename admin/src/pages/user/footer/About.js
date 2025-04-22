import React, { useEffect, useState } from "react";
import aboutService from "../../../services/footer/aboutServices";

const AboutPage = () => {
  const [aboutData, setAboutData] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5); // Default 5 items per page
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const result = await aboutService.getAboutUs(currentPage, itemsPerPage);
      console.log("API Response:", result);
      if (result.success) {
        setAboutData(result.data.data.aboutUs || []); // Truy cập đúng result.data.data.aboutUs
        setTotalPages(result.data.totalPages || 1);
      } else {
        setError(result.message);
        setAboutData([]);
      }
      setLoading(false);
    };

    fetchData();
  }, [currentPage, itemsPerPage]);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) return <p className="text-center text-green-600">Loading...</p>;
  if (error) return <p className="text-center text-red-500">Error: {error}</p>;

  return (
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-5xl font-extrabold text-custom-green text-center mb-8">About Us</h1>
      {aboutData.length > 0 ? (
        aboutData.map((item, index) => (
          <div key={index} className="bg-white shadow-lg rounded-lg overflow-hidden mb-10">
            {item.bannerUrl && (
              <div className="relative h-80">
                <img
                  src={item.bannerUrl}
                  alt="About Us Banner"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center"></div>
              </div>
            )}
            <div className="p-8">
              {item.content ? (
                <p className="text-gray-700 text-lg leading-relaxed">{item.content}</p>
              ) : (
                <p className="text-gray-500 text-lg">No content available.</p>
              )}
            </div>
          </div>
        ))
      ) : (
        <p className="text-center text-gray-500 text-lg">No data available.</p>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-8 space-x-2">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 border rounded-md text-gray-700 bg-white hover:bg-gray-100 disabled:opacity-50"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => paginate(i + 1)}
              className={`px-4 py-2 border rounded-md ${
                currentPage === i + 1
                  ? "bg-green-500 text-white"
                  : "text-gray-700 bg-white hover:bg-gray-100"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border rounded-md text-gray-700 bg-white hover:bg-gray-100 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AboutPage;
