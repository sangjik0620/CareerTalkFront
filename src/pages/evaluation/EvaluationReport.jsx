import React from "react";

import SummaryTab from "./tabs/SummaryTab";
import DocumentTab from "./tabs/DocumentTab";
import InterviewTab from "./tabs/InterviewTab";
import ComparisonTab from "./tabs/ComparisonTab";
import CompetencyTab from "./tabs/CompetencyTab";

const Section = ({ children }) => (
  <section className="pdf-section">
    <div className="pdf-section-body">{children}</div>
  </section>
);

const EvaluationReport = ({
  data,
  turns,
  docLoading,
  docErr,
  docAnalysisMap,
  sessionId,
}) => {
  if (!data) return null;

  return (
    <div className="pdf-report">
      {/* 표지(1페이지) */}
      <section className="pdf-cover">
        <div className="pdf-cover-badge">CareerTalk</div>
        <h1 className="pdf-cover-title">면접 평가 리포트</h1>
        <div className="pdf-cover-meta">
          <div>Session: {sessionId ?? "-"}</div>
          <div>Generated: {new Date().toLocaleString()}</div>
        </div>
      </section>

      {/* 섹션은 각각 새 페이지 시작 */}
      <Section>
        <SummaryTab data={data} />
      </Section>

      <Section>
        <DocumentTab
          docLoading={docLoading}
          docErr={docErr}
          docAnalysisMap={docAnalysisMap}
        />
      </Section>

      <Section>
        <InterviewTab data={data} turns={turns} />
      </Section>

      <Section>
        <ComparisonTab data={data} />
      </Section>

      <Section>
        <CompetencyTab data={data} />
      </Section>
    </div>
  );
};

export default EvaluationReport;
