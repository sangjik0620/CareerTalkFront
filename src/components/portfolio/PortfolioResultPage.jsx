import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import PortfolioSummaryCard from "./PortfolioSummaryCard";
import PortfolioRadarChart from "./PortfolioRadarChart";
import PortfolioQuestionItem from "./PortfolioQuestionItem";

const PortfolioResultPage = () => {
  const location = useLocation();

  const [currentData, setCurrentData] = useState(location.state?.analysisData);
  const [isReanalyzing, setIsReanalyzing] = useState(false);

  //  이제 백엔드에서 넘겨준 currentData.portfolioId 를 아주 잘 찾을 수 있습니다!
  const portfolioId = currentData?.portfolioId;

  const handleReanalyze = async () => {
    if (!portfolioId) {
      alert("포트폴리오 식별 정보가 없어 재분석할 수 없습니다.");
      return;
    }
    if (!window.confirm("재분석할까요?")) return;

    setIsReanalyzing(true);
    try {
      const response = await fetch(
        `http://localhost:8080/api/portfolios/${portfolioId}/reanalyze`,
        {
          method: "POST",
        },
      );

      if (!response.ok) throw new Error("재분석 실패");

      const newData = await response.json();
      setCurrentData(newData);
      alert(" 재분석이 완료되었습니다!");
    } catch (error) {
      console.error(error);
      alert("재분석 중 문제가 발생했습니다.");
    } finally {
      setIsReanalyzing(false);
    }
  };

  if (!currentData) {
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
    <div className="max-w-5xl mx-auto p-6 bg-gray-50 min-h-screen pt-10 relative">
      {/* 상단 제목 영역 (버튼은 아래로 이사 갔습니다!) */}
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8 tracking-tight">
        포트폴리오 분석 결과
      </h1>

      <PortfolioSummaryCard
        targetJob={currentData.targetJob}
        overallScore={currentData.overallScore}
        oneLineReview={currentData.oneLineReview}
        summaryDetail={currentData.summaryDetail}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 mb-8">
        <div className="h-[400px]">
          <PortfolioRadarChart data={currentData.chartData} />
        </div>

        <div className="bg-white shadow-lg rounded-xl p-6 h-fit border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
            <span>🔍</span> 실전 대비 면접 질문
          </h3>
          <div className="space-y-1">
            {currentData.questions.map((item, idx) => (
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

      {/*  우측 하단으로 이동한 재분석 버튼 영역 */}
      <div className="flex justify-end pb-10">
        <button
          onClick={handleReanalyze}
          disabled={isReanalyzing}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white shadow-md transition-all 
            ${isReanalyzing ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg active:scale-95"}`}
        >
          {isReanalyzing ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>재분석 중...</span>
            </>
          ) : (
            <>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span> 재분석</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default PortfolioResultPage;
