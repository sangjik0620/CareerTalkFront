import React from "react";
import EmptyBlock from "../components/EmptyBlock";
import { clamp100, getScoreColor, isPlainObject } from "../utils/evalUtils";

export default function InterviewTab({ data, turns = [] }) {
  const ia = data?.interviewAnalysis;

  if (!ia) {
    return (
      <div className="tab-content">
        <EmptyBlock
          title="면접 분석 데이터가 없습니다"
          desc="누락: interviewAnalysis"
        />
      </div>
    );
  }

  const voiceMetrics = ia?.voiceMetrics;
  const stt = ia?.sttAnalysis;
  const keywordUsage = stt?.keywordUsage;

  const hasTurns = Array.isArray(turns) && turns.length > 0;

  const questionResponses = Array.isArray(ia?.questionResponses)
    ? ia.questionResponses
    : [];

  function parseQuestionFeedback(text = "") {
    const clean = String(text).replace("상세 피드백:", "").trim();

    const strengthPart = clean.split("보완점:")[0] || "";
    const weaknessPart = clean.split("보완점:")[1] || "";

    const strength = strengthPart.replace("장점:", "").trim();
    const weakness = weaknessPart.trim();

    return { strength, weakness };
  }

  return (
    <div className="tab-content">
      <h2>면접 음성 및 답변 분석</h2>

      {/* =========================
          1️⃣ 음성 분석
      ========================= */}
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

      {/* =========================
          2️⃣ STT 분석
      ========================= */}
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
                      <div className="keyword-bar-label">
                        {labels[type] ?? type}
                      </div>

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
          <EmptyBlock
            title="STT 분석 데이터가 없습니다"
            desc="누락: interviewAnalysis.sttAnalysis"
          />
        </div>
      )}

      {/* =========================
          3️⃣ 질문별 분석 (turns)
      ========================= */}
      <div className="question-responses">
        <h3>📋 질문별 답변 분석</h3>

        {!hasTurns ? (
          <EmptyBlock
            title="턴(turns) 데이터가 없습니다"
            desc="Evaluation.jsx에서 setTurns(res.turns) 확인하세요."
          />
        ) : (
          turns.map((t, idx) => {
            const question = t?.question ?? "";
            const response = t?.sttText ?? "";
            const sttStatus = t?.sttStatus ?? "-";

            const duration = Number(t?.audio?.durationSec ?? 0);
            const s = t?.scores || {};

            const overallVoiceScore = clamp100(s?.overallVoiceScore);
            const confidenceScore = clamp100(s?.confidenceScore);
            const fluencyScore = clamp100(s?.fluencyScore);
            const tremorRiskScore = clamp100(s?.tremorRiskScore);

            const reliability =
              typeof s?.overallReliability === "number"
                ? s.overallReliability
                : null;

            const grade = s?.overallGrade ?? "";
            const flags = Array.isArray(s?.flags) ? s.flags : [];
            const rawFlags =
              s?.raw?.tremor?.flags || s?.raw?.confidence?.flags || [];

            const flagItems = normalizeFlags(flags, rawFlags);
            const overallColor = getScoreColor(overallVoiceScore);
            const preview = response ? response.substring(0, 100) : "";

            const questionFeedback =
              questionResponses.find(
                (item) => Number(item?.turnNo ?? 0) === idx + 1
              ) || null;

            const oneLineFeedback = questionFeedback?.oneLineFeedback ?? "";
            const fullFeedback = questionFeedback?.fullFeedback ?? "";
            const answerScore = Number(questionFeedback?.score ?? 0);

            const { strength: feedbackStrength, weakness: feedbackWeakness } =
              parseQuestionFeedback(fullFeedback);

            return (
              <div key={t?.turnId ?? idx} className="response-card">
                <div className="response-header">
                  <span className="question-number">Q{idx + 1}</span>
                  <span className="question-text">{question}</span>
                  <span className="response-duration">
                    ⏱️ {Math.floor(duration / 60)}분 {duration % 60}초
                  </span>
                  <span
                    className="response-score"
                    style={{ color: overallColor }}
                  >
                    {answerScore}점
                  </span>
                </div>

                <div className="response-body">
                  <div className="response-preview">
                    {preview
                      ? `${preview}${response.length > 100 ? "..." : ""}`
                      : "(답변 없음)"}
                  </div>

                  <div
                    className="response-meta"
                    style={{
                      display: "flex",
                      gap: 12,
                      flexWrap: "wrap",
                    }}
                  >
                    {reliability != null && (
                      <span className="response-duration">
                        ✅ 신뢰도 {(reliability * 100).toFixed(0)}%
                      </span>
                    )}
                  </div>
                </div>

                <div
                  className="itv-bar itv-bar--overall"
                  style={{ marginTop: 10 }}
                >
                  <div
                    className="itv-fill"
                    style={{
                      width: `${overallVoiceScore}%`,
                      backgroundColor: overallColor,
                      height: 10,
                      borderRadius: 999,
                    }}
                  />
                </div>

                <div style={{ marginTop: 12 }}>
                  <div style={{ fontWeight: 700, marginBottom: 8 }}>
                    🎧 음성 점수
                  </div>

                  <div className="voice-score-area">
                    <div className="voice-score-summary">
                      <span className="voice-score-summary-label">종합 음성 점수</span>
                      <span className="voice-score-summary-value">
                        {overallVoiceScore != null ? `${overallVoiceScore}점` : "-"}
                      </span>
                    </div>
                    <div className="voice-bar-chart">
                      <VerticalBar label="자신감" value={confidenceScore} />
                      <VerticalBar label="유창성" value={fluencyScore} />
                      <VerticalBar
                        label="안정감"
                        value={100 - tremorRiskScore}
                      />
                    </div>

                    <div className="voice-flags">
                      <div className="flag-title">🚩 감지된 플래그</div>

                      {flagItems.length ? (
                        <div className="flag-list">
                          {flagItems.map((it) => (
                            <span
                              key={it.code}
                              className={`flag-chip ${it.severity}`}
                            >
                              <span className="flag-code">{it.code}</span>
                              <span className="flag-msg">{it.message}</span>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className="muted">플래그 없음</div>
                      )}
                    </div>
                  </div>
                </div>

                {t?.audio?.audioUrl && (
                  <div style={{ marginTop: 14 }}>
                    <audio
                      controls
                      style={{ width: "100%" }}
                      src={t.audio.audioUrl}
                    />
                  </div>
                )}

                {(oneLineFeedback || feedbackStrength || feedbackWeakness) && (
                  <div className="analysis-section" style={{ marginTop: 15 }}>
                    <h4>답변 피드백</h4>

                    {oneLineFeedback && (
                      <div style={{ marginBottom: "10px" }}>
                        <strong>한줄평</strong>
                        <div style={{ whiteSpace: "pre-wrap" }}>
                          {oneLineFeedback}
                        </div>
                      </div>
                    )}

                    {feedbackStrength && (
                      <div style={{ marginBottom: "5px" }}>
                        <strong>강점</strong>
                        <div style={{ whiteSpace: "pre-wrap" }}>
                          {feedbackStrength}
                        </div>
                      </div>
                    )}

                    {feedbackWeakness && (
                      <div>
                        <strong>보완점</strong>
                        <div style={{ whiteSpace: "pre-wrap" }}>
                          {feedbackWeakness}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function normalizeFlags(codeList = [], rawFlags = []) {
  const rawMap = new Map();

  rawFlags.forEach((f) => {
    if (!f) return;
    rawMap.set(f.code, f.message);
  });

  return (codeList || []).map((code) => ({
    code,
    message: rawMap.get(code) || flagCodeToKorean(code),
    severity: flagSeverity(code),
  }));
}

function flagSeverity(code) {
  const danger = new Set(["JITTER_HIGH", "SHIMMER_HIGH", "PITCH_UNSTABLE"]);
  const warning = new Set(["SILENCE_HIGH", "LOW_SAMPLE", "PY_METRIC_MISSING"]);

  if (danger.has(code)) return "danger";
  if (warning.has(code)) return "warning";
  return "info";
}

function flagCodeToKorean(code) {
  const map = {
    JITTER_HIGH: "발성이 미세하게 흔들리는 경향이 있어요.",
    SHIMMER_HIGH: "볼륨 안정성이 떨어져 떨림처럼 들릴 수 있어요.",
    PITCH_UNSTABLE: "음높이 변동이 커서 긴장된 인상을 줄 수 있어요.",
    SILENCE_HIGH: "말 사이 멈춤이 잦아 불안하게 들릴 수 있어요.",
    LOW_SAMPLE: "분석 구간이 짧아 점수 신뢰도가 낮을 수 있어요.",
    PY_METRIC_MISSING: "일부 음성 지표가 누락되었습니다.",
  };

  return map[code] || code;
}

function VerticalBar({ label, value }) {
  const v = clamp100(value);

  return (
    <div className="vertical-bar-item">
      <div className="bar-wrapper">
        <div
          className="bar-fill"
          style={{
            height: `${v}%`,
            backgroundColor: getScoreColor(v),
          }}
        />
      </div>

      <div className="bar-score">{v}점</div>
      <div className="bar-label">{label}</div>
    </div>
  );
}