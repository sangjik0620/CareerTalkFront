import React from "react";
import EmptyBlock from "../components/EmptyBlock";
import { getScoreColor, hasItems, safeJson } from "../utils/evalUtils";

export default function DocumentTab({ docLoading, docErr, docAnalysisMap }) {
  if (docLoading) {
    return (
      <div className="tab-content">
        <div className="muted">문서 분석 데이터 불러오는 중...</div>
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

  const resumeA = docAnalysisMap?.RESUME || null;
  const essayA = docAnalysisMap?.ESSAY || null;
  const pfA = docAnalysisMap?.PORTFOLIO || null;

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

  const pickKeywords = (a) => {
    const score = safeJson(a?.scoreJson);
    return score?.keywords || score?.topKeywords || score?.keyWords || [];
  };

  const renderDocCard = (title, analysisEntity, subText) => {
    const score = analysisEntity?.overallScore ?? 0;
    return (
      <div className="doc-score-card">
        <div className="doc-type">{title}</div>
        <div className="doc-score" style={{ color: getScoreColor(score) }}>
          {score}점
        </div>
        <div className="doc-match">{subText}</div>
      </div>
    );
  };

  const renderNoDataCard = (title) => (
    <div className="doc-score-card">
      <div className="doc-type">{title}</div>
      <div className="muted">데이터 없음</div>
    </div>
  );

  return (
    <div className="tab-content">
      <h2>문서 분석 결과</h2>

      <div className="document-overview">
        {resumeA
          ? renderDocCard("📝 이력서", resumeA, `선택 분석ID: ${resumeA.analysisId}`)
          : renderNoDataCard("📝 이력서")}

        {essayA
          ? renderDocCard("✍️ 자기소개서", essayA, `선택 분석ID: ${essayA.analysisId}`)
          : renderNoDataCard("✍️ 자기소개서")}

        {pfA
          ? renderDocCard("💼 포트폴리오", pfA, `선택 분석ID: ${pfA.analysisId}`)
          : renderNoDataCard("💼 포트폴리오")}
      </div>

      <div className="document-details">
        {resumeA ? (
          <div className="doc-detail-card">
            <h3>📝 이력서 상세 분석</h3>

            <div className="analysis-section">
              <h4>한줄평</h4>
              <div>{resumeA?.oneLineReview || "-"}</div>
            </div>

            <div className="analysis-section">
              <h4>요약</h4>
              <div style={{ whiteSpace: "pre-wrap" }}>
                {resumeA?.summaryDetail || "-"}
              </div>
            </div>

            <div className="keywords-section">
              <h4>핵심 키워드</h4>
              <div className="keywords">
                {hasItems(pickKeywords(resumeA)) ? (
                  pickKeywords(resumeA).map((k, i) => (
                    <span key={i} className="keyword-tag">
                      {k}
                    </span>
                  ))
                ) : (
                  <span className="muted">키워드 데이터 없음</span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="doc-detail-card">
            <EmptyBlock title="이력서 분석이 없습니다" />
          </div>
        )}

        {essayA ? (
          <div className="doc-detail-card">
            <h3>✍️ 자기소개서 상세 분석</h3>

            <div className="analysis-section">
              <h4>한줄평</h4>
              <div>{essayA?.oneLineReview || "-"}</div>
            </div>

            <div className="analysis-section">
              <h4>요약</h4>
              <div style={{ whiteSpace: "pre-wrap" }}>
                {essayA?.summaryDetail || "-"}
              </div>
            </div>

            <div className="keywords-section">
              <h4>핵심 키워드</h4>
              <div className="keywords">
                {hasItems(pickKeywords(essayA)) ? (
                  pickKeywords(essayA).map((k, i) => (
                    <span key={i} className="keyword-tag secondary">
                      {k}
                    </span>
                  ))
                ) : (
                  <span className="muted">키워드 데이터 없음</span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="doc-detail-card">
            <EmptyBlock title="자기소개서 분석이 없습니다" />
          </div>
        )}

        {pfA ? (
          <div className="doc-detail-card">
            <h3>💼 포트폴리오 상세 분석</h3>

            <div className="analysis-section">
              <h4>한줄평</h4>
              <div>{pfA?.oneLineReview || "-"}</div>
            </div>

            <div className="analysis-section">
              <h4>요약</h4>
              <div style={{ whiteSpace: "pre-wrap" }}>
                {pfA?.summaryDetail || "-"}
              </div>
            </div>

            <div className="keywords-section">
              <h4>핵심 키워드</h4>
              <div className="keywords">
                {hasItems(pickKeywords(pfA)) ? (
                  pickKeywords(pfA).map((k, i) => (
                    <span key={i} className="keyword-tag">
                      {k}
                    </span>
                  ))
                ) : (
                  <span className="muted">키워드 데이터 없음</span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="doc-detail-card">
            <EmptyBlock title="포트폴리오 분석이 없습니다" />
          </div>
        )}
      </div>
    </div>
  );
}