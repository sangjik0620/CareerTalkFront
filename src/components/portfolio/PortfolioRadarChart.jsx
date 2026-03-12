import React from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const PortfolioRadarChart = ({ data }) => {
  const defaultData = [
    { subject: "직무 적합성", score: 0, fullMark: 100 },
    { subject: "문제 해결력", score: 0, fullMark: 100 },
    { subject: "프로젝트 완성도", score: 0, fullMark: 100 },
    { subject: "협업·소통", score: 0, fullMark: 100 },
    { subject: "성장 잠재력", score: 0, fullMark: 100 },
  ];

  const chartData = data && data.length > 0 ? data : defaultData;

  return (
    <div className="w-full h-full flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="60%" data={chartData}>
          <PolarGrid stroke="#e5e7eb" />

          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: "#4B5563", fontSize: 11.5, fontWeight: 700 }}
          />

          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={false}
            axisLine={false}
          />

          <Tooltip
            wrapperStyle={{ outline: "none" }}
            contentStyle={{
              borderRadius: "8px",
              border: "none",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              fontWeight: "bold",
              color: "#1f55ff",
            }}
            formatter={(value) => [`${value}점`, "역량 점수"]}
          />

          <Radar
            name="역량 점수"
            dataKey="score"
            stroke="#1f55ff"
            strokeWidth={2.5}
            fill="#1f55ff"
            fillOpacity={0.25}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PortfolioRadarChart;
