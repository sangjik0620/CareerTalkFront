import React from "react";
import EmptyBlock from "../components/EmptyBlock";
import { clamp100, getScoreColor, isPlainObject } from "../utils/evalUtils";

/**
 * props:
 * - data: evaluation.evaluation (기존 summary/analysis 구조)
 * - turns: A안 응답의 turns[] (turn별 stt/metrics/scores 포함)
 */
export default function InterviewTab({ data, turns = [] }) {
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

  // turns가 없으면 fallback으로 기존 questionResponses를 보여줄 수도 있지만,
  // 요청이 "turns 기반"이라 turns 없으면 안내만 띄우도록 처리
  const hasTurns = Array.isArray(turns) && turns.length > 0;

  return (
    <div className="tab-content">
      <h2>면접 음성 및 답변 분석</h2>

      {/* =========================
          1) 음성 분석(기존 유지)
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
          2) STT 분석(기존 유지)
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

      {/* =========================
          3) 질문별(턴별) 분석: turns 기반
         ========================= */}
      <div className="question-responses">
        <h3>📋 질문별 답변 분석</h3>

        {!hasTurns ? (
          <EmptyBlock
            title="턴(turns) 데이터가 없습니다"
            desc="A안 응답의 turns[]가 비어 있습니다. Evaluation.jsx에서 setTurns(res.turns) 확인하세요."
          />
        ) : (
          turns.map((t, idx) => {
            const question = t?.question ?? "";
            const response = t?.sttText ?? "";
            const sttStatus = t?.sttStatus ?? "-";

            const duration = Number(t?.audio?.durationSec ?? 0) || 0;

            // ===== 음성 점수들 =====
            const s = t?.scores || {};
            const overallVoiceScore = clamp100(s?.overallVoiceScore);
            const confidenceScore = clamp100(s?.confidenceScore);
            const fluencyScore = clamp100(s?.fluencyScore);
            const tremorRiskScore = clamp100(s?.tremorRiskScore);
            const reliability = typeof s?.overallReliability === "number" ? s.overallReliability : null;
            const grade = s?.overallGrade ?? "";

            const flags = Array.isArray(s?.flags) ? s.flags : [];

            // 진행바/색상용
            const overallColor = getScoreColor(overallVoiceScore);

            // 짧은 미리보기
            const preview = response ? response.substring(0, 100) : "";

            return (
              <div key={t?.turnId ?? idx} className="response-card">
                {/* 카드 헤더 */}
                <div className="response-header">
                  <span className="question-number">Q{idx + 1}</span>
                  <span className="question-text">{question}</span>

                  {/* ✅ 우측 점수: 음성 종합 점수 */}
                  <span className="response-score" style={{ color: overallColor }}>
                    {Number.isFinite(overallVoiceScore) ? overallVoiceScore : 0}점
                  </span>
                </div>

                {/* 답변/메타 */}
                <div className="response-body">
                  <div className="response-preview">
                    {preview ? `${preview}${response.length > 100 ? "..." : ""}` : "(답변 없음)"}
                  </div>

                  <div className="response-meta" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <span className="response-duration">
                      ⏱️ {Math.floor(duration / 60)}분 {duration % 60}초
                    </span>
                    <span className="response-duration">📝 STT: {sttStatus}</span>
                    {grade ? <span className="response-duration">🏷️ {grade}</span> : null}
                    {reliability != null ? (
                      <span className="response-duration">
                        ✅ 신뢰도 {(reliability * 100).toFixed(0)}%
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* ✅ 음성 종합 점수 바 */}
                <div className="metric-bar" style={{ marginTop: 10 }}>
                  <div
                    className="metric-fill voice"
                    style={{
                      width: `${Number.isFinite(overallVoiceScore) ? overallVoiceScore : 0}%`,
                      backgroundColor: overallColor,
                      height: 10,
                      borderRadius: 999,
                    }}
                  />
                </div>

                {/* ✅ 아래: 음성 점수 상세 */}
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontWeight: 700, marginBottom: 8 }}>🎧 음성 점수</div>

                  {/* 3개 바: Confidence / Fluency / TremorRisk */}
                  <ScoreRow label="자신감" value={confidenceScore} />
                  <ScoreRow label="유창성" value={fluencyScore} />

                  {/* tremorRisk는 '높을수록 위험'이라서 사용자에게는 “안정성(100-위험)”로 보여주는 게 자연스러움 */}
                  <ScoreRow
                    label="안정성"
                    value={Number.isFinite(tremorRiskScore) ? 100 - tremorRiskScore : 0}
                    subLabel="(떨림 위험 반전)"
                  />

                  {/* flags */}
                  <div style={{ marginTop: 10 }}>
                    <div style={{ fontWeight: 600, marginBottom: 6 }}>🚩 감지된 플래그</div>
                    {flags.length ? (
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {flags.map((f) => (
                          <span
                            key={f}
                            style={{
                              padding: "6px 10px",
                              borderRadius: 999,
                              background: "#EEF4FF",
                              border: "1px solid #D9E6FF",
                              fontSize: 12,
                              fontWeight: 600,
                              color: "#2B5BFF",
                            }}
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="muted">플래그가 없습니다</div>
                    )}
                  </div>
                </div>

                {/* (선택) 오디오 재생 링크가 있으면 작은 버튼 */}
                {t?.audio?.audioUrl ? (
                  <div style={{ marginTop: 14 }}>
                    <audio controls style={{ width: "100%" }} src={t.audio.audioUrl} />
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

/** 내부 컴포넌트: 점수 row + bar (기존 스타일을 해치지 않게 최소 스타일) */
function ScoreRow({ label, value, subLabel }) {
  const v = clamp100(value);
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div style={{ fontWeight: 600 }}>
          {label}{" "}
          {subLabel ? <span style={{ fontSize: 12, fontWeight: 500, opacity: 0.7 }}>{subLabel}</span> : null}
        </div>
        <div style={{ fontWeight: 700, color: getScoreColor(v) }}>{v}점</div>
      </div>

      <div className="metric-bar" style={{ marginTop: 6 }}>
        <div
          className="metric-fill voice"
          style={{
            width: `${v}%`,
            backgroundColor: getScoreColor(v),
            height: 10,
            borderRadius: 999,
          }}
        />
      </div>
    </div>
  );
}