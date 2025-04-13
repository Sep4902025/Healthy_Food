

// === PHẦN 1: IMPORT ===
import moment from "moment";
import { SeasonType } from "../constants/SeasonType";
import { LightContants } from "../constants/LightConstants";
import store from "../redux/store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Dimensions, PixelRatio } from "react-native";
const window = Dimensions.get("window");
const scale = window.width / 375;

// Import thư viện moment.js để xử lý date/time

// === PHẦN 2: FORMAT PRICE ===
export const formatPrice = (price) => {
  // Chuyển đổi input thành số nếu là string
  if (typeof price !== "number") price = parseFloat(price);
  // Kiểm tra nếu giá trị không hợp lệ
  if (isNaN(price)) return "Invalid price";

  // Sử dụng Intl.NumberFormat để format số theo định dạng tiền tệ
  return new Intl.NumberFormat("en-US", {
    style: "currency", // Kiểu format là tiền tệ
    currency: "USD", // Đơn vị tiền tệ là USD
  }).format(price);
};
// Ví dụ:
// formatPrice(1000) => "$1,000.00"
// formatPrice("1000.50") => "$1,000.50"
// formatPrice("abc") => "Invalid price"

// === PHẦN 3: FORMAT DATE ===
export const formatDate = (date) => {
  // Chuyển đổi input thành moment object
  const momentDate = moment(date);
  // Kiểm tra tính hợp lệ của ngày
  if (!momentDate.isValid()) return "Invalid date";

  // Format ngày theo định dạng DD-MM-YYYY
  return momentDate.format("DD-MM-YYYY");
};
// Ví dụ:
// formatDate("2024-01-11") => "11-01-2024"
// formatDate("invalid") => "Invalid date"

// === PHẦN 4: FORMAT TIME ===
export const formatTime = (date) => {
  // Chuyển đổi input thành moment object
  const momentDate = moment(date);
  // Kiểm tra tính hợp lệ của thời gian
  if (!momentDate.isValid()) return "Invalid time";

  // Format thời gian theo định dạng mm-HH
  return momentDate.format("mm-HH");
};
// Ví dụ:
// formatTime("2024-01-11 14:30") => "30-14"
// formatTime("invalid") => "Invalid time"

export const getSeasonColor = (season) => {
  if (season == "All Seasons") {
    return SeasonType.all.color;
  }
  const color = SeasonType[season]?.color;
  return color ?? "black";
};

// Lưu từ khóa tìm kiếm gần nhất (tối đa 3 từ khóa)
export const saveSearchHistory = async (newKeyword) => {
  try {
    const history = await AsyncStorage.getItem("SearchHistory");
    let historyArray = history ? JSON.parse(history) : [];

    // Loại bỏ từ khóa nếu đã tồn tại và thêm vào đầu danh sách
    historyArray = [
      newKeyword,
      ...historyArray.filter((item) => item !== newKeyword),
    ];

    // Giữ lại tối đa 3 từ khóa gần nhất
    if (historyArray.length > 3) {
      historyArray = historyArray.slice(0, 3);
    }

    await AsyncStorage.setItem("SearchHistory", JSON.stringify(historyArray));
  } catch (error) {
    console.error("Lỗi khi lưu lịch sử tìm kiếm:", error);
  }
};

// Lấy danh sách lịch sử tìm kiếm
export const getSearchHistory = async () => {
  try {
    const history = await AsyncStorage.getItem("SearchHistory");
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error("Lỗi khi lấy lịch sử tìm kiếm:", error);
    return [];
  }
};

// Xóa lịch sử tìm kiếm
export const clearSearchHistory = async () => {
  try {
    await AsyncStorage.removeItem("SearchHistory");
  } catch (error) {
    console.error("Lỗi khi xóa lịch sử tìm kiếm:", error);
  }
};

export function arrayToString(arr) {
  return Array.isArray(arr) ? arr?.join(",") : "";
}

export function stringToArray(str) {
  return typeof str === 'string' ? str?.split(",") : [];
}

export function secondsToMinutes(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

export function successStatus(status = 404) {
  if (status > 0 && status < 400) {
    return true
  } else {
    return false
  }
}

export const normalize = (size) => {
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};