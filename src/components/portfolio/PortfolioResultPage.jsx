import React from "react";
import { useLocation } from "react-router-dom"; // ⭐ 데이터를 받기 위해 추가
import PortfolioSummaryCard from "./PortfolioSummaryCard";
import PortfolioRadarChart from "./PortfolioRadarChart";
import PortfolioQuestionItem from "./PortfolioQuestionItem";

const PortfolioResultPage = () => {
  const location = useLocation(); // ⭐ 현재 경로 정보 가져오기

  // ⭐ navigate 할 때 보낸 state.analysisData를 꺼냅니다.
  const analysisData = location.state?.analysisData;

  // 데이터가 없으면 안내 화면 표시 (배달 사고 방지)
  if (!analysisData) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50">
        <span className="text-5xl mb-4">😮</span>
        <p className="text-gray-500 font-medium">아직 분석 결과가 없습니다.</p>
        <p className="text-gray-400 text-sm mt-2">
          포트폴리오를 먼저 업로드해 주세요!
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 bg-gray-50 min-h-screen pt-10">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8 tracking-tight">
        포트폴리오 분석 결과
      </h1>

      <PortfolioSummaryCard
        targetJob={analysisData.targetJob}
        oneLineReview={analysisData.oneLineReview}
        summaryDetail={analysisData.summaryDetail}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="h-[400px]">
          <PortfolioRadarChart data={analysisData.chartData} />
        </div>

        <div className="bg-white shadow-lg rounded-xl p-6 h-fit border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
            <span>🔍</span> 실전 대비 면접 질문
          </h3>
          <div className="space-y-1">
            {analysisData.questions.map((item, idx) => (
              <PortfolioQuestionItem
                key={idx}
                index={idx}
                question={item.q}
                intent={item.intent}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioResultPage;
