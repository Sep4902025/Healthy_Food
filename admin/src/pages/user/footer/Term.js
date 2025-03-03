import React, { useEffect, useState } from "react";
import termService from "../../../services/footer/termServices";

const Term = () => {
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await termService.getTerms();
        console.log("Processed API Response:", result); // Debug dữ liệu

        if (result.success && Array.isArray(result.data)) {
          setTerms(result.data);
        } else {
          setError(result.message || "Không có dữ liệu Terms.");
        }
      } catch (error) {
        setError("Lỗi khi tải dữ liệu Terms.");
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold text-green-700 mb-4">Terms & Conditions</h1>

      {/* Loading State */}
      {loading && <p className="text-gray-500">Đang tải...</p>}

      {/* Error State */}
      {error && <p className="text-red-500 font-semibold">{error}</p>}

      {/* Hiển thị danh sách điều khoản */}
      {!loading && !error && terms.length > 0 ? (
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
        !loading && <p className="text-gray-500">Không có điều khoản nào được tìm thấy.</p>
      )}
    </div>
  );
};

export default Term;
