// Chuyển từ 24h sang 12h (hiển thị)
const convertTo12Hour = (time) => {
  if (!time) return "";
  let [hours, minutes] = time.split(":").map(Number);
  let period = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12; // Chuyển đổi 0 thành 12
  return `${hours}:${String(minutes).padStart(2, "0")} ${period}`;
};

// Chuyển từ 12h sang 24h (trước khi lưu)
const convertTo24Hour = (time) => {
  if (!time) return "";
  let [hours, minutesPeriod] = time.split(":");
  let [minutes, period] = minutesPeriod.split(" ");
  hours = parseInt(hours);
  minutes = parseInt(minutes);

  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};
export { convertTo12Hour, convertTo24Hour };
