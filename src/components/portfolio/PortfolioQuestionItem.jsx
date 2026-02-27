import React, { useState } from "react";

const PortfolioQuestionItem = ({ index, question, intent }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-[#0F3CA01F] rounded-2xl bg-gradient-to-b from-white to-[#f6f9ff] shadow-[0_10px_26px_rgba(10,30,80,0.06)] overflow-hidden flex flex-col h-fit">
      <button
        onClick={() => setIsOpen(!isOpen)}
        // ⭐ items-start 대신 items-center를 주고 패딩을 조절하여 딱 맞게 정렬!
        className="w-full text-left py-4 px-5 flex gap-4 items-center hover:bg-white/50 transition-colors"
      >
        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-[#1f55ff] border border-[#1f55ff40] bg-white shrink-0 shadow-sm">
          Q{index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[14px] text-[#0b1b3a] font-bold leading-snug break-keep">
            {question}
          </span>
        </div>
        <div className="shrink-0 text-gray-400 text-xs font-bold">
          {isOpen ? "▲" : "▼"}
        </div>
      </button>

      {isOpen && (
        <div className="px-5 pb-5 animate-fade-in-down">
          <div className="border-t border-[#0F3CA014] pt-3 mt-1">
            <span className="inline-block px-2 py-1 rounded bg-[#1f55ff1A] text-[#1f55ff] text-[11px] font-bold mb-1.5">
              질문 의도
            </span>
            <p className="text-[13px] text-[#0b1b3a]/80 leading-relaxed font-medium">
              {intent}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioQuestionItem;
