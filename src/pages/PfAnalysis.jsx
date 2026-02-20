import { useState } from "react";
import PortfolioUploadModal from "../components/portfolio/PortfolioUploadModal";

export default function PfAnalysis() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div>
      {/* 1. 모달 여는 버튼 */}
      <button onClick={() => setIsModalOpen(true)}>
        포트폴리오 분석 시작하기
      </button>

      {/* 2. 숨겨진 모달 */}
      <PortfolioUploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAnalyzeSuccess={() => alert("결과 페이지로 넘어갑니다!")}
      />
    </div>
  );
}
