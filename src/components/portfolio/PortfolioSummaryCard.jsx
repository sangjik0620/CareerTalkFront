import React from "react";

const PortfolioSummaryCard = ({
  targetJob,
  overallScore,
  oneLineReview,
  summaryDetail,
}) => {
  return (
    <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
      {/* 상단: 직무 배지와 종합 점수를 양옆으로 배치 */}
      <div className="flex justify-between items-start mb-2">
        {/* 직무 배지 */}
        <span className="bg-indigo-100 text-indigo-800 text-sm font-bold px-3 py-1 rounded-full h-fit mt-1">
          {targetJob} 분석 결과
        </span>

        {/*  새로 추가된 '총점' 표시 영역 (우측 상단) */}
        <div className="flex flex-col items-end bg-indigo-50/50 px-4 py-2 rounded-xl border border-indigo-50">
          <span className="text-xs font-bold text-indigo-400 mb-0.5">
            AI 종합 점수
          </span>
          <div className="text-3xl font-extrabold text-indigo-600 tracking-tight">
            {overallScore}
            <span className="text-lg font-bold text-indigo-400 ml-1">점</span>
          </div>
        </div>
      </div>

      {/* 한 줄 평 */}
      <h2 className="text-2xl font-bold text-gray-800 mt-2 mb-4 leading-tight pr-4">
        "{oneLineReview}"
      </h2>

      {/* 상세 피드백 */}
      <div className="bg-gray-50 p-5 rounded-lg text-gray-700 leading-relaxed whitespace-pre-wrap border border-gray-200">
        <p className="font-bold text-gray-900 mb-2 flex items-center gap-2">
          <span>💡</span> 상세 피드백
        </p>
        {summaryDetail}
      </div>
    </div>
  );
};

export default PortfolioSummaryCard;
