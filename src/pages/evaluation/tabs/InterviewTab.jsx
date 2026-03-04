import React from "react";
import EmptyBlock from "../components/EmptyBlock";
import { clamp100, getScoreColor, isPlainObject } from "../utils/evalUtils";

export default function InterviewTab({ data }) {
  const ia = data?.interviewAnalysis;
  if (!ia) {
    return (
      <div className="tab-content">
        <EmptyBlock title="면접 분석 데이터가 없습니다" desc="누락: interviewAnalysis" />
      </div>
    );
  }

  const voiceMetrics = ia?.voiceMetrics;
  const stt = ia?.sttAnalysis;
  const keywordUsage = stt?.keywordUsage;
  const questionResponses = ia?.questionResponses;

  return (
    <div className="tab-content">
      <h2>면접 음성 및 답변 분석</h2>

      {isPlainObject(voiceMetrics) ? (
        <div className="voice-analysis">
          <h3>🎤 음성 분석</h3>
          <div className="voice-metrics">
            {Object.entries(voiceMetrics).map(([key, value]) => {
              const labels = {
                clarity: "명확성",
                pace: "말하기 속도",
                volume: "음량",
                confidence: "자신감",
                fillerWords: "추임새 (개)",
              };

              const v = clamp100(value);

              return (
                <div key={key} className="voice-metric">
                  <div className="metric-header">
                    <span className="metric-name">{labels[key] ?? key}</span>
                    <span className="metric-score">
                      {v}
                      {key !== "fillerWords" && "%"}
                    </span>
                  </div>

                  {key !== "fillerWords" && (
                    <div className="metric-bar">
                      <div
                        className="metric-fill voice"
                        style={{
                          width: `${v}%`,
                          backgroundColor: getScoreColor(v),
                        }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="voice-analysis">
          <EmptyBlock
            title="음성 분석 데이터가 없습니다"
            desc="누락: interviewAnalysis.voiceMetrics"
          />
        </div>
      )}

      {isPlainObject(stt) ? (
        <div className="stt-analysis">
          <h3>📝 STT 분석</h3>

          <div className="stt-stats">
            <div className="stt-stat-card">
              <div className="stt-icon">💬</div>
              <div className="stt-value">
                {Number(stt?.totalWords ?? 0).toLocaleString()}
              </div>
              <div className="stt-label">총 단어 수</div>
            </div>

            <div className="stt-stat-card">
              <div className="stt-icon">⏱️</div>
              <div className="stt-value">{stt?.averageResponseTime ?? 0}초</div>
              <div className="stt-label">평균 답변 시간</div>
            </div>

            <div className="stt-stat-card">
              <div className="stt-icon">😊</div>
              <div className="stt-value">{stt?.sentimentScore ?? 0}%</div>
              <div className="stt-label">긍정도</div>
            </div>
          </div>

          {isPlainObject(keywordUsage) ? (
            <div className="keyword-usage">
              <h4>키워드 사용 분포</h4>

              <div className="keyword-chart">
                {Object.entries(keywordUsage).map(([type, count]) => {
                  const total = Object.values(keywordUsage).reduce(
                    (a, b) => a + (Number(b) || 0),
                    0
                  );
                  const c = Number(count) || 0;
                  const percentage =
                    total > 0 ? ((c / total) * 100).toFixed(1) : "0.0";

                  const labels = {
                    technical: "기술",
                    soft: "소프트스킬",
                    company: "회사",
                  };

                  return (
                    <div key={type} className="keyword-bar-item">
                      <div className="keyword-bar-label">{labels[type] ?? type}</div>
                      <div className="keyword-bar-container">
                        <div
                          className="keyword-bar-fill"
                          style={{ width: `${percentage}%` }}
                        />
                        <span className="keyword-bar-value">
                          {c}회 ({percentage}%)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="keyword-usage">
              <EmptyBlock
                title="키워드 사용 데이터가 없습니다"
                desc="누락: interviewAnalysis.sttAnalysis.keywordUsage"
              />
            </div>
          )}
        </div>
      ) : (
        <div className="stt-analysis">
          <EmptyBlock title="STT 분석 데이터가 없습니다" desc="누락: interviewAnalysis.sttAnalysis" />
        </div>
      )}

      {Array.isArray(questionResponses) ? (
        <div className="question-responses">
          <h3>📋 질문별 답변 분석</h3>

          {questionResponses.length ? (
            questionResponses.map((item, idx) => {
              const score = clamp100(item?.score);
              const duration = Number(item?.duration) || 0;
              const response = item?.response ?? "";
              const feedback = item?.feedback ?? "";
              const question = item?.question ?? "";

              return (
                <div key={idx} className="response-card">
                  <div className="response-header">
                    <span className="question-number">Q{idx + 1}</span>
                    <span className="question-text">{question}</span>
                    <span className="response-score" style={{ color: getScoreColor(score) }}>
                      {score}점
                    </span>
                  </div>

                  <div className="response-body">
                    <div className="response-preview">
                      {response ? `${response.substring(0, 100)}...` : "-"}
                    </div>
                    <div className="response-meta">
                      <span className="response-duration">
                        ⏱️ {Math.floor(duration / 60)}분 {duration % 60}초
                      </span>
                    </div>
                  </div>

                  <div className="response-feedback">
                    <span className="feedback-icon">💡</span>
                    <span className="feedback-text">{feedback || "-"}</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="muted">질문별 답변 데이터가 없습니다</div>
          )}
        </div>
      ) : (
        <div className="question-responses">
          <EmptyBlock
            title="질문별 답변 데이터가 없습니다"
            desc="누락: interviewAnalysis.questionResponses"
          />
        </div>
      )}
    </div>
  );
}