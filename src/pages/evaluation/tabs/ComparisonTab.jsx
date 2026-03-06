import React from "react";
import EmptyBlock from "../components/EmptyBlock";
import { clamp100, isPlainObject } from "../utils/evalUtils";

export default function ComparisonTab({ data }) {
  const comp = data?.comparison;
  if (!comp) {
    return (
      <div className="tab-content">
        <EmptyBlock title="비교 분석 데이터가 없습니다" desc="누락: comparison" />
      </div>
    );
  }

  const scoreHistory       = comp?.scoreHistory;
  const categoryComparison = comp?.categoryComparison;
  const userScore          = clamp100(data?.summary?.overallScore);
  const hasCategoryComparison = isPlainObject(categoryComparison);

  return (
    <div className="tab-content">
      <h2>성적 분포 및 비교 분석</h2>

      {/* ── Distribution ── */}
      <div className="distribution-section">
        <h3>📊 지원자 점수 분포</h3>
        <div className="distribution-chart">
          <svg viewBox="0 0 600 200" className="dist-svg">
            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map((v) => (
              <line
                key={v}
                x1="50" y1={170 - v * 1.4}
                x2="550" y2={170 - v * 1.4}
                stroke="#f1f5f9" strokeWidth="1"
              />
            ))}
            {/* Baseline */}
            <line x1="50" y1="170" x2="550" y2="170" stroke="#cbd5e1" strokeWidth="1.5" />

            {/* Bell-ish curve fill */}
            <path
              d="M50 170 Q150 60 300 82 Q450 104 550 170 Z"
              fill="rgba(37,99,235,.07)"
            />
            <path
              d="M50 170 Q150 60 300 82 Q450 104 550 170"
              fill="none" stroke="#2563eb" strokeWidth="2"
            />

            {/* Average marker */}
            <line x1="300" y1="170" x2="300" y2="78" stroke="#94a3b8" strokeDasharray="4 3" strokeWidth="1.5" />
            <text x="300" y="72" textAnchor="middle" fontSize="10" fill="#94a3b8" fontWeight="600">평균</text>

            {/* User score marker */}
            {(() => {
              const x = 50 + (userScore / 100) * 500;
              // estimate y on the curve (approximate)
              const y = 82 + ((x - 300) * (x - 300)) / 1800;
              const cy = Math.max(78, Math.min(160, y));
              return (
                <g>
                  <line x1={x} y1="170" x2={x} y2={cy} stroke="#2563eb" strokeWidth="2" />
                  <circle cx={x} cy={cy} r="5" fill="#2563eb" />
                  <rect
                    x={x - 22} y={cy - 26}
                    width="44" height="20"
                    rx="6" fill="#2563eb"
                  />
                  <text
                    x={x} y={cy - 12}
                    textAnchor="middle"
                    fontSize="11" fill="#fff" fontWeight="800"
                  >
                    {userScore}점
                  </text>
                </g>
              );
            })()}

            {/* X labels */}
            <text x="50"  y="188" fontSize="11" fill="#94a3b8">0</text>
            <text x="300" y="188" fontSize="11" fill="#94a3b8" textAnchor="middle">50</text>
            <text x="550" y="188" fontSize="11" fill="#94a3b8" textAnchor="end">100</text>
          </svg>
        </div>
        <div className="distribution-meta">
          전체 지원자 중{" "}
          <strong>상위 {comp?.percentileRank ?? 0}%</strong>에 위치합니다.
        </div>
      </div>

      {/* ── Score History ── */}
      {Array.isArray(scoreHistory) && (
        <div className="score-history">
          <h3>📈 성적 추이</h3>
          <div className="history-chart">
            <div className="chart-area">
              <svg viewBox="0 0 600 200" className="line-chart">
                {/* Grid */}
                {[0, 25, 50, 75, 100].map((v) => (
                  <line
                    key={v}
                    x1="50" y1={170 - v * 1.4}
                    x2="550" y2={170 - v * 1.4}
                    stroke="#f1f5f9" strokeWidth="1"
                  />
                ))}
                <line x1="50" y1="170" x2="550" y2="170" stroke="#cbd5e1" strokeWidth="1.5" />

                {scoreHistory.length > 1 && (
                  <polyline
                    points={scoreHistory
                      .map((item, idx) => {
                        const gap = 500 / Math.max(scoreHistory.length - 1, 1);
                        const x = 50 + idx * gap;
                        const y = 170 - clamp100(item?.score) * 1.4;
                        return `${x},${y}`;
                      })
                      .join(" ")}
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                )}

                {scoreHistory.map((item, idx) => {
                  const gap = 500 / Math.max(scoreHistory.length - 1, 1);
                  const x = 50 + idx * gap;
                  const score = clamp100(item?.score);
                  const y = 170 - score * 1.4;
                  return (
                    <g key={idx}>
                      <circle cx={x} cy={y} r="5" fill="#fff" stroke="#2563eb" strokeWidth="2.5" />
                      <text
                        x={x} y={y - 10}
                        textAnchor="middle"
                        fontSize="11" fill="#2563eb" fontWeight="800"
                      >
                        {score}
                      </text>
                      {item?.date && (
                        <text
                          x={x} y="186"
                          textAnchor="middle"
                          fontSize="10" fill="#94a3b8"
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
        </div>
      )}

      {/* ── Category Comparison ── */}
      {hasCategoryComparison && (
        <div className="category-comparison">
          <h3>📋 카테고리별 비교</h3>

          <div className="comparison-chart">
            {Object.entries(categoryComparison).map(([category, values]) => {
              if (!isPlainObject(values)) return null;
              const user    = clamp100(values?.user);
              const average = clamp100(values?.average);
              const previous= clamp100(values?.previous);

              const CAT_LABELS = {
                technical:     "기술",
                communication: "커뮤니케이션",
                problem:       "문제해결",
                leadership:    "리더십",
              };

              return (
                <div key={category} className="category-row">
                  <div className="category-label">
                    {CAT_LABELS[category] ?? category}
                  </div>
                  <div className="category-bars">
                    <div className="bar-group">
                      <div className="bar-item">
                        <span className="bar-legend">나의 점수</span>
                        <div className="bar user-bar" style={{ width: `${user}%` }}>
                          <span className="bar-value">{user}</span>
                        </div>
                      </div>
                      <div className="bar-item">
                        <span className="bar-legend">전체 평균</span>
                        <div className="bar average-bar" style={{ width: `${average}%` }}>
                          <span className="bar-value">{average}</span>
                        </div>
                      </div>
                      {values?.previous !== undefined && (
                        <div className="bar-item">
                          <span className="bar-legend">이전 기록</span>
                          <div className="bar previous-bar" style={{ width: `${previous}%` }}>
                            <span className="bar-value">{previous}</span>
                          </div>
                        </div>
                      )}
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
        </div>
      )}
    </div>
  );
}
