import React from "react";
import EmptyBlock from "../components/EmptyBlock";
import { getScoreColor, hasItems, safeJson } from "../utils/evalUtils";

const DOC_META = {
  RESUME:    { label: "이력서",     emoji: "📝" },
  ESSAY:     { label: "자기소개서", emoji: "✍️" },
  PORTFOLIO: { label: "포트폴리오", emoji: "💼" },
};

function DocScoreCard({ docKey, analysisEntity }) {
  const { label, emoji } = DOC_META[docKey] ?? { label: docKey, emoji: "📄" };
  if (!analysisEntity) {
    return (
      <div className="doc-score-card">
        <div className="doc-type">{emoji} {label}</div>
        <div className="muted" style={{ fontSize: "1rem" }}>데이터 없음</div>
      </div>
    );
  }
  const score = analysisEntity?.overallScore ?? 0;
  return (
    <div className="doc-score-card">
      <div className="doc-type">{emoji} {label}</div>
      <div className="doc-score" style={{ color: getScoreColor(score) }}>{score}점</div>
      <div className="doc-match">분석 ID: {analysisEntity.analysisId}</div>
    </div>
  );
}

function DocDetailCard({ docKey, analysisEntity }) {
  const { label, emoji } = DOC_META[docKey] ?? { label: docKey, emoji: "📄" };
  if (!analysisEntity) {
    return (
      <div className="doc-detail-card">
        <EmptyBlock title={`${label} 분석이 없습니다`} />
      </div>
    );
  }

  const scoreObj = safeJson(analysisEntity?.scoreJson);
  const keywords =
    scoreObj?.keywords || scoreObj?.topKeywords || scoreObj?.keyWords || [];

  return (
    <div className="doc-detail-card pdf-doc">
      <h3>{emoji} {label} 상세 분석</h3>

      {analysisEntity?.oneLineReview && (
        <div className="analysis-section">
          <h4>한줄평</h4>
          <div>{analysisEntity.oneLineReview}</div>
        </div>
      )}

      {analysisEntity?.summaryDetail && (
        <div className="analysis-section">
          <h4>요약</h4>
          <div style={{ whiteSpace: "pre-wrap" }}>{analysisEntity.summaryDetail}</div>
        </div>
      )}

      <div className="keywords-section">
        <h4>핵심 키워드</h4>
        <div className="keywords">
          {hasItems(keywords) ? (
            keywords.map((k, i) => (
              <span key={i} className={`keyword-tag${docKey === "ESSAY" ? " secondary" : ""}`}>
                {k}
              </span>
            ))
          ) : (
            <span className="muted">키워드 데이터 없음</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DocumentTab({ docLoading, docErr, docAnalysisMap }) {
  if (docLoading) {
    return (
      <div className="tab-content pdf-doc-tab">
        <div className="empty-card">
          <div className="ev-spinner" style={{ width: 28, height: 28, margin: 0 }} />
          <span className="muted">문서 분석 데이터 불러오는 중...</span>
        </div>
      </div>
    );
  }
  if (docErr) {
    return (
      <div className="tab-content">
        <EmptyBlock title="문서 분석 조회 실패" desc={docErr} />
      </div>
    );
  }

  const resumeA = docAnalysisMap?.RESUME    || null;
  const essayA  = docAnalysisMap?.ESSAY     || null;
  const pfA     = docAnalysisMap?.PORTFOLIO || null;

  if (!resumeA && !essayA && !pfA) {
    return (
      <div className="tab-content">
        <EmptyBlock
          title="문서 분석 데이터가 없습니다"
          desc="세션에 선택된 문서 분석 결과가 없거나 아직 분석이 없습니다."
        />
      </div>
    );
  }

  return (
    <div className="tab-content">
      <h2>문서 분석 결과</h2>

      <div className="document-overview">
        <DocScoreCard docKey="RESUME"    analysisEntity={resumeA} />
        <DocScoreCard docKey="ESSAY"     analysisEntity={essayA}  />
        <DocScoreCard docKey="PORTFOLIO" analysisEntity={pfA}     />
      </div>

      <div className="document-details">
        <DocDetailCard docKey="RESUME"    analysisEntity={resumeA} />
        <DocDetailCard docKey="ESSAY"     analysisEntity={essayA}  />
        <DocDetailCard docKey="PORTFOLIO" analysisEntity={pfA}     />
      </div>
    </div>
  );
}
