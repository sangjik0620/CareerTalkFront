import React from "react";
import EmptyBlock from "../components/EmptyBlock";
import { asArray, clamp100, hasItems } from "../utils/evalUtils";

export default function CompetencyTab({ data }) {
  const comp = data?.competency;
  if (!comp) {
    return (
      <div className="tab-content">
        <EmptyBlock title="역량 데이터가 없습니다" desc="누락: competency" />
      </div>
    );
  }

  const tech = comp?.technical;
  const soft = comp?.soft;
  const improvements = comp?.improvements;

  const priorityLabel = (p) => (p === "high" ? "높음" : p === "low" ? "낮음" : "보통");

  return (
    <div className="tab-content">
      <h2>역량 분석 및 개선 방안</h2>

      <div className="competency-overview">
        {tech ? (
          <div className="competency-card">
            <h3>💻 기술 역량</h3>

            <div className="competency-score">
              <div className="score-display">
                <span className="current-score">{tech?.current ?? 0}</span>
                <span className="score-separator">/</span>
                <span className="target-score">{tech?.target ?? 0}</span>
              </div>

              <div className="score-bar">
                <div
                  className="score-progress current"
                  style={{ width: `${clamp100(tech?.current)}%` }}
                />
                <div
                  className="score-progress target"
                  style={{ width: `${clamp100(tech?.target)}%` }}
                />
              </div>
            </div>

            <div className="competency-details">
              {hasItems(Object.entries(tech?.details ?? {})) ? (
                Object.entries(tech?.details ?? {}).map(([key, value]) => {
                  const labels = {
                    frontEnd: "프론트엔드",
                    backEnd: "백엔드",
                    database: "데이터베이스",
                    deployment: "배포/운영",
                  };
                  const v = clamp100(value);

                  return (
                    <div key={key} className="detail-item">
                      <span className="detail-label">{labels[key] ?? key}</span>
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
        ) : (
          <div className="competency-card">
            <EmptyBlock title="기술 역량 데이터가 없습니다" desc="누락: competency.technical" />
          </div>
        )}

        {soft ? (
          <div className="competency-card">
            <h3>🤝 소프트 스킬</h3>

            <div className="competency-score">
              <div className="score-display">
                <span className="current-score">{soft?.current ?? 0}</span>
                <span className="score-separator">/</span>
                <span className="target-score">{soft?.target ?? 0}</span>
              </div>

              <div className="score-bar">
                <div
                  className="score-progress current"
                  style={{ width: `${clamp100(soft?.current)}%` }}
                />
                <div
                  className="score-progress target"
                  style={{ width: `${clamp100(soft?.target)}%` }}
                />
              </div>
            </div>

            <div className="competency-details">
              {hasItems(Object.entries(soft?.details ?? {})) ? (
                Object.entries(soft?.details ?? {}).map(([key, value]) => {
                  const labels = {
                    communication: "커뮤니케이션",
                    teamwork: "팀워크",
                    leadership: "리더십",
                    presentation: "발표력",
                  };
                  const v = clamp100(value);

                  return (
                    <div key={key} className="detail-item">
                      <span className="detail-label">{labels[key] ?? key}</span>
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
        ) : (
          <div className="competency-card">
            <EmptyBlock title="소프트 스킬 데이터가 없습니다" desc="누락: competency.soft" />
          </div>
        )}
      </div>

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
                        {priorityLabel(priority)}
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
                    <div className="improvement-target" style={{ left: `${targetLevel}%` }}>
                      <span className="target-marker">🎯</span>
                    </div>
                  </div>

                  <div className="improvement-actions">
                    <h4>실행 항목</h4>
                    {hasItems(actionItems) ? (
                      <ul>
                        {actionItems.map((action, i) => (
                          <li key={i}>
                            <span className="action-bullet">▸</span>
                            {action}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="muted">실행 항목 데이터 없음</div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="muted">개선 계획 데이터가 없습니다</div>
          )}
        </div>
      ) : (
        <div className="improvements-section">
          <EmptyBlock title="개선 계획 데이터가 없습니다" desc="누락: competency.improvements" />
        </div>
      )}
    </div>
  );
}