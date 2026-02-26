import React, { useState, useEffect } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom"; // ⭐ useParams, useNavigate 추가!
import PortfolioSummaryCard from "./PortfolioSummaryCard";
import PortfolioRadarChart from "./PortfolioRadarChart";
import PortfolioQuestionItem from "./PortfolioQuestionItem";

const PortfolioResultPage = () => {
  const { analysisId } = useParams(); // ⭐ 1. 주소창에서 분석 번호(analysisId) 가져오기
  const location = useLocation();
  const navigate = useNavigate(); // ⭐ 2. 페이지 이동을 위한 훅

  // state로 넘어온 데이터가 있으면 그걸 쓰고, 없으면 null로 시작
  const [currentData, setCurrentData] = useState(
    location.state?.analysisData || null,
  );
  const [isLoading, setIsLoading] = useState(!currentData); // 초기 데이터 없으면 로딩 켜기
  const [isReanalyzing, setIsReanalyzing] = useState(false);

  // 재분석 API를 찌르기 위해 포트폴리오 번호 찾기
  const portfolioId = currentData?.portfolioId;

  // ⭐ 3. 새로고침 하거나 URL이 바뀔 때 백엔드에서 데이터 가져오기!
  useEffect(() => {
    // 이미 데이터가 있고, 그 데이터의 ID가 현재 주소창의 ID와 같으면 서버 통신 안 함
    if (currentData && String(currentData.analysisId) === String(analysisId)) {
      setIsLoading(false);
      return;
    }

    const fetchResultData = async () => {
      setIsLoading(true);
      try {
        // 백엔드 GET API 호출
        const response = await fetch(
          `http://localhost:8080/api/portfolios/${analysisId}/result`,
        );
        if (!response.ok) throw new Error("결과를 불러오지 못했습니다.");

        const data = await response.json();
        setCurrentData(data);
      } catch (error) {
        console.error(error);
        alert("데이터를 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    if (analysisId) {
      fetchResultData();
    }
  }, [analysisId]); // 주소창 번호가 바뀔 때마다 실행

  const handleReanalyze = async () => {
    if (!portfolioId) {
      alert("포트폴리오 식별 정보가 없어 재분석할 수 없습니다.");
      return;
    }
    if (!window.confirm("재분석할까요")) return;

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
      alert("재분석이 완료되었습니다!");

      // ⭐ 4. 핵심: 재분석이 끝나면 새로운 분석 번호가 담긴 URL로 샥! 이동합니다!
      navigate(`/portfolio/result/${newData.analysisId}`, {
        state: { analysisData: newData },
      });
    } catch (error) {
      console.error(error);
      alert("재분석 중 문제가 발생했습니다.");
    } finally {
      setIsReanalyzing(false);
    }
  };

  // ⭐ 로딩 중일 때 보여줄 화면
  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 font-medium">
          분석 결과를 불러오는 중입니다...
        </p>
      </div>
    );
  }

  // 데이터가 없을 때 보여줄 화면
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
      {/* 상단 제목 영역 */}
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

      {/* 우측 하단 재분석 버튼 */}
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
