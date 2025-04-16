// Import các hooks cần thiết từ React
import { useState, useEffect } from "react";

// Custom hook để xác định mùa hiện tại dựa trên tháng
function useCurrentSeason() {
  // Sử dụng useState với hàm khởi tạo để tính toán mùa hiện tại một lần duy nhất
  const [season] = useState(() => {
    // Lấy tháng hiện tại (getMonth() trả về 0-11, cộng 1 để có 1-12)
    const currentMonth = new Date().getMonth() + 1;
    // Xác định mùa dựa trên tháng hiện tại
    if (currentMonth >= 1 && currentMonth <= 3) return "Spring"; // Mùa xuân: tháng 1-3
    if (currentMonth >= 4 && currentMonth <= 6) return "Summer"; // Mùa hè: tháng 4-6
    if (currentMonth >= 7 && currentMonth <= 9) return "Fall"; // Mùa thu: tháng 7-9
    return "Winter"; // Mùa đông: tháng 10-12
  });

  // Trả về mùa hiện tại
  return season;
}

// Xuất hook để có thể sử dụng trong các component khác
export default useCurrentSeason;