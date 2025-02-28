import React, { useEffect, useState } from "react";
import aboutService from "../../../services/footer/aboutServices";

const AboutPage = () => {
  const [aboutData, setAboutData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const result = await aboutService.getAboutUs();
      console.log("API Response:", result);
      if (result.success) {
        setAboutData(result.data);
      } else {
        setError(result.message);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) return <p className="text-center text-green-600">Đang tải...</p>;
  if (error) return <p className="text-center text-red-500">Lỗi: {error}</p>;

  return (
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-5xl font-extrabold text-green-800 text-center mb-8">Về Chúng Tôi</h1>
      {aboutData.length > 0 ? (
        aboutData.map((item, index) => (
          <div key={index} className="bg-white shadow-lg rounded-lg overflow-hidden mb-10">
            {item.banner_url && (
              <div className="relative h-80">
                <img
                  src={item.banner_url}
                  alt="About Us Banner"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                
                </div>
              </div>
            )}
            <div className="p-8">
              {item.content ? (
                <p className="text-gray-700 text-lg leading-relaxed">{item.content}</p>
              ) : (
                <p className="text-gray-500 text-lg">Chưa có nội dung.</p>
              )}
            </div>
          </div>
        ))
      ) : (
        <p className="text-center text-gray-500 text-lg">Không có dữ liệu.</p>
      )}
    </div>
  );
};

export default AboutPage;