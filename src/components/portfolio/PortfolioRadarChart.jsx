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
  // 백엔드 데이터가 아직 안 왔거나 에러가 났을 때 화면 깨짐 방지용 기본값
  // 아까 확정한 5가지 공통 기준이 들어갑니다.
  const defaultData = [
    { subject: "직무 적합성", score: 0, fullMark: 100 },
    { subject: "문제 해결력", score: 0, fullMark: 100 },
    { subject: "프로젝트 완성도", score: 0, fullMark: 100 },
    { subject: "협업·소통", score: 0, fullMark: 100 },
    { subject: "성장 잠재력", score: 0, fullMark: 100 },
  ];

  // 부모 컴포넌트에서 데이터가 제대로 넘어오면 그걸 쓰고, 아니면 기본값을 씁니다.
  const chartData = data && data.length > 0 ? data : defaultData;

  return (
    <div className="bg-white shadow-lg rounded-xl p-6 h-full flex flex-col justify-center border border-gray-100">
      <h3 className="text-lg font-bold text-gray-800 mb-6 text-center">
        핵심 역량 분석 결과
      </h3>

      <div className="w-full min-h-[320px] flex-grow">
        <ResponsiveContainer width="100%" height="100%">
          {/* outerRadius를 조절해서 그래프가 밖으로 삐져나가지 않게 여백을 줍니다 */}
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
            <PolarGrid stroke="#e5e7eb" />

            {/* 오각형 꼭짓점에 들어갈 라벨 (폰트 크기와 색상 조정) */}
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: "#4B5563", fontSize: 13, fontWeight: 600 }}
            />

            {/* 거미줄 내부의 점수선 (숨김 처리해서 더 깔끔하게) */}
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              tick={false}
              axisLine={false}
            />

            {/* 마우스 올렸을 때 점수 보여주는 툴팁 추가! */}
            <Tooltip
              wrapperStyle={{ outline: "none" }}
              contentStyle={{
                borderRadius: "8px",
                border: "none",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
              formatter={(value) => [`${value}점`, "내 점수"]}
            />

            {/* 실제 그려지는 색상 채워진 다각형 영역 */}
            <Radar
              name="역량 점수"
              dataKey="score"
              stroke="#4f46e5" // 진한 남색 (테두리)
              strokeWidth={2}
              fill="#6366f1" // 보라빛 파란색 (내부)
              fillOpacity={0.5} // 반투명
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PortfolioRadarChart;
