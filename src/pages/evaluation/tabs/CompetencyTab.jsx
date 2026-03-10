import React from "react";
import EmptyBlock from "../components/EmptyBlock";
import { asArray, clamp100, hasItems } from "../utils/evalUtils";

const TECH_LABELS = {
  frontEnd: "프론트엔드",
  backEnd: "백엔드",
  database: "데이터베이스",
  deployment: "배포/운영",
};

const SOFT_LABELS = {
  communication: "커뮤니케이션",
  teamwork: "팀워크",
  leadership: "리더십",
  presentation: "발표력",
};

const PRIORITY_TEXT = { high: "높음", medium: "보통", low: "낮음" };

function CompetencyBlock({ title, data, labelMap }) {
  if (!data) {
    return (
      <div className="competency-card">
        <EmptyBlock title={`${title} 데이터가 없습니다`} />
      </div>
    );
  }

  const current = clamp100(data?.current);
  const target = clamp100(data?.target);
  const details = Object.entries(data?.details ?? {});

  return (
    <div className="competency-card">
      <h3>{title}</h3>

      <div className="competency-score">
        <div className="score-display">
          <span className="current-score">{current}</span>
          <span className="score-separator">/</span>
          <span className="target-score">{target}</span>
        </div>
        <div className="score-bar">
          <div
            className="score-progress target"
            style={{ width: `${target}%` }}
          />
          <div
            className="score-progress current"
            style={{ width: `${current}%` }}
          />
        </div>
      </div>

      <div className="competency-details">
        {hasItems(details) ? (
          details.map(([key, value]) => {
            const v = clamp100(value);
            return (
              <div key={key} className="detail-item">
                <span className="detail-label">{labelMap[key] ?? key}</span>
                <div className="detail-bar">
                  <div className="detail-fill" style={{ width: `${v}%` }} />
                </div>
                <span className="detail-value">{v}</span>
              </div>
            );
          })
        ) : (
          <div className="muted">세부 역량 데이터 없음</div>
        )}
      </div>
    </div>
  );
}

export default function CompetencyTab({ data }) {
  const evaluation = data?.evaluation;
  const comp = evaluation?.competency;

  if (!comp) {
    return (
      <div className="tab-content">
        <EmptyBlock title="역량 데이터가 없습니다" desc="누락: competency" />
      </div>
    );
  }

  const improvements = comp?.improvements;

  return (
    <div className="tab-content">
      <h2>역량 분석 및 개선 방안</h2>

      <div className="competency-overview">
        <CompetencyBlock
          title="💻 기술 역량"
          data={comp?.technical}
          labelMap={TECH_LABELS}
        />
        <CompetencyBlock
          title="🤝 소프트 스킬"
          data={comp?.soft}
          labelMap={SOFT_LABELS}
        />
      </div>

      {/* ── Improvements ── */}
      {Array.isArray(improvements) ? (
        <div className="improvements-section">
          <h3>🎯 개선 계획</h3>

          {improvements.length ? (
            improvements.map((item, idx) => {
              const area = item?.area ?? "";
              const priority = item?.priority ?? "medium";
              const currentLevel = clamp100(item?.currentLevel);
              const targetLevel = clamp100(item?.targetLevel);
              const actionItems = asArray(item?.actionItems);

              return (
                <div key={idx} className="improvement-card">
                  <div className="improvement-header">
                    <div className="improvement-title">
                      <span className="improvement-area">{area}</span>
                      <span className={`priority-badge ${priority}`}>
                        우선순위: {PRIORITY_TEXT[priority] ?? priority}
                      </span>
                    </div>
                    <div className="improvement-progress">
                      <span className="progress-label">
                        {currentLevel} → {targetLevel}
                      </span>
                    </div>
                  </div>

                  <div className="improvement-bar">
                    <div
                      className="improvement-current"
                      style={{ width: `${currentLevel}%` }}
                    />
                    <div
                      className="improvement-target"
                      style={{ left: `${targetLevel}%` }}
                    >
                      <span className="target-marker">🎯</span>
                    </div>
                  </div>

                  {hasItems(actionItems) && (
                    <div className="improvement-actions">
                      <h4>실행 항목</h4>
                      <ul>
                        {actionItems.map((action, i) => (
                          <li key={i}>
                            <span className="action-bullet">▸</span>
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="muted">개선 계획 데이터가 없습니다</div>
          )}
        </div>
      ) : (
        <div className="improvements-section">
          <EmptyBlock
            title="개선 계획 데이터가 없습니다"
            desc="누락: competency.improvements"
          />
        </div>
      )}
    </div>
  );
}
