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

  const scoreHistory = comp?.scoreHistory;
  const categoryComparison = comp?.categoryComparison;
  const userScore = clamp100(data?.summary?.overallScore);

  const hasCategoryComparison = isPlainObject(categoryComparison);

  return (
    <div className="tab-content">
      <h2>성적 분포 및 비교 분석</h2>

      <div className="distribution-section">
        <h3>📊 지원자 점수 분포</h3>

        <div className="distribution-chart compact">
          <svg viewBox="0 0 600 220" className="dist-svg">
            <line x1="50" y1="180" x2="550" y2="180" stroke="#cbd5e1" strokeWidth="1.5" />
            <path
              d="M50 180 Q150 60 300 90 Q450 120 550 180"
              fill="none"
              stroke="#2563eb"
              strokeWidth="2"
            />
            <line
              x1="300"
              y1="180"
              x2="300"
              y2="85"
              stroke="#94a3b8"
              strokeDasharray="4 4"
              strokeWidth="1.5"
            />

            {(() => {
              const x = 50 + (userScore / 100) * 500;
              return (
                <>
                  <line x1={x} y1="180" x2={x} y2="110" stroke="#2563eb" strokeWidth="1.5" />
                  <circle cx={x} cy="110" r="5" fill="#2563eb" />
                  <text
                    x={x}
                    y="95"
                    textAnchor="middle"
                    fontSize="12"
                    fill="#2563eb"
                    fontWeight="700"
                  >
                    {userScore}점
                  </text>
                </>
              );
            })()}

            <text x="50" y="200" fontSize="11" fill="#64748b">
              0
            </text>
            <text x="300" y="200" fontSize="11" fill="#64748b" textAnchor="middle">
              평균
            </text>
            <text x="550" y="200" fontSize="11" fill="#64748b" textAnchor="end">
              100
            </text>
          </svg>
        </div>

        <div className="distribution-meta">
          전체 지원자 중 <strong>상위 {comp?.percentileRank ?? 0}%</strong>에 위치합니다.
        </div>
      </div>

      {Array.isArray(scoreHistory) ? (
        <div className="score-history">
          <h3>📈 성적 추이</h3>
          <div className="history-chart">
            <div className="chart-area">
              <svg viewBox="0 0 600 220" className="line-chart compact">
                {[0, 25, 50, 75, 100].map((val) => (
                  <line
                    key={val}
                    x1="50"
                    y1={180 - val * 1.6}
                    x2="550"
                    y2={180 - val * 1.6}
                    stroke="#e5e7eb"
                    strokeWidth="1"
                  />
                ))}

                <polyline
                  points={scoreHistory
                    .map((item, idx) => {
                      const x = 50 + idx * 250;
                      const y = 180 - clamp100(item?.score) * 1.6;
                      return `${x},${y}`;
                    })
                    .join(" ")}
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="2"
                />

                {scoreHistory.map((item, idx) => {
                  const x = 50 + idx * 250;
                  const score = clamp100(item?.score);
                  const y = 180 - score * 1.6;
                  const date = item?.date ?? "";
                  return (
                    <g key={idx}>
                      <circle cx={x} cy={y} r="4" fill="#2563eb" />
                      <text
                        x={x}
                        y={y - 12}
                        textAnchor="middle"
                        fontSize="12"
                        fill="#2563eb"
                        fontWeight="700"
                      >
                        {score}
                      </text>
                      <text x={x} y={200} textAnchor="middle" fontSize="11" fill="#64748b">
                        {date}
                      </text>
                    </g>
                  );
                })}

                {[0, 25, 50, 75, 100].map((val) => (
                  <text key={val} x="35" y={185 - val * 1.6} textAnchor="end" fontSize="11" fill="#6b7280">
                    {val}
                  </text>
                ))}
              </svg>
            </div>
          </div>
        </div>
      ) : (
        <div className="score-history">
          <EmptyBlock title="성적 추이 데이터가 없습니다" desc="누락: comparison.scoreHistory" />
        </div>
      )}

      {hasCategoryComparison ? (
        <div className="category-comparison">
          <h3>📊 카테고리별 비교</h3>

          <div className="vChart">
            {Object.entries(categoryComparison).map(([category, scores]) => {
              const labels = {
                technical: "기술",
                communication: "소통",
                problemSolving: "문제해결",
                attitude: "태도",
                experience: "경험",
              };

              const s = isPlainObject(scores) ? scores : {};
              const bars = [
                { key: "user", value: clamp100(s.user) },
                { key: "average", value: clamp100(s.average) },
                { key: "previous", value: clamp100(s.previous) },
              ];

              return (
                <div key={category} className="vCol">
                  <div className="vBars">
                    {bars.map((b) => (
                      <div key={b.key} className={`vBarWrap ${b.key}`}>
                        <div className="vBarTrack">
                          <div className="vBar" style={{ height: `${b.value}%` }} />
                        </div>
                        <div className="vBarVal">{b.value}</div>
                      </div>
                    ))}
                  </div>

                  <div className="vLabel">{labels[category] ?? category}</div>
                </div>
              );
            })}
          </div>

          <div className="vLegend">
            <div className="legend-item">
              <span className="legend-color user"></span>
              <span>본인</span>
            </div>
            <div className="legend-item">
              <span className="legend-color average"></span>
              <span>평균</span>
            </div>
            <div className="legend-item">
              <span className="legend-color previous"></span>
              <span>이전</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="category-comparison">
          <EmptyBlock title="카테고리 비교 데이터가 없습니다" desc="누락: comparison.categoryComparison" />
        </div>
      )}
    </div>
  );
}