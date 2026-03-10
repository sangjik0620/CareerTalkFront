import React from "react";
import EmptyBlock from "../components/EmptyBlock";
import { clamp100, isPlainObject } from "../utils/evalUtils";

const CAT_LABELS = {
  technical: "기술",
  communication: "커뮤니케이션",
  confidence: "자신감",
  problem: "문제해결",
  leadership: "리더십",
};

export default function ComparisonTab({ data }) {
  const comp = data?.comparison;
  const evaluation = data?.evaluation;

  console.log("comparison tab data =", data);
  console.log("comparison tab comp =", comp);
  console.log("comparison tab overall =", evaluation?.summary?.overallScore);

  if (!comp) {
    return (
      <div className="tab-content">
        <EmptyBlock
          title="비교 분석 데이터가 없습니다"
          desc="누락: comparison"
        />
      </div>
    );
  }

  const userScore = clamp100(evaluation?.summary?.overallScore);

  const percentileRank =
    typeof comp?.percentileRank === "number" ? comp.percentileRank : null;

  const topPercent =
    percentileRank == null ? null : Math.max(0, 100 - percentileRank);

  const markerPercent =
    percentileRank != null ? clamp100(percentileRank) : clamp100(userScore);

  const rawHistory = Array.isArray(comp?.scoreHistory) ? comp.scoreHistory : [];

  const chartHistory =
    rawHistory.length > 0
      ? rawHistory.map((item, idx, arr) => ({
          score: clamp100(item?.score),
          date: item?.date ?? "",
          isCurrent: item?.date === "현재" || idx === arr.length - 1,
        }))
      : [
          {
            score: userScore,
            date: "현재",
            isCurrent: true,
          },
        ];

  const hasHistory = rawHistory.length > 0;

  const categoryEntries = isPlainObject(comp?.categoryComparison)
    ? Object.entries(comp.categoryComparison).filter(([_, values]) => {
        if (!isPlainObject(values)) return false;
        return (
          typeof values?.user === "number" ||
          typeof values?.average === "number" ||
          typeof values?.previous === "number"
        );
      })
    : [];

  const hasCategoryData = categoryEntries.length > 0;

  return (
    <div className="tab-content">
      <h2>성적 분포 및 비교 분석</h2>

      <div className="distribution-section">
        <h3>📊 지원자 점수 분포</h3>

        <div className="distribution-chart">
          <div className="distribution-track-wrap">
            <div className="distribution-track">
              <div
                className="distribution-user-marker"
                style={{ left: `${markerPercent}%` }}
                title={
                  topPercent == null
                    ? `현재 점수 ${userScore}점`
                    : `상위 ${topPercent}% · 점수 ${userScore}점`
                }
              >
                <span className="distribution-user-badge">
                  {topPercent == null ? `${userScore}점` : `상위 ${topPercent}%`}
                </span>
              </div>
            </div>

            <div className="distribution-axis">
              <span>0</span>
              <span>50</span>
              <span>100</span>
            </div>
          </div>
        </div>

        <div className="distribution-meta">
          <div>
            현재 점수는 <strong>{userScore}점</strong>입니다.
          </div>
          <div>
            {topPercent == null ? (
              <span>백분위 데이터가 없어 현재 점수 기준으로만 표시합니다.</span>
            ) : (
              <span>
                전체 지원자 중 <strong>상위 {topPercent}%</strong>에 위치합니다.
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="score-history">
        <h3>📈 성적 추이</h3>

        <div className="history-chart">
          <div className="chart-area">
            <svg viewBox="0 0 600 220" className="line-chart">
              {[0, 20, 40, 60, 80, 100].map((v) => {
                const y = 180 - v * 1.4;
                return (
                  <g key={v}>
                    <line
                      x1="50"
                      y1={y}
                      x2="550"
                      y2={y}
                      stroke="#e5e7eb"
                      strokeWidth="1"
                    />
                    <text
                      x="40"
                      y={y + 4}
                      textAnchor="end"
                      fontSize="10"
                      fill="#94a3b8"
                      fontWeight="600"
                    >
                      {v}
                    </text>
                  </g>
                );
              })}

              <line
                x1="50"
                y1="180"
                x2="550"
                y2="180"
                stroke="#cbd5e1"
                strokeWidth="1.5"
              />

              {chartHistory.length > 1 && (
                <polyline
                  points={chartHistory
                    .map((item, idx) => {
                      const gap = 500 / Math.max(chartHistory.length - 1, 1);
                      const x = 50 + idx * gap;
                      const y = 180 - item.score * 1.4;
                      return `${x},${y}`;
                    })
                    .join(" ")}
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {chartHistory.map((item, idx) => {
                const isSingle = chartHistory.length === 1;
                const gap = 500 / Math.max(chartHistory.length - 1, 1);
                const x = isSingle ? 300 : 50 + idx * gap;
                const y = 180 - item.score * 1.4;

                return (
                  <g key={`${item.date}-${idx}`}>
                    {item.isCurrent && (
                      <>
                        <line
                          x1={x}
                          y1="180"
                          x2={x}
                          y2={y}
                          stroke="#bfdbfe"
                          strokeWidth="2"
                          strokeDasharray="4 4"
                        />
                        <rect
                          x={x - 20}
                          y={y - 42}
                          width="40"
                          height="18"
                          rx="9"
                          fill="#2563eb"
                        />
                        <text
                          x={x}
                          y={y - 29}
                          textAnchor="middle"
                          fontSize="10"
                          fill="#fff"
                          fontWeight="800"
                        >
                          현재
                        </text>
                      </>
                    )}

                    <circle
                      cx={x}
                      cy={y}
                      r={item.isCurrent ? 6 : 5}
                      fill={item.isCurrent ? "#2563eb" : "#fff"}
                      stroke="#2563eb"
                      strokeWidth="2.5"
                    />

                    <text
                      x={x}
                      y={y - 10}
                      textAnchor="middle"
                      fontSize={item.isCurrent ? "12" : "11"}
                      fill="#2563eb"
                      fontWeight="800"
                    >
                      {item.score}
                    </text>

                    {item.date && (
                      <text
                        x={x}
                        y="198"
                        textAnchor="middle"
                        fontSize="10"
                        fill={item.isCurrent ? "#2563eb" : "#94a3b8"}
                        fontWeight={item.isCurrent ? "700" : "500"}
                      >
                        {item.date}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        <div className="history-meta">
          {hasHistory ? (
            <span>이전 면접 기록과 현재 점수를 기준으로 성적 추이를 표시합니다.</span>
          ) : (
            <span>이전 기록이 없어 현재 점수만 표시합니다.</span>
          )}
        </div>
      </div>

      <div className="category-comparison">
        <h3>📋 카테고리별 비교</h3>

        {hasCategoryData ? (
          <>
            <div className="comparison-chart vertical">
              {categoryEntries.map(([category, values]) => {
                const hasUser = typeof values?.user === "number";
                const hasAverage = typeof values?.average === "number";
                const hasPrevious = typeof values?.previous === "number";

                const user = hasUser ? clamp100(values.user) : 0;
                const average = hasAverage ? clamp100(values.average) : 0;
                const previous = hasPrevious ? clamp100(values.previous) : 0;

                return (
                  <div key={category} className="category-vertical-card">
                    <div className="category-vertical-title">
                      {CAT_LABELS[category] ?? category}
                    </div>

                    <div className="vertical-bar-group">
                      <div className="vertical-bar-item">
                        <div className="vertical-bar-track">
                          <div
                            className="vertical-bar-fill user-bar"
                            style={{ height: `${user}%` }}
                          >
                            <span className="vertical-bar-value">{user}</span>
                          </div>
                        </div>
                        <div className="vertical-bar-label">나</div>
                      </div>

                      <div className="vertical-bar-item">
                        <div className="vertical-bar-track">
                          <div
                            className="vertical-bar-fill average-bar"
                            style={{ height: `${average}%` }}
                          >
                            <span className="vertical-bar-value">{average}</span>
                          </div>
                        </div>
                        <div className="vertical-bar-label">평균</div>
                      </div>

                      <div className="vertical-bar-item">
                        <div className="vertical-bar-track">
                          <div
                            className="vertical-bar-fill previous-bar"
                            style={{ height: `${previous}%` }}
                          >
                            <span className="vertical-bar-value">{previous}</span>
                          </div>
                        </div>
                        <div className="vertical-bar-label">이전</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="comparison-legend">
              <div className="legend-item">
                <div className="legend-color user" />
                나의 점수
              </div>
              <div className="legend-item">
                <div className="legend-color average" />
                전체 평균
              </div>
              <div className="legend-item">
                <div className="legend-color previous" />
                이전 기록
              </div>
            </div>
          </>
        ) : (
          <div className="comparison-empty-note">
            카테고리 비교 데이터가 없어 현재는 종합 점수 중심으로만 표시합니다.
          </div>
        )}
      </div>
    </div>
  );
}