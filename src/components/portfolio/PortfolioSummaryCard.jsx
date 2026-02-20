import React from "react";

const PortfolioSummaryCard = ({ targetJob, oneLineReview, summaryDetail }) => {
  return (
    <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
      {/* 직무 배지 */}
      <span className="bg-indigo-100 text-indigo-800 text-sm font-bold px-3 py-1 rounded-full">
        {targetJob} 분석 결과
      </span>

      {/* 한 줄 평 */}
      <h2 className="text-2xl font-bold text-gray-800 mt-4 mb-3 leading-tight">
        "{oneLineReview}"
      </h2>

      {/* 상세 피드백 */}
      <div className="bg-gray-50 p-5 rounded-lg mt-4 text-gray-700 leading-relaxed whitespace-pre-wrap border border-gray-200">
        <p className="font-bold text-gray-900 mb-2 flex items-center gap-2">
          <span>💡</span> 상세 피드백
        </p>
        {summaryDetail}
      </div>
    </div>
  );
};

export default PortfolioSummaryCard;
