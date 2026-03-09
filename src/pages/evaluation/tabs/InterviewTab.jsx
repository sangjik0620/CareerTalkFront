import React from "react";
import EmptyBlock from "../components/EmptyBlock";
import { clamp100, getScoreColor, isPlainObject } from "../utils/evalUtils";

/* ─────────────────────────────────────────────
   디자인 토큰
───────────────────────────────────────────── */
const T = {
  primary:     "#6366F1",
  primaryLight:"#818CF8",
  secondary:   "#8B5CF6",
  success:     "#10B981",
  warning:     "#F59E0B",
  danger:      "#EF4444",
  info:        "#3B82F6",
  bg:          "#F8FAFC",
  surface:     "#FFFFFF",
  border:      "#E2E8F0",
  text:        "#1E293B",
  textSub:     "#64748B",
  textMuted:   "#94A3B8",
  radius:      "16px",
  radiusSm:    "10px",
  shadow:      "0 1px 3px rgba(0,0,0,.06), 0 4px 16px rgba(0,0,0,.04)",
  shadowMd:    "0 4px 24px rgba(99,102,241,.10)",
};

/* ─────────────────────────────────────────────
   공통 스타일 헬퍼
───────────────────────────────────────────── */
const card = (extra = {}) => ({
  background: T.surface,
  borderRadius: T.radius,
  border: `1px solid ${T.border}`,
  boxShadow: T.shadow,
  padding: "24px",
  ...extra,
});

const sectionHeader = (gradient) => ({
  display: "flex",
  alignItems: "center",
  gap: "10px",
  fontSize: "16px",
  fontWeight: 700,
  color: T.text,
  marginBottom: "20px",
  paddingBottom: "14px",
  borderBottom: `2px solid transparent`,
  backgroundImage: `${gradient}, linear-gradient(${T.border}, ${T.border})`,
  backgroundSize: "60px 2px, 100% 2px",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "left bottom, left bottom",
});

const iconBadge = (bg, color = "#fff") => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 32,
  height: 32,
  borderRadius: 8,
  background: bg,
  color,
  fontSize: 16,
  flexShrink: 0,
});

