import React, { useState } from "react";
import EmptyBlock from "../components/EmptyBlock";
import { clamp100, getScoreColor, isPlainObject } from "../utils/evalUtils";

/* ─────────────────────────────────────────────
   메인 컴포넌트
───────────────────────────────────────────── */
export default function InterviewTab({ data, turns = [] }) {
  const evaluation = data?.evaluation;
  const ia = evaluation?.interviewAnalysis;
  const [expandedAnswers, setExpandedAnswers] = useState({});

  const toggleAnswer = (key) => {
    setExpandedAnswers((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (!ia) {
    return (
      <div className="interview-tab__empty">
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
  const rawVoiceCoaching = ia?.voiceCoaching;
  const voiceCoaching = Array.isArray(rawVoiceCoaching)
    ? rawVoiceCoaching
    : typeof rawVoiceCoaching === "string" && rawVoiceCoaching.trim()
      ? [rawVoiceCoaching]
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
    <div className="interview-tab">
      {/* ── 페이지 타이틀 ── */}
      <div className="interview-tab__header">
        <h2 className="interview-tab__title">면접 음성 및 답변 분석</h2>
        <p className="interview-tab__subtitle">
          AI 기반 음성 품질 · STT · 답변 평가 리포트
        </p>
      </div>

      {/* ═══════════════════════════════════════
          섹션 1 : 음성 분석
      ═══════════════════════════════════════ */}
      {isPlainObject(voiceMetrics) || voiceCoaching.length > 0 ? (
        <section className="interview-section interview-section--spaced">
          <div className="interview-section__header">
            <span className="interview-section__icon">🎤</span>
            <span className="interview-section__title">음성 분석</span>
          </div>

          {/* 음성 메트릭 바 */}
          {isPlainObject(voiceMetrics) && (
            <div className="interview-voice-metrics">
              {Object.entries(voiceMetrics).map(([key, value]) => {
                const labels = {
                  clarity: "명확성",
                  pace: "말하기 속도",
                  volume: "음량",
                  confidence: "자신감",
                  fillerWords: "추임새 (개)",
                };
                const v = clamp100(value);
                const color = getScoreColor(v);

                return (
                  <div key={key}>
                    <div className="interview-voice-metric__row">
                      <span className="interview-voice-metric__label">
                        {labels[key] ?? key}
                      </span>
                      <span
                        className="interview-voice-metric__value"
                        style={{
                          color,
                          background: `${color}18`,
                        }}
                      >
                        {v}
                        {key !== "fillerWords" && "%"}
                      </span>
                    </div>

                    {key !== "fillerWords" && (
                      <div className="interview-voice-metric__track">
                        <div
                          className="interview-voice-metric__fill"
                          style={{
                            width: `${v}%`,
                            background: `linear-gradient(90deg, ${color}cc, ${color})`,
                          }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* 음성 코칭 */}
          {voiceCoaching.length > 0 && (
            <div className="interview-voice-coaching">
              <div className="interview-voice-coaching__title">
                <span style={{ fontSize: 15 }}>💡</span> 음성 코칭
              </div>
              <div className="interview-voice-coaching__list">
                {voiceCoaching.map((item, idx) => (
                  <div key={idx} className="interview-voice-coaching__item">
                    <span className="interview-voice-coaching__bullet">▸</span>
                    <span>
                      {typeof item === "string" ? item : JSON.stringify(item)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      ) : (
        <section className="interview-section interview-section--spaced">
          <div className="interview-section__header">
            <span className="interview-section__icon">🎤</span>
            <span className="interview-section__title">음성 분석</span>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════
          섹션 2 : STT 분석
      ═══════════════════════════════════════ */}
      {isPlainObject(stt) ? (
        <section className="interview-section interview-section--spaced">
          <div className="interview-section__header">
            <span className="interview-section__icon">📝</span>
            <span className="interview-section__title">STT 분석</span>
          </div>

          {/* 통계 카드 3개 */}
          <div className="interview-stats-grid">
            {[
              {
                icon: "💬",
                value: Number(stt?.totalWords ?? 0).toLocaleString(),
                label: "총 단어 수",
                gradient: "linear-gradient(135deg,#6366F1,#8B5CF6)",
              },
              {
                icon: "⏱️",
                value: `${stt?.averageResponseTime ?? 0}초`,
                label: "평균 답변 시간",
                gradient: "linear-gradient(135deg,#0EA5E9,#3B82F6)",
              },
              {
                icon: "😊",
                value: `${stt?.sentimentScore ?? 0}%`,
                label: "긍정도",
                gradient: "linear-gradient(135deg,#10B981,#34D399)",
              },
            ].map(({ icon, value, label }) => (
              <div key={label} className="interview-stat-card">
                <div className="interview-stat-card__icon">{icon}</div>
                <div className="interview-stat-card__value">{value}</div>
                <div className="interview-stat-card__label">{label}</div>
              </div>
            ))}
          </div>

          {/* 키워드 분포 */}
          {isPlainObject(keywordUsage) ? (
            <div>
              <div className="interview-keyword-section__title">
                🏷️ 키워드 사용 분포
              </div>

              <div className="interview-keyword-section__list">
                {(() => {
                  const total = Object.values(keywordUsage).reduce(
                    (a, b) => a + (Number(b) || 0),
                    0,
                  );

                  return Object.entries(keywordUsage).map(([type, count]) => {
                    const c = Number(count) || 0;
                    const pct =
                      total > 0 ? ((c / total) * 100).toFixed(1) : "0.0";

                    const labels = {
                      technical: "기술",
                      soft: "소프트스킬",
                      company: "회사",
                    };

                    const bg = getScoreColor(Number(pct));

                    return (
                      <div
                        key={type}
                        className="interview-keyword-section__row"
                      >
                        <span className="interview-keyword-section__label">
                          {labels[type] ?? type}
                        </span>

                        <div className="interview-keyword-section__track">
                          <div
                            className="interview-keyword-section__fill"
                            style={{
                              width: `${pct}%`,
                              background: bg,
                            }}
                          />
                        </div>

                        <span
                          className="interview-keyword-section__value"
                          style={{ color: bg }}
                        >
                          {c}회 ({pct}%)
                        </span>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          ) : (
            <EmptyBlock
              title="키워드 사용 데이터가 없습니다"
              desc="누락: sttAnalysis.keywordUsage"
            />
          )}

          {/* 종합 피드백 */}
          {stt?.overallFeedback && (
            <div className="interview-overall-feedback">
              <div className="interview-overall-feedback__title">
                📊 종합 피드백
              </div>

              <div className="interview-overall-feedback__text">
                {stt.overallFeedback}
              </div>
            </div>
          )}
        </section>
      ) : (
        <section className="interview-section interview-section--spaced">
          <div className="interview-section__header">
            <span className="interview-section__icon">📝</span>
            <span className="interview-section__title">STT 분석</span>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════
          섹션 3 : 질문별 답변 분석
      ═══════════════════════════════════════ */}
      <section className="interview-section">
        <div className="interview-section__header">
          <span className="interview-section__icon">📋</span>
          <span className="interview-section__title">질문별 답변 분석</span>
        </div>

        {!hasTurns ? (
          <EmptyBlock
            title="턴(turns) 데이터가 없습니다"
            desc="Evaluation.jsx에서 setTurns(res.turns) 확인하세요."
          />
        ) : (
          <div className="interview-turn-list">
            {turns.map((t, idx) => {
              const question = t?.question ?? "";
              const response = t?.sttText ?? "";
              const duration = Number(t?.audio?.durationSec ?? 0);
              const s = t?.scores || {};
              const fb = t?.feedback || {};
              const overallVoiceScore = clamp100(s?.overallVoiceScore);
              const confidenceScore = clamp100(s?.confidenceScore);
              const fluencyScore = clamp100(s?.fluencyScore);
              const tremorRiskScore = clamp100(s?.tremorRiskScore);
              const reliability =
                typeof s?.overallReliability === "number"
                  ? s.overallReliability
                  : null;
              const flags = Array.isArray(s?.flags) ? s.flags : [];
              const rawFlags =
                s?.raw?.tremor?.flags || s?.raw?.confidence?.flags || [];
              const flagItems = normalizeFlags(flags, rawFlags);

              const answerKey = t?.turnId ?? idx;
              const isExpanded = !!expandedAnswers[answerKey];
              const shouldTruncate = response.length > 120;
              const preview =
                shouldTruncate && !isExpanded
                  ? response.substring(0, 120)
                  : response;

              const oneLineFeedback = fb?.oneLineFeedback ?? "";
              const fullFeedback = fb?.fullFeedback ?? "";
              const answerScore = clamp100(fb?.score);
              const sentimentScore =
                typeof fb?.sentimentScore === "number"
                  ? clamp100(fb.sentimentScore)
                  : null;

              const overallColor = getScoreColor(overallVoiceScore);
              const answerColor = getScoreColor(answerScore);
              const sentimentColor =
                sentimentScore != null ? getScoreColor(sentimentScore) : null;

              const keywords = Array.isArray(fb?.keywords) ? fb.keywords : [];
              const { strength: feedbackStrength, weakness: feedbackWeakness } =
                parseQuestionFeedback(fullFeedback);

              const hasFeedbackSection =
                !!oneLineFeedback ||
                !!feedbackStrength ||
                !!feedbackWeakness ||
                !!fullFeedback ||
                keywords.length > 0 ||
                sentimentScore != null;

              return (
                <div key={t?.turnId ?? idx} className="interview-turn-card">
                  {/* 카드 헤더 */}
                  <div className="interview-turn-card__header">
                    {/* Q 번호 뱃지 */}
                    <div className="interview-turn-card__badge">Q{idx + 1}</div>

                    {/* 질문 텍스트 */}
                    <span className="interview-turn-card__question">
                      {question || "(질문 없음)"}
                    </span>

                    {/* 시간 */}
                    <span className="interview-turn-card__time">
                      ⏱ {Math.floor(duration / 60)}분 {duration % 60}초
                    </span>

                    {/* 점수 뱃지 */}
                    <span
                      className="interview-turn-card__score"
                      style={{
                        color: answerColor,
                        background: `${answerColor}18`,
                      }}
                    >
                      {answerScore}점
                    </span>
                  </div>

                  {/* 카드 바디 */}
                  <div className="interview-turn-card__body">
                    {/* 답변 미리보기 */}
                    <div className="interview-answer-box">
                      <div className="interview-answer-box__top">
                        <div className="interview-answer-box__label">
                          답변 내용
                        </div>
                        {shouldTruncate && (
                          <button
                            type="button"
                            onClick={() => toggleAnswer(answerKey)}
                            className="interview-answer-box__toggle"
                          >
                            {isExpanded ? "접기" : "전체보기"}
                          </button>
                        )}
                      </div>

                      <div className="interview-answer-box__text">
                        {preview
                          ? `${preview}${shouldTruncate && !isExpanded ? "..." : ""}`
                          : "(답변 없음)"}
                      </div>

                      {reliability != null && (
                        <div className="interview-answer-box__reliability">
                          ✅ 신뢰도 {(reliability * 100).toFixed(0)}%
                        </div>
                      )}
                    </div>

                    {/* 종합 음성 점수 바 */}
                    <div>
                      <div className="interview-score-summary__row">
                        <span className="interview-score-summary__label">
                          종합 음성 점수
                        </span>
                        <span
                          className="interview-score-summary__value"
                          style={{ color: overallColor }}
                        >
                          {overallVoiceScore}점
                        </span>
                      </div>

                      <div className="interview-score-summary__track">
                        <div
                          className="interview-score-summary__fill"
                          style={{
                            width: `${overallVoiceScore}%`,
                            background: `linear-gradient(90deg,${overallColor}99,${overallColor})`,
                          }}
                        />
                      </div>
                    </div>

                    {/* 음성 점수 세부 */}
                    <div className="interview-voice-detail-box">
                      <div className="interview-voice-detail-box__title">
                        🎧 음성 세부 점수
                      </div>

                      <div className="interview-voice-detail-box__bars">
                        <VerticalBar label="자신감" value={confidenceScore} />
                        <VerticalBar label="유창성" value={fluencyScore} />
                        <VerticalBar
                          label="안정감"
                          value={100 - tremorRiskScore}
                        />
                      </div>

                      <div>
                        <div className="interview-voice-detail-box__flags-label">
                          🚩 감지된 플래그
                        </div>

                        {flagItems.length ? (
                          <div className="interview-voice-detail-box__flags">
                            {flagItems.map((it) => (
                              <FlagChip key={it.code} it={it} />
                            ))}
                          </div>
                        ) : (
                          <span style={{ fontSize: 12, color: "#94a3b8" }}>
                            플래그 없음
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 오디오 플레이어 */}
                    {t?.audio?.audioUrl && (
                      <div className="interview-audio-box">
                        <div className="interview-audio-box__title">
                          🎵 답변 오디오
                        </div>
                        <audio
                          controls
                          className="interview-audio-box__player"
                          src={t.audio.audioUrl}
                        />
                      </div>
                    )}

                    {/* 답변 피드백 */}
                    {hasFeedbackSection && (
                      <div className="interview-feedback-box">
                        <div className="interview-feedback-box__title">
                          💬 답변 피드백
                        </div>

                        {oneLineFeedback && (
                          <div className="interview-feedback-box__summary">
                            "{oneLineFeedback}"
                          </div>
                        )}

                        {feedbackStrength && (
                          <div className="interview-feedback-block">
                            <div className="interview-feedback-block__label">
                              장점
                            </div>
                            <div className="interview-feedback-block__text">
                              {feedbackStrength}
                            </div>
                          </div>
                        )}

                        {feedbackWeakness && (
                          <FeedbackBlock text={feedbackWeakness} />
                        )}

                        {keywords.length > 0 && (
                          <div className="interview-feedback-box__keywords-wrap">
                            <div className="interview-feedback-box__keywords-label">
                              🏷️ 키워드
                            </div>
                            <div className="interview-feedback-box__keywords">
                              {keywords.map((kw, i) => (
                                <span
                                  key={`${kw}-${i}`}
                                  className="interview-feedback-box__keyword"
                                >
                                  {kw}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {sentimentScore != null && (
                          <div className="interview-feedback-box__sentiment">
                            <span className="interview-feedback-box__sentiment-label">
                              😊 긍정도
                            </span>
                            <div className="interview-feedback-box__sentiment-track">
                              <div
                                className="interview-feedback-box__sentiment-fill"
                                style={{
                                  width: `${sentimentScore}%`,
                                  background: `linear-gradient(90deg, ${sentimentColor}99, ${sentimentColor})`,
                                }}
                              />
                            </div>
                            <span
                              className="interview-feedback-box__sentiment-value"
                              style={{ color: sentimentColor }}
                            >
                              {sentimentScore}%
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

/* ─────────────────────────────────────────────
   서브 컴포넌트
───────────────────────────────────────────── */

function FeedbackBlock({ text }) {
  return (
    <div className="interview-feedback-block">
      <div className="interview-feedback-block__label">강점</div>
      <div className="interview-feedback-block__text">{text}</div>
    </div>
  );
}

function FlagChip({ it }) {
  const style = {
    danger: { bg: "#FFF1F2", color: "#BE123C", border: "#FECDD3" },
    warning: { bg: "#FFFBEB", color: "#B45309", border: "#FDE68A" },
    info: { bg: "#EFF6FF", color: "#1D4ED8", border: "#BFDBFE" },
  }[it.severity] ?? {
    bg: "#F8FAFC",
    color: "#475569",
    border: "#E5E7EB",
  };

  return (
    <span
      className="interview-flag-chip"
      style={{
        background: style.bg,
        color: style.color,
        border: `1px solid ${style.border}`,
      }}
    >
      <span
        className="interview-flag-chip__code"
        style={{
          background: style.color,
          color: "#fff",
        }}
      >
        {it.code}
      </span>
      {it.message}
    </span>
  );
}

function VerticalBar({ label, value }) {
  const v = clamp100(value);
  const color = getScoreColor(v);

  return (
    <div className="interview-vertical-bar">
      <div className="interview-vertical-bar__track">
        <div
          className="interview-vertical-bar__fill"
          style={{
            height: `${v}%`,
            background: `linear-gradient(180deg, ${color}99 0%, ${color} 100%)`,
          }}
        />
      </div>

      <div className="interview-vertical-bar__value" style={{ color }}>
        {v}
      </div>

      <div className="interview-vertical-bar__label">{label}</div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   유틸
───────────────────────────────────────────── */

function normalizeFlags(codeList = [], rawFlags = []) {
  const rawMap = new Map();
  rawFlags.forEach((f) => {
    if (f) rawMap.set(f.code, f.message);
  });
  return (codeList || []).map((code) => ({
    code,
    message: rawMap.get(code) || flagCodeToKorean(code),
    severity: flagSeverity(code),
  }));
}

function flagSeverity(code) {
  if (new Set(["JITTER_HIGH", "SHIMMER_HIGH", "PITCH_UNSTABLE"]).has(code))
    return "danger";
  if (new Set(["SILENCE_HIGH", "LOW_SAMPLE", "PY_METRIC_MISSING"]).has(code))
    return "warning";
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
