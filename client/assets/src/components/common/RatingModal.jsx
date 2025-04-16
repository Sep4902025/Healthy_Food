// Import các thư viện và hooks cần thiết từ React
import React, { useState, useEffect } from "react";
// Import các components từ React Native
import {
 Modal,
 View,
 Text,
 TextInput,
 TouchableOpacity,
 StyleSheet,
} from "react-native";

// Định nghĩa component RatingModal để hiển thị cửa sổ đánh giá
// Nhận vào các props để kiểm soát hiển thị và xử lý sự kiện
const RatingModal = ({
 visible,         // Trạng thái hiển thị Modal
 onClose,         // Hàm xử lý khi đóng Modal
 rating,          // Giá trị đánh giá hiện tại
 setRating,       // Hàm cập nhật đánh giá
 comment,         // Giá trị bình luận hiện tại
 setComment,      // Hàm cập nhật bình luận
 handleRate,      // Hàm xử lý khi đánh giá
 submitComment,   // Hàm xử lý khi gửi bình luận
}) => {
 return (
   // Component Modal từ React Native
   <Modal
     visible={visible}           // Hiển thị dựa trên prop visible
     animationType="slide"       // Hiệu ứng trượt khi hiển thị
     transparent                 // Nền trong suốt
     onRequestClose={onClose}    // Xử lý khi người dùng nhấn nút Back
   >
     {/* Container chính của Modal với nền tối mờ */}
     <View style={styles.modalContainer}>
       {/* Nội dung chính của Modal */}
       <View style={styles.modalContent}>
         {/* Tiêu đề Modal */}
         <Text style={styles.title}>Rating Recipe</Text>

         {/* Container chứa các ngôi sao đánh giá */}
         <View style={styles.starsContainer}>
           {/* Map qua mảng từ 1 đến 5 để tạo 5 ngôi sao */}
           {[1, 2, 3, 4, 5].map((star) => (
             // Mỗi ngôi sao là một TouchableOpacity để người dùng có thể nhấn
             <TouchableOpacity
               key={star}                      // Key duy nhất cho mỗi sao
               onPress={() => {
                 // Khi nhấn vào sao, cập nhật rating và gọi hàm handleRate
                 setRating({ ...rating, star });
                 handleRate(star);
               }}
               activeOpacity={0.7}             // Độ mờ khi nhấn
             >
               {/* Hiển thị ký hiệu ngôi sao */}
               <Text
                 style={[
                   styles.star,
                   {
                     // Đổi màu sao dựa vào số sao đã chọn
                     color:
                       star <= (rating?.star || 0) ? "#FFD700" : "#ccc",
                   },
                 ]}
               >
                 ★
               </Text>
             </TouchableOpacity>
           ))}
         </View>

         {/* TextInput để nhập bình luận */}
         <TextInput
           placeholder="Leave a comment... (optional)"  // Văn bản gợi ý
           value={comment}                             // Giá trị hiện tại
           onChangeText={setComment}                   // Hàm xử lý khi text thay đổi
           multiline                                   // Cho phép nhập nhiều dòng
           numberOfLines={4}                           // Hiển thị 4 dòng
           style={styles.textInput}                    // Style cho input
         />

         {/* Nút gửi bình luận, chỉ hiển thị khi có comment */}
         {comment.length > 0 && (
           <TouchableOpacity
             onPress={() => {
               submitComment(comment);        // Gọi hàm xử lý gửi bình luận
               onClose();                     // Đóng Modal
               setComment("");                // Xóa nội dung bình luận
             }}
             style={styles.submitButton}      // Style cho nút
           >
             <Text style={styles.submitButtonText}>Submit Comment</Text>
           </TouchableOpacity>
         )}

         {/* Nút đóng Modal */}
         <TouchableOpacity onPress={onClose} style={styles.closeButton}>
           <Text style={styles.closeText}>Close</Text>
         </TouchableOpacity>
       </View>
     </View>
   </Modal>
 );
};

// Export component để sử dụng ở các file khác
export default RatingModal;

// Định nghĩa styles cho component
const styles = StyleSheet.create({
 modalContainer: {
   flex: 1,                      // Chiếm toàn bộ không gian
   justifyContent: "center",     // Căn giữa theo chiều dọc
   alignItems: "center",         // Căn giữa theo chiều ngang
   backgroundColor: "rgba(0,0,0,0.5)",  // Nền tối mờ
 },
 modalContent: {
   backgroundColor: "#fff",      // Nền trắng cho nội dung
   padding: 20,                  // Padding xung quanh
   borderRadius: 12,             // Bo tròn góc
   width: "85%",                 // Chiều rộng 85% màn hình
 },
 title: {
   fontSize: 18,                 // Kích thước chữ
   fontWeight: "bold",           // Đậm
   marginBottom: 15,             // Khoảng cách dưới
 },
 starsContainer: {
   flexDirection: "row",         // Sắp xếp theo hàng ngang
   justifyContent: "center",     // Căn giữa theo chiều ngang
   marginBottom: 15,             // Khoảng cách dưới
 },
 star: {
   fontSize: 32,                 // Kích thước sao
   marginHorizontal: 4,          // Khoảng cách giữa các sao
 },
 textInput: {
   borderWidth: 1,               // Độ dày viền
   borderColor: "#ccc",          // Màu viền
   borderRadius: 8,              // Bo tròn góc
   padding: 10,                  // Padding bên trong
   width: "100%",                // Chiều rộng 100%
   marginBottom: 20,             // Khoảng cách dưới
   textAlignVertical: "top",     // Căn text theo đỉnh
 },
 submitButton: {
   backgroundColor: "#4CAF50",   // Màu nền xanh lá
   paddingVertical: 12,          // Padding theo chiều dọc
   borderRadius: 10,             // Bo tròn góc
   alignItems: "center",         // Căn giữa text
   marginBottom: 10,             // Khoảng cách dưới
 },
 submitButtonText: {
   color: "#fff",                // Màu chữ trắng
   fontWeight: "bold",           // Đậm
   fontSize: 16,                 // Kích thước chữ
 },
 closeButton: {
   alignItems: "center",         // Căn giữa nút đóng
 },
 closeText: {
   color: "#888",                // Màu chữ xám
   fontSize: 14,                 // Kích thước chữ
 },
});