/* ─────────────────────────────────────────────
   메인 컴포넌트
───────────────────────────────────────────── */
export default function InterviewTab({ data, turns = [] }) {
  const ia = data?.interviewAnalysis;

  if (!ia) {
    return (
      <div style={{ padding: 32 }}>
        <EmptyBlock
          title="면접 분석 데이터가 없습니다"
          desc="누락: interviewAnalysis"
        />
      </div>
    );
  }

  const voiceMetrics     = ia?.voiceMetrics;
  const stt              = ia?.sttAnalysis;
  const keywordUsage     = stt?.keywordUsage;
  const hasTurns         = Array.isArray(turns) && turns.length > 0;
  const rawVoiceCoaching = ia?.voiceCoaching;
  const voiceCoaching    = Array.isArray(rawVoiceCoaching)
    ? rawVoiceCoaching
    : typeof rawVoiceCoaching === "string" && rawVoiceCoaching.trim()
      ? [rawVoiceCoaching]
      : [];

  function parseQuestionFeedback(text = "") {
    const clean        = String(text).replace("상세 피드백:", "").trim();
    const strengthPart = clean.split("보완점:")[0] || "";
    const weaknessPart = clean.split("보완점:")[1] || "";
    const strength     = strengthPart.replace("장점:", "").trim();
    const weakness     = weaknessPart.trim();
    return { strength, weakness };
  }

  return (
    <div style={{ background: T.bg, minHeight: "100vh", padding: "28px 24px", fontFamily: "'Pretendard', 'Noto Sans KR', sans-serif" }}>

      {/* ── 페이지 타이틀 ── */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: T.text, letterSpacing: "-0.4px" }}>
          면접 음성 및 답변 분석
        </h2>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: T.textMuted }}>
          AI 기반 음성 품질 · STT · 답변 평가 리포트
        </p>
      </div>

      {/* ═══════════════════════════════════════
          섹션 1 : 음성 분석
      ═══════════════════════════════════════ */}
      {isPlainObject(voiceMetrics) || voiceCoaching.length > 0 ? (
        <section style={{ ...card(), marginBottom: 20 }}>
          <div style={sectionHeader("linear-gradient(90deg,#6366F1,#8B5CF6)")}>
            <span style={iconBadge("linear-gradient(135deg,#6366F1,#8B5CF6)")}>🎤</span>
            음성 분석
          </div>

          {/* 음성 메트릭 바 */}
          {isPlainObject(voiceMetrics) && (
            <div style={{ display: "grid", gap: 14 }}>
              {Object.entries(voiceMetrics).map(([key, value]) => {
                const labels = {
                  clarity:     "명확성",
                  pace:        "말하기 속도",
                  volume:      "음량",
                  confidence:  "자신감",
                  fillerWords: "추임새 (개)",
                };
                const v     = clamp100(value);
                const color = getScoreColor(v);

                return (
                  <div key={key}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: T.textSub }}>
                        {labels[key] ?? key}
                      </span>
                      <span style={{
                        fontSize: 13, fontWeight: 700,
                        color,
                        background: `${color}18`,
                        padding: "2px 10px",
                        borderRadius: 20,
                      }}>
                        {v}{key !== "fillerWords" && "%"}
                      </span>
                    </div>

                    {key !== "fillerWords" && (
                      <div style={{ height: 8, background: "#F1F5F9", borderRadius: 999, overflow: "hidden" }}>
                        <div style={{
                          height: "100%",
                          width: `${v}%`,
                          background: `linear-gradient(90deg, ${color}cc, ${color})`,
                          borderRadius: 999,
                          transition: "width .6s ease",
                        }} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* 음성 코칭 */}
          {voiceCoaching.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.textSub, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 15 }}>💡</span> 음성 코칭
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {voiceCoaching.map((item, idx) => (
                  <div key={idx} style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    background: "#EEF2FF",
                    borderRadius: T.radiusSm,
                    padding: "10px 14px",
                    fontSize: 13,
                    color: "#3730A3",
                    lineHeight: 1.6,
                  }}>
                    <span style={{ flexShrink: 0, marginTop: 1 }}>▸</span>
                    <span>{typeof item === "string" ? item : JSON.stringify(item)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      ) : (
        <section style={{ ...card(), marginBottom: 20 }}>
          <div style={sectionHeader("linear-gradient(90deg,#6366F1,#8B5CF6)")}>
            <span style={iconBadge("linear-gradient(135deg,#6366F1,#8B5CF6)")}>🎤</span>
            음성 분석
          </div>
          <EmptyBlock title="음성 분석 데이터가 없습니다" desc="누락: voiceMetrics / voiceCoaching" />
        </section>
      )}

      {/* ═══════════════════════════════════════
          섹션 2 : STT 분석
      ═══════════════════════════════════════ */}
      {isPlainObject(stt) ? (
        <section style={{ ...card(), marginBottom: 20 }}>
          <div style={sectionHeader("linear-gradient(90deg,#0EA5E9,#3B82F6)")}>
            <span style={iconBadge("linear-gradient(135deg,#0EA5E9,#3B82F6)")}>📝</span>
            STT 분석
          </div>

          {/* 통계 카드 3개 */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 24 }}>
            {[
              { icon: "💬", value: Number(stt?.totalWords ?? 0).toLocaleString(), label: "총 단어 수",    gradient: "linear-gradient(135deg,#6366F1,#8B5CF6)" },
              { icon: "⏱️", value: `${stt?.averageResponseTime ?? 0}초`,          label: "평균 답변 시간",gradient: "linear-gradient(135deg,#0EA5E9,#3B82F6)" },
              { icon: "😊", value: `${stt?.sentimentScore ?? 0}%`,                label: "긍정도",       gradient: "linear-gradient(135deg,#10B981,#34D399)" },
            ].map(({ icon, value, label, gradient }) => (
              <div key={label} style={{
                background: gradient,
                borderRadius: T.radius,
                padding: "18px 16px",
                color: "#fff",
                textAlign: "center",
                boxShadow: T.shadowMd,
              }}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>{icon}</div>
                <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.5px" }}>{value}</div>
                <div style={{ fontSize: 11, fontWeight: 500, opacity: 0.85, marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>

          {/* 키워드 분포 */}
          {isPlainObject(keywordUsage) ? (
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.textSub, marginBottom: 12 }}>
                🏷️ 키워드 사용 분포
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {Object.entries(keywordUsage).map(([type, count]) => {
                  const total   = Object.values(keywordUsage).reduce((a, b) => a + (Number(b) || 0), 0);
                  const c       = Number(count) || 0;
                  const pct     = total > 0 ? ((c / total) * 100).toFixed(1) : "0.0";
                  const labels  = { technical: "기술", soft: "소프트스킬", company: "회사" };
                  const colors  = { technical: T.primary, soft: T.secondary, company: T.info };
                  const bg      = colors[type] ?? T.textSub;

                  return (
                    <div key={type} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{
                        width: 68, flexShrink: 0,
                        fontSize: 12, fontWeight: 600,
                        color: T.textSub,
                      }}>
                        {labels[type] ?? type}
                      </span>
                      <div style={{ flex: 1, height: 10, background: "#F1F5F9", borderRadius: 999, overflow: "hidden" }}>
                        <div style={{
                          height: "100%",
                          width: `${pct}%`,
                          background: bg,
                          borderRadius: 999,
                          transition: "width .6s ease",
                        }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 600, color: bg, width: 80, textAlign: "right", flexShrink: 0 }}>
                        {c}회 ({pct}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <EmptyBlock title="키워드 사용 데이터가 없습니다" desc="누락: sttAnalysis.keywordUsage" />
          )}
        </section>
      ) : (
        <section style={{ ...card(), marginBottom: 20 }}>
          <div style={sectionHeader("linear-gradient(90deg,#0EA5E9,#3B82F6)")}>
            <span style={iconBadge("linear-gradient(135deg,#0EA5E9,#3B82F6)")}>📝</span>
            STT 분석
          </div>
          <EmptyBlock title="STT 분석 데이터가 없습니다" desc="누락: interviewAnalysis.sttAnalysis" />
              {stt?.overallFeedback && (
      <div
        style={{
          marginTop: 20,
          background: "#F0F9FF",
          border: "1px solid #BAE6FD",
          borderRadius: T.radiusSm,
          padding: "16px",
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "#0369A1",
            marginBottom: 8,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          📊 종합 피드백
        </div>

        <div
          style={{
            fontSize: 13,
            color: "#075985",
            lineHeight: 1.7,
            whiteSpace: "pre-wrap",
          }}
        >
          {stt.overallFeedback}
        </div>
      </div>
    )}
        </section>
      )}

      {/* ═══════════════════════════════════════
          섹션 3 : 질문별 답변 분석
      ═══════════════════════════════════════ */}
      <section style={card()}>
        <div style={sectionHeader("linear-gradient(90deg,#F59E0B,#EF4444)")}>
          <span style={iconBadge("linear-gradient(135deg,#F59E0B,#EF4444)")}>📋</span>
          질문별 답변 분석
        </div>

        {!hasTurns ? (
          <EmptyBlock title="턴(turns) 데이터가 없습니다" desc="Evaluation.jsx에서 setTurns(res.turns) 확인하세요." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {turns.map((t, idx) => {
              const question         = t?.question ?? "";
              const response         = t?.sttText ?? "";
              const duration         = Number(t?.audio?.durationSec ?? 0);
              const s                = t?.scores || {};
              const fb               = t?.feedback || {};
              const overallVoiceScore= clamp100(s?.overallVoiceScore);
              const confidenceScore  = clamp100(s?.confidenceScore);
              const fluencyScore     = clamp100(s?.fluencyScore);
              const tremorRiskScore  = clamp100(s?.tremorRiskScore);
              const reliability      = typeof s?.overallReliability === "number" ? s.overallReliability : null;
              const flags            = Array.isArray(s?.flags) ? s.flags : [];
              const rawFlags         = s?.raw?.tremor?.flags || s?.raw?.confidence?.flags || [];
              const flagItems        = normalizeFlags(flags, rawFlags);
              const overallColor     = getScoreColor(overallVoiceScore);
              const preview          = response ? response.substring(0, 120) : "";
              const oneLineFeedback  = fb?.oneLineFeedback ?? "";
              const fullFeedback     = fb?.fullFeedback ?? "";
              const answerScore      = Number(fb?.score ?? 0);
              const sentimentScore   = typeof fb?.sentimentScore === "number" ? fb.sentimentScore : null;
              const keywords         = Array.isArray(fb?.keywords) ? fb.keywords : [];
              const { strength: feedbackStrength, weakness: feedbackWeakness } = parseQuestionFeedback(fullFeedback);
              const hasFeedbackSection = !!oneLineFeedback || !!feedbackStrength || !!feedbackWeakness || !!fullFeedback || keywords.length > 0 || sentimentScore != null;

              return (
                <div key={t?.turnId ?? idx} style={{
                  background: T.surface,
                  border: `1px solid ${T.border}`,
                  borderRadius: T.radius,
                  overflow: "hidden",
                  boxShadow: T.shadow,
                }}>

                  {/* 카드 헤더 */}
                  <div style={{
                    background: "linear-gradient(135deg,#F8FAFC 0%,#EEF2FF 100%)",
                    borderBottom: `1px solid ${T.border}`,
                    padding: "16px 20px",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}>
                    {/* Q 번호 뱃지 */}
                    <div style={{
                      width: 36, height: 36, borderRadius: 10,
                      background: "linear-gradient(135deg,#6366F1,#8B5CF6)",
                      color: "#fff", fontWeight: 800, fontSize: 14,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0, boxShadow: "0 2px 8px #6366F140",
                    }}>
                      Q{idx + 1}
                    </div>

                    {/* 질문 텍스트 */}
                    <span style={{ flex: 1, fontWeight: 700, fontSize: 14, color: T.text, lineHeight: 1.5 }}>
                      {question || "(질문 없음)"}
                    </span>

                    {/* 시간 */}
                    <span style={{
                      fontSize: 12, color: T.textMuted,
                      background: "#F1F5F9", borderRadius: 20,
                      padding: "3px 10px", flexShrink: 0,
                    }}>
                      ⏱ {Math.floor(duration / 60)}분 {duration % 60}초
                    </span>

                    {/* 점수 뱃지 */}
                    <span style={{
                      fontSize: 15, fontWeight: 800,
                      color: overallColor,
                      background: `${overallColor}18`,
                      borderRadius: 20,
                      padding: "3px 12px",
                      flexShrink: 0,
                    }}>
                      {answerScore}점
                    </span>
                  </div>

                  {/* 카드 바디 */}
                  <div style={{ padding: "18px 20px 20px", display: "flex", flexDirection: "column", gap: 18 }}>

                    {/* 답변 미리보기 */}
                    <div style={{
                      background: "#FAFBFF",
                      border: `1px solid #E0E7FF`,
                      borderRadius: T.radiusSm,
                      padding: "12px 16px",
                    }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        답변 내용
                      </div>
                      <div style={{ fontSize: 13, color: T.text, lineHeight: 1.7 }}>
                        {preview ? `${preview}${response.length > 120 ? "..." : ""}` : "(답변 없음)"}
                      </div>
                      {reliability != null && (
                        <div style={{ marginTop: 8, display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: T.success, fontWeight: 600 }}>
                          ✅ 신뢰도 {(reliability * 100).toFixed(0)}%
                        </div>
                      )}
                    </div>

                    {/* 종합 음성 점수 바 */}
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: T.textSub }}>종합 음성 점수</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: overallColor }}>{overallVoiceScore}점</span>
                      </div>
                      <div style={{ height: 10, background: "#F1F5F9", borderRadius: 999, overflow: "hidden" }}>
                        <div style={{
                          height: "100%",
                          width: `${overallVoiceScore}%`,
                          background: `linear-gradient(90deg,${overallColor}99,${overallColor})`,
                          borderRadius: 999,
                          transition: "width .6s ease",
                        }} />
                      </div>
                    </div>

                    {/* 음성 점수 세부 */}
                    <div style={{
                      background: "#F8FAFC",
                      borderRadius: T.radiusSm,
                      border: `1px solid ${T.border}`,
                      padding: "16px",
                    }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: T.textSub, marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}>
                        🎧 음성 세부 점수
                      </div>

                      {/* 세로 바 차트 */}
                      <div style={{ display: "flex", gap: 16, justifyContent: "center", marginBottom: 14 }}>
                        <VerticalBar label="자신감"  value={confidenceScore} />
                        <VerticalBar label="유창성"  value={fluencyScore} />
                        <VerticalBar label="안정감"  value={100 - tremorRiskScore} />
                      </div>

                      {/* 플래그 */}
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                          🚩 감지된 플래그
                        </div>
                        {flagItems.length ? (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                            {flagItems.map((it) => (
                              <FlagChip key={it.code} it={it} />
                            ))}
                          </div>
                        ) : (
                          <span style={{ fontSize: 12, color: T.textMuted }}>플래그 없음</span>
                        )}
                      </div>
                    </div>

                    {/* 오디오 플레이어 */}
                    {t?.audio?.audioUrl && (
                      <div style={{ background: "#F0F9FF", borderRadius: T.radiusSm, border: `1px solid #BAE6FD`, padding: "12px 14px" }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: "#0369A1", marginBottom: 8 }}>🎵 답변 오디오</div>
                        <audio controls style={{ width: "100%", height: 36, borderRadius: 8 }} src={t.audio.audioUrl} />
                      </div>
                    )}

                    {/* 답변 피드백 */}
                    {hasFeedbackSection && (
                      <div style={{ background: "#FFFBEB", border: `1px solid #FDE68A`, borderRadius: T.radiusSm, padding: "16px" }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#92400E", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                          💬 답변 피드백
                        </div>

                        {/* 한줄평 */}
                        {oneLineFeedback && (
                          <div style={{ background: "#FEF3C7", borderRadius: 8, padding: "10px 14px", marginBottom: 10, fontSize: 13, color: "#78350F", lineHeight: 1.6, fontStyle: "italic" }}>
                            "{oneLineFeedback}"
                          </div>
                        )}

                        {/* 강점 */}
                        {feedbackStrength && (
                          <FeedbackBlock emoji="💪" label="강점" text={feedbackStrength} color={{ bg: "#F0FDF4", border: "#BBF7D0", label: "#166534", text: "#15803D" }} />
                        )}

                        {/* 보완점 */}
                        {feedbackWeakness && (
                          <FeedbackBlock emoji="🔧" label="보완점" text={feedbackWeakness} color={{ bg: "#FFF1F2", border: "#FECDD3", label: "#9F1239", text: "#BE123C" }} />
                        )}

                        {/* 상세 피드백 (강점/보완점 없을 때) */}
                        {fullFeedback && !feedbackStrength && !feedbackWeakness && (
                          <FeedbackBlock emoji="📄" label="상세 피드백" text={fullFeedback} color={{ bg: "#EFF6FF", border: "#BFDBFE", label: "#1E40AF", text: "#1D4ED8" }} />
                        )}

                        {/* 키워드 */}
                        {keywords.length > 0 && (
                          <div style={{ marginTop: 12 }}>
                            <div style={{ fontSize: 11, fontWeight: 600, color: "#78350F", marginBottom: 6 }}>🏷️ 키워드</div>
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                              {keywords.map((kw, i) => (
                                <span key={`${kw}-${i}`} style={{
                                  fontSize: 12, fontWeight: 600,
                                  background: "#EDE9FE", color: "#5B21B6",
                                  borderRadius: 20, padding: "3px 10px",
                                  border: "1px solid #DDD6FE",
                                }}>
                                  {kw}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 긍정도 */}
                        {sentimentScore != null && (
                          <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 11, fontWeight: 600, color: "#78350F" }}>😊 긍정도</span>
                            <div style={{ flex: 1, height: 6, background: "#FDE68A", borderRadius: 999, overflow: "hidden" }}>
                              <div style={{
                                height: "100%", width: `${sentimentScore}%`,
                                background: "linear-gradient(90deg,#FBBF24,#F59E0B)",
                                borderRadius: 999,
                              }} />
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 700, color: "#B45309", width: 36, textAlign: "right" }}>
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

function FeedbackBlock({ emoji, label, text, color }) {
  return (
    <div style={{
      background: color.bg,
      border: `1px solid ${color.border}`,
      borderRadius: 8,
      padding: "10px 14px",
      marginBottom: 8,
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: color.label, marginBottom: 4 }}>
        {emoji} {label}
      </div>
      <div style={{ fontSize: 13, color: color.text, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
        {text}
      </div>
    </div>
  );
}

function FlagChip({ it }) {
  const style = {
    danger:  { bg: "#FFF1F2", color: "#BE123C", border: "#FECDD3" },
    warning: { bg: "#FFFBEB", color: "#B45309", border: "#FDE68A" },
    info:    { bg: "#EFF6FF", color: "#1D4ED8", border: "#BFDBFE" },
  }[it.severity] ?? { bg: "#F8FAFC", color: T.textSub, border: T.border };

  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      fontSize: 11, fontWeight: 600,
      background: style.bg,
      color: style.color,
      border: `1px solid ${style.border}`,
      borderRadius: 20,
      padding: "4px 10px",
    }}>
      <span style={{
        background: style.color,
        color: "#fff",
        borderRadius: 4,
        padding: "0px 5px",
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.3px",
      }}>
        {it.code}
      </span>
      {it.message}
    </span>
  );
}

function VerticalBar({ label, value }) {
  const v     = clamp100(value);
  const color = getScoreColor(v);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 56 }}>
      {/* 바 컨테이너 */}
      <div style={{
        width: 28, height: 80,
        background: "#EEF2FF",
        borderRadius: 6,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        marginBottom: 4,
      }}>
        <div style={{
          width: "100%",
          height: `${v}%`,
          background: `linear-gradient(180deg, ${color}99 0%, ${color} 100%)`,
          borderRadius: 4,
          transition: "height .6s ease",
        }} />
      </div>
      <div style={{ fontSize: 12, fontWeight: 700, color }}>{v}</div>
      <div style={{ fontSize: 10, color: T.textMuted, textAlign: "center", marginTop: 2 }}>{label}</div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   유틸
───────────────────────────────────────────── */

function normalizeFlags(codeList = [], rawFlags = []) {
  const rawMap = new Map();
  rawFlags.forEach((f) => { if (f) rawMap.set(f.code, f.message); });
  return (codeList || []).map((code) => ({
    code,
    message:  rawMap.get(code) || flagCodeToKorean(code),
    severity: flagSeverity(code),
  }));
}

function flagSeverity(code) {
  if (new Set(["JITTER_HIGH","SHIMMER_HIGH","PITCH_UNSTABLE"]).has(code)) return "danger";
  if (new Set(["SILENCE_HIGH","LOW_SAMPLE","PY_METRIC_MISSING"]).has(code)) return "warning";
  return "info";
}

function flagCodeToKorean(code) {
  const map = {
    JITTER_HIGH:        "발성이 미세하게 흔들리는 경향이 있어요.",
    SHIMMER_HIGH:       "볼륨 안정성이 떨어져 떨림처럼 들릴 수 있어요.",
    PITCH_UNSTABLE:     "음높이 변동이 커서 긴장된 인상을 줄 수 있어요.",
    SILENCE_HIGH:       "말 사이 멈춤이 잦아 불안하게 들릴 수 있어요.",
    LOW_SAMPLE:         "분석 구간이 짧아 점수 신뢰도가 낮을 수 있어요.",
    PY_METRIC_MISSING:  "일부 음성 지표가 누락되었습니다.",
  };
  return map[code] || code;
}
