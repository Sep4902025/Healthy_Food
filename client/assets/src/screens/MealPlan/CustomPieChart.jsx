import React from "react";
import { View, Text } from "react-native";
import Svg, { Path } from "react-native-svg";

const CustomPieChart = ({ data, width, height, innerRadius, outerRadius }) => {
  // Kiểm tra dữ liệu đầu vào No data for pie chart
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <View style={{ width, height, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "gray" }}></Text>
      </View>
    );
  }

  const total = data.reduce((sum, item) => sum + (item.y || 0), 0);

  if (total <= 0) {
    return (
      <View style={{ width, height, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "gray" }}>Invalid data for pie chart</Text>
      </View>
    );
  }

  // Tính góc đầy đủ cho từng phần
  let startAngle = 0;
  const segments = data.map((item) => {
    const percentage = item.y / total;
    const angle = percentage * 360;
    const endAngle = startAngle + angle;

    const segment = {
      startAngle,
      endAngle,
      color: item.color || "#000000", // Đảm bảo có màu mặc định nếu color không được cung cấp
    };

    startAngle = endAngle;
    return segment;
  });

  // Hàm chuyển đổi độ sang radian
  const degreesToRadians = (degrees) => (degrees * Math.PI) / 180;

  // Hàm tạo path cho từng phần của pie chart
  const createPath = (startAngle, endAngle, innerR, outerR) => {
    const startRad = degreesToRadians(startAngle);
    const endRad = degreesToRadians(endAngle);

    const startXOuter = width / 2 + outerR * Math.cos(startRad);
    const startYOuter = height / 2 + outerR * Math.sin(startRad);
    const endXOuter = width / 2 + outerR * Math.cos(endRad);
    const endYOuter = height / 2 + outerR * Math.sin(endRad);

    const startXInner = width / 2 + innerR * Math.cos(startRad);
    const startYInner = height / 2 + innerR * Math.sin(startRad);
    const endXInner = width / 2 + innerR * Math.cos(endRad);
    const endYInner = height / 2 + innerR * Math.sin(endRad);

    const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

    return `
      M ${startXOuter} ${startYOuter}
      A ${outerR} ${outerR} 0 ${largeArcFlag} 1 ${endXOuter} ${endYOuter}
      L ${endXInner} ${endYInner}
      A ${innerR} ${innerR} 0 ${largeArcFlag} 0 ${startXInner} ${startYInner}
      Z
    `;
  };

  return (
    <Svg width={width} height={height}>
      {segments.map((segment, index) => (
        <Path
          key={index}
          d={createPath(segment.startAngle, segment.endAngle, innerRadius, outerRadius)}
          fill={segment.color}
        />
      ))}
    </Svg>
  );
};

export default CustomPieChart;
