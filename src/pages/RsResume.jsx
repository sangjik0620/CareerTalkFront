import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { api } from "../lib/api";

// 백엔드 응답 키 매핑:
// overallScore, summaryDetail, detailedEvaluation, strengths, weaknesses,
// improvements, expectedQuestionsJson[{ q, intent }]
// detailedEvaluation: { jobFitScore, experienceScore, skillScore, growthScore, completenessScore }
//   각 항목: { score, evaluation }

const EVAL_LABELS = {
  jobFitScore:        "직무 적합성",
  experienceScore:    "경력 및 경험의 구체성",
  skillScore:         "기술 / 역량 경쟁력",
  growthScore:        "성장 가능성 및 발전 잠재력",
  completenessScore:  "종합 완성도 및 논리성",
};

export default function RsResume() {
  const { analysisId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const passedResult = location.state?.analysisData;

  const mock = useMemo(
    () => ({
      analysisId: analysisId ?? "mock-1",
      resumeId: 1,
      targetJob: "IT개발∙데이터",
      detailedPosition: "백엔드 개발자 3년차",
      overallScore: 78,
      summaryDetail:
        "지원 직무와의 적합성은 양호하나 일부 경력의 성과 구체성이 부족합니다. 기술 스택은 적절하나 숙련도 표현을 더 구체화할 필요가 있습니다.",
      detailedEvaluation: {
        jobFitScore:       { score: 16, evaluation: "직무와 관련된 경험이 있으나 직접적 연관성은 일부 제한적입니다." },
        experienceScore:   { score: 14, evaluation: "업무 내용은 기술되어 있으나 성과 수치가 부족합니다." },
        skillScore:        { score: 15, evaluation: "기술 스택은 적절하나 숙련도 표현이 구체적이지 않습니다." },
        growthScore:       { score: 16, evaluation: "교육 및 자기계발 이력이 존재하여 성장 가능성은 보입니다." },
        completenessScore: { score: 17, evaluation: "구조는 정돈되어 있으나 일부 항목이 간략합니다." },
      },
      strengths:    ["직무 관련 경험 보유", "기본적인 기술 역량 확보", "이력서 구조가 체계적임"],
      weaknesses:   ["성과 수치화 부족", "경력 기술이 다소 추상적임"],
      improvements: ["프로젝트 및 업무 성과를 수치화하여 작성", "기술 숙련도를 구체적 사례와 함께 명시"],
      expectedQuestionsJson: [
        { q: "이전 프로젝트에서 가장 어려웠던 문제와 해결 과정을 설명해 주세요.", intent: "문제 해결 능력과 실무 경험의 깊이를 확인하기 위함" },
        { q: "지원 직무에서 본인이 가장 자신 있는 기술은 무엇이며 실제 적용 사례는 무엇인가요?", intent: "직무 적합성과 기술 활용 능력을 검증하기 위함" },
        { q: "향후 3년간의 커리어 목표는 무엇인가요?", intent: "성장 가능성과 직무 지속성을 평가하기 위함" },
      ],
      createdAt: "2026-03-03 12:30",
    }),
    [analysisId],
  );

  const [data, setData]     = useState(null);
  const [toast, setToast]   = useState("");
  const [isReanalyzing, setIsReanalyzing] = useState(false);

  // 데이터 세팅: state 우선 → localStorage → mock
  useEffect(() => {
    if (passedResult) {
      setData(passedResult);
      return;
    }
    const raw = localStorage.getItem("rs_result");
    if (raw) {
      try { setData(JSON.parse(raw)); return; } catch { /* ignore */ }
    }
    setData(mock);
  }, [passedResult, mock]);

  // 새로고침 대비 저장
  useEffect(() => {
    if (passedResult) {
      localStorage.setItem("rs_result", JSON.stringify(passedResult));
    }
  }, [passedResult]);

  if (!data) return null;

  const evalEntries = data.detailedEvaluation
    ? Object.entries(data.detailedEvaluation)
    : [];

  // 재분석 요청
  const handleReanalyze = async () => {
    if (!data.resumeId || isReanalyzing) return;
    setIsReanalyzing(true);
    setToast("재분석을 요청하고 있습니다...");
    try {
      const response = await api.post(`/api/resumes/${data.resumeId}/reanalyze`);
      const result = response.data;
      localStorage.setItem("rs_result", JSON.stringify(result));
      setData(result);
      showToast("재분석 완료!");
    } catch (e) {
      console.error(e);
      showToast("재분석에 실패했어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsReanalyzing(false);
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2000);
  };

  return (
    <div style={pageStyle}>
      {/* 상단 바 */}
      <div style={topBarStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button style={btnGhost} onClick={() => navigate(-1)}>
            ← 뒤로
          </button>
          <div>
            <div style={topTitleStyle}>이력서 분석 결과</div>
            <div style={topSubStyle}>
              분석 ID: {data.analysisId}
              {data.targetJob && ` · ${data.targetJob}`}
              {data.detailedPosition && ` / ${data.detailedPosition}`}
              {data.createdAt && ` · ${data.createdAt}`}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={scorePillStyle}>
            <span style={{ opacity: 0.75, marginRight: 8 }}>TOTAL</span>
            <span style={{ fontWeight: 900 }}>{data.overallScore}</span>
          </div>
          <button style={btnPrimary} onClick={() => navigate("/")}>
            홈으로
          </button>
        </div>
      </div>

      {/* 메인 그리드 */}
      <div style={mainGridStyle}>

        {/* 왼쪽: 항목별 상세 평가 */}
        <div style={wordShellStyle}>
          {/* 헤더 */}
          <div style={wordHeaderStyle}>
            <div style={docBadgeStyle}>RS</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={docTitleStyle}>항목별 상세 평가</div>
              <div style={docMetaStyle}>
                5개 항목 · 각 20점 만점 · 총점 {data.overallScore}점
              </div>
            </div>
            <button
              style={isReanalyzing ? { ...btnOutline, opacity: 0.6 } : btnOutline}
              onClick={handleReanalyze}
              disabled={isReanalyzing}
            >
              {isReanalyzing ? "재분석 중..." : "재분석"}
            </button>
          </div>

          {/* 항목 카드 목록 */}
          <div style={evalListStyle}>
            {evalEntries.map(([key, val]) => (
              <EvalCard
                key={key}
                label={EVAL_LABELS[key] ?? key}
                score={val.score}
                evaluation={val.evaluation}
              />
            ))}

            {/* 총평 카드 */}
            {data.summaryDetail && (
              <div style={summaryCardStyle}>
                <div style={summaryTitleStyle}>📋 종합 총평</div>
                <div style={summaryTextStyle}>{data.summaryDetail}</div>
              </div>
            )}
          </div>
        </div>

        {/* 오른쪽: 피드백 패널 */}
        <div style={sidePanelStyle}>
          <div style={panelHeaderStyle}>
            <div style={{ fontWeight: 900, color: "#0b1b3a" }}>AI 피드백</div>
            <div style={panelHintStyle}>강점 · 약점 · 개선방안을 요약해요</div>
          </div>

          <div style={panelBodyStyle}>
            {/* 점수 원형 */}
            <div style={scoreCardStyle}>
              <div style={scoreCircleStyle}>
                <div style={{ fontSize: 12, opacity: 0.85 }}>TOTAL</div>
                <div style={{ fontSize: 28, fontWeight: 900, lineHeight: 1 }}>
                  {data.overallScore}
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 900, color: "#0b1b3a", marginBottom: 8 }}>
                  점수 요약
                </div>
                {evalEntries.map(([key, val]) => (
                  <div key={key} style={miniRowStyle}>
                    <span style={miniLabelStyle}>{EVAL_LABELS[key] ?? key}</span>
                    <span style={miniValueStyle}>{val.score} / 20</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 강점 */}
            {data.strengths?.length > 0 && (
              <ListCard title="💪 강점" items={data.strengths} color="#16a34a" bgColor="#f0fdf4" borderColor="#bbf7d0" />
            )}

            {/* 약점 */}
            {data.weaknesses?.length > 0 && (
              <ListCard title="⚠️ 약점" items={data.weaknesses} color="#dc2626" bgColor="#fef2f2" borderColor="#fecaca" />
            )}

            {/* 개선방안 */}
            {data.improvements?.length > 0 && (
              <ListCard title="🔧 개선방안" items={data.improvements} color="#1f55ff" bgColor="#f4f8ff" borderColor="#bfdbfe" />
            )}

            <div style={panelDividerStyle} />

            <button
              style={isReanalyzing ? { ...btnPrimary, opacity: 0.6, width: "100%" } : { ...btnPrimary, width: "100%" }}
              onClick={handleReanalyze}
              disabled={isReanalyzing}
            >
              {isReanalyzing ? "재분석 중..." : "재분석하기"}
            </button>
          </div>
        </div>
      </div>

      {/* 하단: 예상 면접 질문 */}
      <div style={bottomStyle}>
        <div style={bottomHeaderStyle}>
          <div style={{ fontWeight: 900, color: "#0b1b3a" }}>
            예상 면접 질문 ({data.expectedQuestionsJson?.length ?? 0})
          </div>
          <div style={panelHintStyle}>이력서 분석 결과 기반으로 생성된 질문이에요</div>
        </div>

        <div style={questionGridStyle}>
          {(data.expectedQuestionsJson || []).map((item, idx) => (
            <div key={idx} style={questionCardStyle}>
              <div style={qIndexStyle}>Q{idx + 1}</div>
              <div>
                <div style={qTextStyle}>{item.q}</div>
                {item.intent && (
                  <div style={qIntentStyle}>💡 {item.intent}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Toast */}
      {toast && <div style={toastStyle}>{toast}</div>}
    </div>
  );
}

/* ===== 서브 컴포넌트 ===== */

function EvalCard({ label, score, evaluation }) {
  const pct = Math.min((score / 20) * 100, 100);
  const barColor = pct >= 75 ? "#16a34a" : pct >= 50 ? "#1f55ff" : "#dc2626";

  return (
    <div style={evalCardStyle}>
      <div style={evalCardHeaderStyle}>
        <div style={evalLabelStyle}>{label}</div>
        <div style={{ ...evalScoreStyle, color: barColor }}>
          {score} <span style={{ fontSize: 12, opacity: 0.65 }}>/ 20</span>
        </div>
      </div>

      {/* 점수 바 */}
      <div style={barTrackStyle}>
        <div style={{ ...barFillStyle, width: `${pct}%`, background: barColor }} />
      </div>

      <div style={evalTextStyle}>{evaluation}</div>
    </div>
  );
}

function ListCard({ title, items, color, bgColor, borderColor }) {
  return (
    <div style={{ ...listCardStyle, background: bgColor, borderColor }}>
      <div style={{ ...listTitleStyle, color }}>{title}</div>
      <ul style={listUlStyle}>
        {items.map((item, i) => (
          <li key={i} style={{ ...listItemStyle, color }}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ===== 스타일 ===== */

const pageStyle = {
  minHeight: "100vh",
  background: "#f4f8ff",
  padding: 24,
};

const topBarStyle = {
  maxWidth: 1200,
  margin: "0 auto 16px",
  padding: "14px 16px",
  background: "#ffffff",
  borderRadius: 16,
  border: "1px solid rgba(15, 60, 160, 0.10)",
  boxShadow: "0 12px 34px rgba(10, 30, 80, 0.08)",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
};

const topTitleStyle = { fontSize: 16, fontWeight: 900, color: "#0b1b3a" };
const topSubStyle   = { fontSize: 12, color: "rgba(11,27,58,0.65)", marginTop: 2 };

const scorePillStyle = {
  padding: "10px 14px",
  borderRadius: 999,
  border: "1px solid rgba(31,85,255,0.25)",
  background: "linear-gradient(180deg, #ffffff 0%, #f6f9ff 100%)",
  color: "#1f55ff",
  fontSize: 13,
};

const mainGridStyle = {
  maxWidth: 1200,
  margin: "0 auto",
  display: "grid",
  gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)",
  gap: 16,
  alignItems: "start",
};

const wordShellStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
};

const wordHeaderStyle = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: "12px 14px",
  background: "#ffffff",
  borderRadius: 16,
  border: "1px solid rgba(15, 60, 160, 0.10)",
  boxShadow: "0 10px 26px rgba(10,30,80,0.06)",
};

const docBadgeStyle = {
  width: 44,
  height: 44,
  borderRadius: 12,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 900,
  color: "#1f55ff",
  border: "1px solid rgba(31,85,255,0.25)",
  background: "#f4f8ff",
};

const docTitleStyle = { fontSize: 15, fontWeight: 900, color: "#0b1b3a" };
const docMetaStyle  = { fontSize: 12, color: "rgba(11,27,58,0.65)", marginTop: 2 };

const evalListStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
};

const evalCardStyle = {
  background: "#ffffff",
  borderRadius: 16,
  border: "1px solid rgba(15, 60, 160, 0.10)",
  boxShadow: "0 10px 26px rgba(10,30,80,0.06)",
  padding: "16px 18px",
};

const evalCardHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 10,
};

const evalLabelStyle = { fontSize: 14, fontWeight: 900, color: "#0b1b3a" };
const evalScoreStyle = { fontSize: 18, fontWeight: 900 };
const evalTextStyle  = { fontSize: 13, color: "rgba(11,27,58,0.75)", lineHeight: 1.6, marginTop: 10 };

const barTrackStyle = {
  height: 6,
  borderRadius: 999,
  background: "rgba(15,60,160,0.10)",
  overflow: "hidden",
};

const barFillStyle = {
  height: "100%",
  borderRadius: 999,
  transition: "width 0.5s ease",
};

const summaryCardStyle = {
  background: "linear-gradient(180deg, #f4f8ff 0%, #ffffff 100%)",
  borderRadius: 16,
  border: "1px solid rgba(31,85,255,0.15)",
  padding: "16px 18px",
};

const summaryTitleStyle = { fontSize: 14, fontWeight: 900, color: "#0b1b3a", marginBottom: 8 };
const summaryTextStyle  = { fontSize: 13, color: "rgba(11,27,58,0.78)", lineHeight: 1.7 };

const sidePanelStyle = {
  background: "#ffffff",
  borderRadius: 16,
  border: "1px solid rgba(15, 60, 160, 0.10)",
  boxShadow: "0 12px 34px rgba(10, 30, 80, 0.08)",
  overflow: "hidden",
  position: "sticky",
  top: 18,
  alignSelf: "start",
};

const panelHeaderStyle = {
  padding: "14px 14px",
  borderBottom: "1px solid rgba(15, 60, 160, 0.08)",
  background: "linear-gradient(180deg, rgba(245,250,255,1) 0%, rgba(255,255,255,1) 60%)",
};

const panelHintStyle = { fontSize: 12, color: "rgba(11,27,58,0.65)", marginTop: 4 };

const panelBodyStyle = {
  padding: 14,
  display: "flex",
  flexDirection: "column",
  gap: 10,
};

const panelDividerStyle = {
  height: 1,
  background: "rgba(15, 60, 160, 0.08)",
  margin: "6px 0",
};

const scoreCardStyle = {
  border: "1px solid rgba(15, 60, 160, 0.12)",
  borderRadius: 16,
  padding: 12,
  background: "linear-gradient(180deg, #ffffff 0%, #f6f9ff 100%)",
  display: "flex",
  gap: 12,
  alignItems: "flex-start",
};

const scoreCircleStyle = {
  width: 78,
  height: 78,
  borderRadius: 18,
  background: "#1f55ff",
  color: "#fff",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 16px 30px rgba(31,85,255,0.25)",
  flex: "0 0 auto",
};

const miniRowStyle  = { display: "flex", justifyContent: "space-between", marginTop: 5, gap: 8 };
const miniLabelStyle = { fontSize: 11, color: "rgba(11,27,58,0.65)" };
const miniValueStyle = { fontSize: 11, fontWeight: 900, color: "#0b1b3a", whiteSpace: "nowrap" };

const listCardStyle = {
  borderRadius: 12,
  border: "1px solid",
  padding: "12px 14px",
};

const listTitleStyle = { fontSize: 13, fontWeight: 900, marginBottom: 8 };
const listUlStyle   = { margin: 0, paddingLeft: 18 };
const listItemStyle = { fontSize: 12, lineHeight: 1.7 };

const bottomStyle = {
  maxWidth: 1200,
  margin: "16px auto 0",
  background: "#ffffff",
  borderRadius: 16,
  border: "1px solid rgba(15, 60, 160, 0.10)",
  boxShadow: "0 12px 34px rgba(10, 30, 80, 0.08)",
  overflow: "hidden",
};

const bottomHeaderStyle = {
  padding: "14px 14px",
  borderBottom: "1px solid rgba(15, 60, 160, 0.08)",
  background: "linear-gradient(180deg, rgba(245,250,255,1) 0%, rgba(255,255,255,1) 60%)",
};

const questionGridStyle = {
  padding: 14,
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 12,
};

const questionCardStyle = {
  border: "1px solid rgba(15, 60, 160, 0.12)",
  borderRadius: 16,
  padding: 14,
  background: "linear-gradient(180deg, #ffffff 0%, #f6f9ff 100%)",
  boxShadow: "0 10px 26px rgba(10, 30, 80, 0.06)",
  display: "flex",
  gap: 12,
  alignItems: "flex-start",
};

const qIndexStyle = {
  width: 40,
  height: 40,
  borderRadius: 12,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 900,
  color: "#1f55ff",
  border: "1px solid rgba(31,85,255,0.25)",
  background: "#ffffff",
  flex: "0 0 auto",
};

const qTextStyle   = { fontSize: 13, color: "#0b1b3a", lineHeight: 1.5, fontWeight: 700 };
const qIntentStyle = { fontSize: 11, color: "rgba(11,27,58,0.60)", marginTop: 6, lineHeight: 1.5 };

const btnBase = {
  padding: "10px 14px",
  borderRadius: 999,
  fontSize: 13,
  fontWeight: 800,
  cursor: "pointer",
  transition: "all 0.15s ease",
  border: "none",
};

const btnPrimary = {
  ...btnBase,
  background: "#1f55ff",
  color: "#fff",
  border: "1px solid #1f55ff",
  boxShadow: "0 10px 22px rgba(31,85,255,0.25)",
};

const btnOutline = {
  ...btnBase,
  background: "#fff",
  color: "#1f55ff",
  border: "1px solid rgba(31,85,255,0.35)",
};

const btnGhost = {
  ...btnBase,
  background: "#fff",
  color: "#0b1b3a",
  border: "1px solid rgba(15, 60, 160, 0.15)",
};

const toastStyle = {
  position: "fixed",
  left: "50%",
  bottom: 20,
  transform: "translateX(-50%)",
  padding: "10px 14px",
  borderRadius: 999,
  background: "rgba(11,27,58,0.92)",
  color: "#fff",
  fontSize: 13,
  fontWeight: 800,
  boxShadow: "0 14px 30px rgba(0,0,0,0.20)",
  zIndex: 9999,
};