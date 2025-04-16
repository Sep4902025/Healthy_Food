// Import thư viện React
import React from "react";
// Import các component cần thiết từ React Native
import { View, Text, TouchableOpacity } from "react-native";

// Định nghĩa component Pagination với các props: totalItems, handlePageClick, currentPage và text
const Pagination = ({ totalItems, handlePageClick, currentPage, text }) => {
 // Kiểm tra và đảm bảo totalItems là một số, nếu không thì gán giá trị mặc định là 0
 const safeTotalItems = typeof totalItems === "number" ? totalItems : 0;
 // Số lượng item trên mỗi trang, cố định là 10
 const limit = 10; // Hardcode limit = 10
 // Tính toán tổng số trang dựa trên tổng số items và giới hạn mỗi trang
 const pageCount = Math.ceil(safeTotalItems / limit);

 // Hàm xử lý khi người dùng nhấn nút Previous
 const handlePrevious = () => {
   // Kiểm tra nếu không phải trang đầu tiên thì mới cho phép quay lại
   if (currentPage > 0) {
     // Gọi hàm handlePageClick với trang trước đó
     handlePageClick({ selected: currentPage - 1 });
   }
 };

 // Hàm xử lý khi người dùng nhấn nút Next
 const handleNext = () => {
   // Kiểm tra nếu không phải trang cuối cùng thì mới cho phép đi tiếp
   if (currentPage < pageCount - 1) {
     // Gọi hàm handlePageClick với trang tiếp theo
     handlePageClick({ selected: currentPage + 1 });
   }
 };

 // Trả về JSX của component
 return (
   // Container chính cho phân trang, sử dụng flexbox để căn chỉnh nội dung
   <View className="flex-row items-center justify-center mt-4">
     {/* Nút Previous */}
     <TouchableOpacity
       // Xử lý sự kiện khi nhấn nút Previous
       onPress={handlePrevious}
       // Vô hiệu hóa nút nếu đang ở trang đầu tiên
       disabled={currentPage === 0}
       // Áp dụng lớp CSS với điều kiện: mờ đi nếu là trang đầu tiên
       className={`w-8 h-8 rounded-full flex items-center justify-center mx-1 ${
         currentPage === 0 ? "opacity-40" : "bg-custom-green"
       }`}
     >
       {/* Hiển thị ký hiệu mũi tên trái */}
       <Text className="text-white text-lg">{"<"}</Text>
     </TouchableOpacity>

     {/* Các nút số trang */}
     {Array.from({ length: pageCount }, (_, index) => (
       // Tạo nút cho mỗi trang
       <TouchableOpacity
         // Khóa duy nhất cho mỗi nút
         key={index}
         // Khi nhấn vào nút số trang, chuyển đến trang tương ứng
         onPress={() => handlePageClick({ selected: index })}
         // Áp dụng lớp CSS với điều kiện: khác nhau giữa trang hiện tại và trang khác
         className={`w-8 h-8 rounded-full flex items-center justify-center mx-1 ${
           currentPage === index
             ? "bg-custom-green text-white"
             : "bg-custom-green-100 text-custom-green border border-custom-green"
         }`}
       >
         {/* Hiển thị số trang với màu sắc khác nhau dựa vào trang hiện tại */}
         <Text className={`text-sm ${currentPage === index ? "text-white" : "text-custom-green"}`}>
           {/* Hiển thị số trang (index + 1 vì index bắt đầu từ 0) */}
           {index + 1}
         </Text>
       </TouchableOpacity>
     ))}

     {/* Nút Next */}
     <TouchableOpacity
       // Xử lý sự kiện khi nhấn nút Next
       onPress={handleNext}
       // Vô hiệu hóa nút nếu đang ở trang cuối cùng
       disabled={currentPage === pageCount - 1}
       // Áp dụng lớp CSS với điều kiện: mờ đi nếu là trang cuối cùng
       className={`w-8 h-8 rounded-full flex items-center justify-center mx-1 ${
         currentPage === pageCount - 1 ? "opacity-40" : "bg-custom-green"
       }`}
     >
       {/* Hiển thị ký hiệu mũi tên phải */}
       <Text className="text-white text-lg">{">"}</Text>
     </TouchableOpacity>
   </View>
 );
};

// Export component để sử dụng ở các file khác
export default Pagination;