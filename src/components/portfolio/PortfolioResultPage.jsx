import React from "react";
// ⭐ 경로를 ./ (같은 폴더) 로 수정했습니다!
import PortfolioSummaryCard from "./PortfolioSummaryCard";
import PortfolioRadarChart from "./PortfolioRadarChart";
import PortfolioQuestionItem from "./PortfolioQuestionItem";

// 화면에 띄워볼 임시(Dummy) 데이터
const DUMMY_DATA = {
  targetJob: "백엔드 개발자",
  oneLineReview:
    "탄탄한 기본기를 바탕으로 문제 해결 과정이 돋보이는 훌륭한 포트폴리오입니다.",
  summaryDetail:
    "지원자님은 Spring Boot와 JPA를 활용한 백엔드 아키텍처 설계에 높은 이해도를 보여주고 있습니다. 특히 대용량 트래픽 문제를 식별하고 캐싱을 통해 해결한 '문제 해결력'이 매우 인상적입니다. 다만, 팀원들과 어떻게 의견을 조율하며 프로젝트를 진행했는지에 대한 '협업·소통' 관련 기록이 조금 더 보완된다면 완벽할 것 같습니다.",

  chartData: [
    { subject: "직무 적합성", score: 90, fullMark: 100 },
    { subject: "문제 해결력", score: 95, fullMark: 100 },
    { subject: "프로젝트 완성도", score: 85, fullMark: 100 },
    { subject: "협업·소통", score: 60, fullMark: 100 },
    { subject: "성장 잠재력", score: 80, fullMark: 100 },
  ],

  questions: [
    {
      q: "포트폴리오를 보면 캐싱을 적용해 성능을 개선하셨는데, 이때 발생할 수 있는 '데이터 정합성' 문제는 어떻게 해결하셨나요?",
      intent:
        "단순히 기술을 써본 것을 넘어, 기술의 한계점까지 깊이 이해하고 있는지 검증",
    },
    {
      q: "팀 프로젝트 진행 시 의견 충돌이 발생했을 때, 본인만의 조율 방식이 있다면 사례를 들어 설명해주세요.",
      intent: "협업 능력 및 소프트 스킬 파악",
    },
    {
      q: "이 프로젝트를 다시 처음부터 개발한다면, 아키텍처 측면에서 어떤 부분을 다르게 설계하고 싶으신가요?",
      intent: "프로젝트를 통한 본인의 성장 포인트와 논리적 사고력 확인",
    },
  ],
};

const PortfolioResultPage = () => {
  return (
    <div className="max-w-5xl mx-auto p-6 bg-gray-50 min-h-screen pt-10">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8 tracking-tight">
        포트폴리오 분석 결과
      </h1>

      {/* 1. 상단: 요약 카드 컴포넌트 렌더링 */}
      <PortfolioSummaryCard
        targetJob={DUMMY_DATA.targetJob}
        oneLineReview={DUMMY_DATA.oneLineReview}
        summaryDetail={DUMMY_DATA.summaryDetail}
      />

      {/* 하단: 차트와 질문 리스트를 좌우로 배치 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* 2. 왼쪽: 레이더 차트 컴포넌트 렌더링 */}
        <div className="h-[400px]">
          {" "}
          {/* 차트가 들어갈 높이를 잡아줍니다 */}
          <PortfolioRadarChart data={DUMMY_DATA.chartData} />
        </div>

        {/* 3. 오른쪽: 질문 리스트 컴포넌트 렌더링 */}
        <div className="bg-white shadow-lg rounded-xl p-6 h-fit border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
            <span></span> 실전 대비 면접 질문
          </h3>

          <div className="space-y-1">
            {/* map 함수를 써서 질문 개수만큼 QuestionItem을 찍어냅니다! */}
            {DUMMY_DATA.questions.map((item, idx) => (
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
