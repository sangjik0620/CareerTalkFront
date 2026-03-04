import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { api } from "../lib/api";

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

  const [data, setData]       = useState(passedResult || null);
  const [isLoading, setIsLoading] = useState(!passedResult);

  // state로 넘어온 데이터가 없으면 API로 조회
  useEffect(() => {
    if (passedResult) return;

    const fetchResult = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`/api/resumes/${analysisId}/result`);
        setData(response.data);
      } catch (e) {
        console.error("분석 결과 조회 실패:", e);
        alert("분석 결과를 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    if (analysisId) fetchResult();
  }, [analysisId, passedResult]);

  // 로딩 화면
  if (isLoading) {
    return (
      <div style={{ ...pageStyle, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div style={{ width: 48, height: 48, border: "4px solid #1f55ff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", marginBottom: 16 }} />
        <p style={{ color: "#0b1b3a", fontWeight: 900 }}>분석 결과를 불러오는 중입니다...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // 데이터 없음
  if (!data) {
    return (
      <div style={{ ...pageStyle, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <span style={{ fontSize: 48, marginBottom: 16 }}>😮</span>
        <p style={{ color: "#0b1b3a", fontWeight: 900 }}>분석 결과가 없습니다.</p>
        <button style={{ ...btnPrimary, marginTop: 20 }} onClick={() => navigate("/")}>홈으로 이동</button>
      </div>
    );
  }

  const evalEntries = data.detailedEvaluation
    ? Object.entries(data.detailedEvaluation)
    : [];

  return (
    <div style={pageStyle}>
      {/* 상단 바 */}
      <div style={topBarStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button style={btnGhost} onClick={() => navigate(-1)}>← 뒤로</button>
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
          <button style={btnPrimary} onClick={() => navigate("/")}>홈으로</button>
        </div>
      </div>

      {/* 메인 그리드 */}
      <div style={mainGridStyle}>

        {/* 왼쪽: 항목별 상세 평가 */}
        <div style={wordShellStyle}>
          <div style={wordHeaderStyle}>
            <div style={docBadgeStyle}>RS</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={docTitleStyle}>항목별 상세 평가</div>
              <div style={docMetaStyle}>5개 항목 · 각 20점 만점 · 총점 {data.overallScore}점</div>
            </div>
          </div>

          <div style={evalListStyle}>
            {evalEntries.map(([key, val]) => (
              <EvalCard
                key={key}
                label={EVAL_LABELS[key] ?? key}
                score={val.score}
                evaluation={val.evaluation}
              />
            ))}

            {/* 종합 총평 */}
            {data.summaryDetail && (
              <div style={summaryCardStyle}>
                <div style={summaryTitleStyle}>📋 종합 총평</div>
                <div style={summaryTextStyle}>{data.summaryDetail}</div>
              </div>
            )}
          </div>
        </div>

        {/* 오른쪽: AI 피드백 패널 */}
        <div style={sidePanelStyle}>
          <div style={panelHeaderStyle}>
            <div style={{ fontWeight: 900, color: "#0b1b3a" }}>AI 피드백</div>
            <div style={panelHintStyle}>강점 · 약점 · 개선방안을 요약해요</div>
          </div>

          <div style={panelBodyStyle}>
            {/* 점수 요약 */}
            <div style={scoreCardStyle}>
              <div style={scoreCircleStyle}>
                <div style={{ fontSize: 12, opacity: 0.85 }}>TOTAL</div>
                <div style={{ fontSize: 28, fontWeight: 900, lineHeight: 1 }}>{data.overallScore}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 900, color: "#0b1b3a", marginBottom: 8 }}>점수 요약</div>
                {evalEntries.map(([key, val]) => (
                  <div key={key} style={miniRowStyle}>
                    <span style={miniLabelStyle}>{EVAL_LABELS[key] ?? key}</span>
                    <span style={miniValueStyle}>{val.score} / 20</span>
                  </div>
                ))}
              </div>
            </div>

            {data.strengths?.length > 0 && (
              <ListCard title="💪 강점" items={data.strengths} color="#16a34a" bgColor="#f0fdf4" borderColor="#bbf7d0" />
            )}
            {data.weaknesses?.length > 0 && (
              <ListCard title="⚠️ 약점" items={data.weaknesses} color="#dc2626" bgColor="#fef2f2" borderColor="#fecaca" />
            )}
            {data.improvements?.length > 0 && (
              <ListCard title="🔧 개선방안" items={data.improvements} color="#1f55ff" bgColor="#f4f8ff" borderColor="#bfdbfe" />
            )}

            <div style={panelDividerStyle} />

            <button
              style={{ ...btnPrimary, width: "100%" }}
              onClick={() => navigate("/interview/select")}
            >
              면접 진행하기 ➔
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
                {item.intent && <div style={qIntentStyle}>💡 {item.intent}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
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
          <li key={i} style={{ ...listItemStyle, color }}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

/* ===== 스타일 (기존과 동일) ===== */

const pageStyle = { minHeight: "100vh", background: "#f4f8ff", padding: 24 };
const topBarStyle = { maxWidth: 1200, margin: "0 auto 16px", padding: "14px 16px", background: "#ffffff", borderRadius: 16, border: "1px solid rgba(15,60,160,0.10)", boxShadow: "0 12px 34px rgba(10,30,80,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 };
const topTitleStyle = { fontSize: 16, fontWeight: 900, color: "#0b1b3a" };
const topSubStyle   = { fontSize: 12, color: "rgba(11,27,58,0.65)", marginTop: 2 };
const scorePillStyle = { padding: "10px 14px", borderRadius: 999, border: "1px solid rgba(31,85,255,0.25)", background: "linear-gradient(180deg,#ffffff 0%,#f6f9ff 100%)", color: "#1f55ff", fontSize: 13 };
const mainGridStyle = { maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "minmax(0,2fr) minmax(0,1fr)", gap: 16, alignItems: "start" };
const wordShellStyle = { display: "flex", flexDirection: "column", gap: 12 };
const wordHeaderStyle = { display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "#ffffff", borderRadius: 16, border: "1px solid rgba(15,60,160,0.10)", boxShadow: "0 10px 26px rgba(10,30,80,0.06)" };
const docBadgeStyle = { width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "#1f55ff", border: "1px solid rgba(31,85,255,0.25)", background: "#f4f8ff" };
const docTitleStyle = { fontSize: 15, fontWeight: 900, color: "#0b1b3a" };
const docMetaStyle  = { fontSize: 12, color: "rgba(11,27,58,0.65)", marginTop: 2 };
const evalListStyle = { display: "flex", flexDirection: "column", gap: 12 };
const evalCardStyle = { background: "#ffffff", borderRadius: 16, border: "1px solid rgba(15,60,160,0.10)", boxShadow: "0 10px 26px rgba(10,30,80,0.06)", padding: "16px 18px" };
const evalCardHeaderStyle = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 };
const evalLabelStyle = { fontSize: 14, fontWeight: 900, color: "#0b1b3a" };
const evalScoreStyle = { fontSize: 18, fontWeight: 900 };
const evalTextStyle  = { fontSize: 13, color: "rgba(11,27,58,0.75)", lineHeight: 1.6, marginTop: 10 };
const barTrackStyle  = { height: 6, borderRadius: 999, background: "rgba(15,60,160,0.10)", overflow: "hidden" };
const barFillStyle   = { height: "100%", borderRadius: 999, transition: "width 0.5s ease" };
const summaryCardStyle = { background: "linear-gradient(180deg,#f4f8ff 0%,#ffffff 100%)", borderRadius: 16, border: "1px solid rgba(31,85,255,0.15)", padding: "16px 18px" };
const summaryTitleStyle = { fontSize: 14, fontWeight: 900, color: "#0b1b3a", marginBottom: 8 };
const summaryTextStyle  = { fontSize: 13, color: "rgba(11,27,58,0.78)", lineHeight: 1.7 };
const sidePanelStyle = { background: "#ffffff", borderRadius: 16, border: "1px solid rgba(15,60,160,0.10)", boxShadow: "0 12px 34px rgba(10,30,80,0.08)", overflow: "hidden", position: "sticky", top: 18, alignSelf: "start" };
const panelHeaderStyle = { padding: "14px 14px", borderBottom: "1px solid rgba(15,60,160,0.08)", background: "linear-gradient(180deg,rgba(245,250,255,1) 0%,rgba(255,255,255,1) 60%)" };
const panelHintStyle = { fontSize: 12, color: "rgba(11,27,58,0.65)", marginTop: 4 };
const panelBodyStyle = { padding: 14, display: "flex", flexDirection: "column", gap: 10 };
const panelDividerStyle = { height: 1, background: "rgba(15,60,160,0.08)", margin: "6px 0" };
const scoreCardStyle = { border: "1px solid rgba(15,60,160,0.12)", borderRadius: 16, padding: 12, background: "linear-gradient(180deg,#ffffff 0%,#f6f9ff 100%)", display: "flex", gap: 12, alignItems: "flex-start" };
const scoreCircleStyle = { width: 78, height: 78, borderRadius: 18, background: "#1f55ff", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: "0 16px 30px rgba(31,85,255,0.25)", flex: "0 0 auto" };
const miniRowStyle   = { display: "flex", justifyContent: "space-between", marginTop: 5, gap: 8 };
const miniLabelStyle = { fontSize: 11, color: "rgba(11,27,58,0.65)" };
const miniValueStyle = { fontSize: 11, fontWeight: 900, color: "#0b1b3a", whiteSpace: "nowrap" };
const listCardStyle  = { borderRadius: 12, border: "1px solid", padding: "12px 14px" };
const listTitleStyle = { fontSize: 13, fontWeight: 900, marginBottom: 8 };
const listUlStyle    = { margin: 0, paddingLeft: 18 };
const listItemStyle  = { fontSize: 12, lineHeight: 1.7 };
const bottomStyle = { maxWidth: 1200, margin: "16px auto 0", background: "#ffffff", borderRadius: 16, border: "1px solid rgba(15,60,160,0.10)", boxShadow: "0 12px 34px rgba(10,30,80,0.08)", overflow: "hidden" };
const bottomHeaderStyle = { padding: "14px 14px", borderBottom: "1px solid rgba(15,60,160,0.08)", background: "linear-gradient(180deg,rgba(245,250,255,1) 0%,rgba(255,255,255,1) 60%)" };
const questionGridStyle = { padding: 14, display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 12 };
const questionCardStyle = { border: "1px solid rgba(15,60,160,0.12)", borderRadius: 16, padding: 14, background: "linear-gradient(180deg,#ffffff 0%,#f6f9ff 100%)", boxShadow: "0 10px 26px rgba(10,30,80,0.06)", display: "flex", gap: 12, alignItems: "flex-start" };
const qIndexStyle = { width: 40, height: 40, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "#1f55ff", border: "1px solid rgba(31,85,255,0.25)", background: "#ffffff", flex: "0 0 auto" };
const qTextStyle   = { fontSize: 13, color: "#0b1b3a", lineHeight: 1.5, fontWeight: 700 };
const qIntentStyle = { fontSize: 11, color: "rgba(11,27,58,0.60)", marginTop: 6, lineHeight: 1.5 };
const btnBase = { padding: "10px 14px", borderRadius: 999, fontSize: 13, fontWeight: 800, cursor: "pointer", transition: "all 0.15s ease", border: "none" };
const btnPrimary = { ...btnBase, background: "#1f55ff", color: "#fff", border: "1px solid #1f55ff", boxShadow: "0 10px 22px rgba(31,85,255,0.25)" };
const btnGhost   = { ...btnBase, background: "#fff", color: "#0b1b3a", border: "1px solid rgba(15,60,160,0.15)" };