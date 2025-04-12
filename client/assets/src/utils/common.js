
import moment from "moment";
import { SeasonType } from "../constants/SeasonType";
import { LightContants } from "../constants/LightConstants";
import store from "../redux/store";
import AsyncStorage from "@react-native-async-storage/async-storage";




export const formatPrice = (price) => {
  
  if (typeof price !== "number") price = parseFloat(price);

  if (isNaN(price)) return "Invalid price";

 
  return new Intl.NumberFormat("en-US", {
    style: "currency", 
    currency: "USD", 
  }).format(price);
};

export const formatDate = (date) => {

  const momentDate = moment(date);

  if (!momentDate.isValid()) return "Invalid date";


  return momentDate.format("DD-MM-YYYY");
};



export const formatTime = (date) => {

  const momentDate = moment(date);
 
  if (!momentDate.isValid()) return "Invalid time";


  return momentDate.format("mm-HH");
};

export const getSeasonColor = (season) => {
  if (season == "All Seasons") {
    return SeasonType.all.color;
  }
  const color = SeasonType[season]?.color;
  return color ?? "black";
};


export const saveSearchHistory = async (newKeyword) => {
  try {
    const history = await AsyncStorage.getItem("SearchHistory");
    let historyArray = history ? JSON.parse(history) : [];

  
    historyArray = [
      newKeyword,
      ...historyArray.filter((item) => item !== newKeyword),
    ];

  
    if (historyArray.length > 3) {
      historyArray = historyArray.slice(0, 3);
    }

    await AsyncStorage.setItem("SearchHistory", JSON.stringify(historyArray));
  } catch (error) {
    console.error("Lỗi khi lưu lịch sử tìm kiếm:", error);
  }
};


export const getSearchHistory = async () => {
  try {
    const history = await AsyncStorage.getItem("SearchHistory");
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error("Lỗi khi lấy lịch sử tìm kiếm:", error);
    return [];
  }
};


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