import React from "react";
import EmptyBlock from "../components/EmptyBlock";
import {
  asArray,
  clamp100,
  getScoreColor,
  getScoreLabel,
  hasItems,
} from "../utils/evalUtils";

export default function SummaryTab({ data }) {
  const summary = data?.summary;
  const info    = data?.interviewInfo;

  if (!summary || !info) {
    return (
      <div className="tab-content">
        <EmptyBlock
          title="요약 데이터가 없습니다"
          desc={`누락: ${!summary ? "summary " : ""}${!info ? "interviewInfo" : ""}`.trim()}
        />
      </div>
    );
  }

  const overall = clamp100(summary?.overallScore);
  const prev    = clamp100(summary?.previousScore);
  const avg     = clamp100(summary?.passedAverage);

  const diffPrev = overall - prev;
  const diffAvg  = overall - avg;

  const verdictTone = (v) => {
    if (v === "합격권") return "good";
    if (v === "개선필요") return "bad";
    return "neutral";
  };

  const kpis = [
    { label: "백분위",  value: `상위 ${summary?.percentileRank ?? 0}%`,  tone: "brand" },
    { label: "평균 답변", value: `${summary?.avgResponseTimeSec ?? 0}s`, tone: "neutral" },
    { label: "추임새",  value: `${summary?.fillerWordRate ?? 0}%`, tone: "neutral" },
    { label: "긍정도",  value: `${summary?.sentimentScore ?? 0}%`, tone: "neutral" },
    { label: "직무적합", value: `${summary?.jobFitIndex ?? 0}`, tone: "brand"  },
    { label: "자신감",  value: `${summary?.confidenceIndex ?? 0}`, tone: "brand"  },
  ];

  const indexes = [
    { label: "기술",        value: clamp100(summary?.technicalIndex) },
    { label: "커뮤니케이션", value: clamp100(summary?.communicationIndex) },
    { label: "직무적합",     value: clamp100(summary?.jobFitIndex) },
  ];

  const topKeywords = asArray(summary?.topKeywords);
  const strengths   = asArray(summary?.strengths);
  const weaknesses  = asArray(summary?.weaknesses);

  const circumference = 2 * Math.PI * 90;

  return (
    <div className="tab-content">
      {/* ── Top Row ── */}
      <div className="summaryTop">
        <div className="summaryTopLeft">
          <h2 className="summaryTitle">면접 종합 평가</h2>
          <div className="interview-info summaryInfoCompact">
            <span>📅 {info?.date ?? "—"}</span>
            <span>⏱️ {info?.duration ?? "—"}</span>
            <span>💼 {info?.position ?? "—"}</span>
          </div>
        </div>
        <div className="summaryTopRight">
          <span className={`badge badge-${verdictTone(summary?.verdict)}`}>
            {summary?.verdict ?? "판정 없음"}
          </span>
          <span className="badge badge-ghost">
            답변 {summary?.answeredQuestions ?? 0}/{summary?.totalQuestions ?? 0}
          </span>
        </div>
      </div>

      {/* ── Grid ── */}
      <div className="summaryGrid">

        {/* Score + KPI */}
        <section className="summaryCard scoreCardCompact">
          <div className="scoreLeft">
            <div className="score-circle scoreCircleCompact">
              <svg viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="90" className="score-bg" />
                <circle
                  cx="100" cy="100" r="90"
                  className="score-fill"
                  style={{
                    stroke: getScoreColor(overall),
                    strokeDasharray: `${(circumference * overall) / 100} ${circumference}`,
                  }}
                />
              </svg>
              <div className="score-text">
                <div className="scoreNumCompact">{overall}</div>
                <div className="score-label">{getScoreLabel(overall)}</div>
              </div>
            </div>

            <div className="scoreDelta">
              <div className="deltaItem">
                <span className="deltaLabel">이전 대비</span>
                <span className={`deltaValue ${diffPrev >= 0 ? "pos" : "neg"}`}>
                  {diffPrev >= 0 ? `+${diffPrev}` : diffPrev}점
                </span>
              </div>
              <div className="deltaItem">
                <span className="deltaLabel">평균 대비</span>
                <span className={`deltaValue ${diffAvg >= 0 ? "pos" : "neg"}`}>
                  {diffAvg >= 0 ? `+${diffAvg}` : diffAvg}점
                </span>
              </div>
            </div>
          </div>

          <div className="scoreRight">
            <div className="kpiGrid">
              {kpis.map((k) => (
                <div key={k.label} className={`kpiCard kpi-${k.tone}`}>
                  <div className="kpiLabel">{k.label}</div>
                  <div className="kpiValue">{k.value}</div>
                  <div className="kpiSub">{k.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Index + Keywords */}
        <section className="summaryCard summaryCardCompact">
          <div className="summaryCardHeader">
            <h3 className="summaryCardTitle">핵심 지표</h3>
          </div>

          <div className="indexList">
            {indexes.map((it) => (
              <div key={it.label} className="indexRow">
                <span className="indexLabel">{it.label}</span>
                <div className="indexBar">
                  <div className="indexFill" style={{ width: `${it.value}%` }} />
                </div>
                <span className="indexValue">{it.value}</span>
              </div>
            ))}
          </div>

          <div className="keywordStrip">
            <div className="keywordStripTitle">상위 키워드</div>
            <div className="keywords">
              {hasItems(topKeywords) ? (
                topKeywords.map((kw, i) => (
                  <span key={i} className="keyword-tag">{kw}</span>
                ))
              ) : (
                <span className="muted">키워드 데이터 없음</span>
              )}
            </div>
          </div>
        </section>

        {/* Strengths / Weaknesses */}
        <section className="summaryCard summaryCardCompact">
          <div className="swCompact">
            <div className="swMini">
              <h3 className="swTitle">
                <span>강점</span>
              </h3>
              {hasItems(strengths) ? (
                <ul className="swList">
                  {strengths.map((s, i) => (
                    <li key={i} className="swItem">
                      <span className="swDot">✓</span>
                      {s}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="muted">강점 데이터 없음</div>
              )}
            </div>

            <div className="swMini">
              <h3 className="swTitle">
                <span>개선 포인트</span>
              </h3>
              {hasItems(weaknesses) ? (
                <ul className="swList">
                  {weaknesses.map((w, i) => (
                    <li key={i} className="swItem">
                      <span className="swDot">!</span>
                      {w}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="muted">개선 포인트 데이터 없음</div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
