import React, { useEffect, useState } from "react";
import termService from "../../../services/footer/termServices";

const Term = () => {
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // Default 5 items per page
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await termService.getTerms(currentPage, itemsPerPage);
        console.log("Processed API Response:", result);

        if (result.success) {
          setTerms(result.data.items || []);
          setTotalPages(result.data.totalPages || 1);
        } else {
          setError(result.message || "No Terms data available.");
          setTerms([]);
        }
      } catch (error) {
        setError("Error loading Terms data.");
        setTerms([]);
      }
      setLoading(false);
    };

    fetchData();
  }, [currentPage]);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) return <p className="text-center text-green-600">Loading...</p>;
  if (error) return <p className="text-center text-red-500">Error: {error}</p>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold text-green-700 mb-4">Terms & Conditions</h1>

      {/* Display list of terms */}
      {terms.length > 0 ? (
        <div className="space-y-6">
          {terms.map((term) => (
            <div key={term._id} className="bg-white p-4 shadow-md rounded-lg">
              {term.bannerUrl && (
                <img
                  src={term.bannerUrl}
                  alt="Banner"
                  className="w-full h-32 object-cover rounded-md mb-4"
                />
              )}
              <p className="text-gray-700 text-lg">{term.content}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No terms found.</p>
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

export default Term;