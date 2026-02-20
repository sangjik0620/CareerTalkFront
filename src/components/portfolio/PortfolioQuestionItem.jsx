import React, { useState } from "react";

const PortfolioQuestionItem = ({ index, question, intent }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg mb-3 overflow-hidden bg-white">
      {/* 질문 영역 (클릭 시 열림/닫힘) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left p-4 hover:bg-gray-50 flex justify-between items-start transition-colors"
      >
        <div className="flex items-start gap-3">
          <span className="bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded text-sm shrink-0 mt-0.5">
            Q{index + 1}
          </span>
          <span className="font-medium text-gray-800 break-keep leading-snug">
            {question}
          </span>
        </div>
        <span className="text-gray-400 text-sm shrink-0 ml-4 mt-0.5">
          {isOpen ? "▲ 접기" : "▼ 의도 보기"}
        </span>
      </button>

      {/* 질문 의도 영역 (isOpen이 true일 때만 보임) */}
      {isOpen && (
        <div className="bg-indigo-50 p-4 border-t border-indigo-100 animate-fade-in-down">
          <span className="text-xs font-bold text-indigo-500 uppercase tracking-wide">
            질문 의도
          </span>
          <p className="text-sm text-gray-800 mt-1 font-medium"> {intent}</p>
        </div>
      )}
    </div>
  );
};

export default PortfolioQuestionItem;
