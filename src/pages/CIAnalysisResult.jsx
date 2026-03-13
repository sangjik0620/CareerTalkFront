import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

const API_BASE = import.meta?.env?.VITE_API_BASE || "http://localhost:8080";

export default function CIAnalysisResult() {
  const { analysisId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const passedResult = location.state?.result;

  const [data, setData] = useState(null);
  const [tab, setTab] = useState("ORIGINAL");
  const [rewrite, setRewrite] = useState("");
  const [rewriteNotes, setRewriteNotes] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState("");

  const ANALYSIS_DETAIL_URL = useMemo(
    () => `${API_BASE}/api/ci/result/${analysisId}`,
    [analysisId],
  );

  useEffect(() => {
    let ignore = false;

    const loadAnalysis = async () => {
      try {
        setIsLoading(true);

        if (passedResult) {
          if (!ignore) {
            setData(passedResult);
            setRewrite("");
            setRewriteNotes([]);
          }
          return;
        }

        const token =
          sessionStorage.getItem("token") || sessionStorage.getItem("accessToken");

        const response = await fetch(ANALYSIS_DETAIL_URL, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!response.ok) {
          throw new Error(`분석 결과 조회 실패: ${response.status}`);
        }

        const resData = await response.json();
        console.log("analysis detail response:", resData);

        const normalized = resData?.data ?? resData?.result ?? resData;

        if (!ignore) {
          setData(normalized);
          setRewrite("");
          setRewriteNotes([]);
        }
      } catch (error) {
        console.error("분석 결과 불러오기 실패:", error);
        if (!ignore) {
          setData(null);
          showToast("분석 결과를 불러오지 못했습니다.");
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    loadAnalysis();

    return () => {
      ignore = true;
    };
  }, [passedResult, ANALYSIS_DETAIL_URL]);

  const showToast = (message, delay = 1800) => {
    setToast(message);
    window.setTimeout(() => setToast(""), delay);
  };

  const normalizedQuestions = useMemo(() => {
  // 🔍 백엔드에서 올 수 있는 모든 질문 리스트 후보군을 다 확인합니다.
  const rawQuestions = data?.questions || data?.interviewQuestions || data?.qList || data?.qlist || [];
  
  if (!Array.isArray(rawQuestions) || rawQuestions.length === 0) return [];

  return rawQuestions.map((item, idx) => {
    // 질문 내용이 객체(item.q)인지, 문자열("질문")인지에 따라 대응
    const qText = typeof item === "string" ? item : (item?.q || item?.question || "");
    const intentText = item?.intent || (data?.questionIntents && data.questionIntents[idx]) || "";
    
    return {
      question: qText,
      intent: intentText,
    };
  });
}, [data]);

  const top3 = normalizedQuestions.slice(0, 3);

  const handleGenerateRewrite = async () => {
    if (isGenerating) return;

    try {
      setIsGenerating(true);
      setTab("REWRITE");
      setToast("");

      const token =
        sessionStorage.getItem("token") || sessionStorage.getItem("accessToken");

      const payload = {
        analysisId: Number(data?.analysisId ?? analysisId),
        jobRole: data?.jobRole ?? "",
        jobDetail: data?.jobDetail ?? "",
        title: data?.title ?? "",
        content: data?.content ?? "",
      };

      console.log("rewrite payload =", payload);

      const res = await fetch(`${API_BASE}/api/ci/rewrite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const raw = await res.text();
      console.log("rewrite response =", raw);

      if (!res.ok) {
        throw new Error(`개선본 생성 실패: ${res.status} / ${raw}`);
      }

      const result = JSON.parse(raw);

      setRewrite(result.rewrittenEssay ?? "");
      setRewriteNotes(result.changeSummary ?? []);
      showToast("AI 개선본 생성 완료!");
    } catch (e) {
      console.error("개선본 생성 실패:", e);
      showToast(e.message || "개선본 생성 중 오류가 발생했습니다.", 2200);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    const text = tab === "ORIGINAL" ? data?.content : rewrite;
    if (!text?.trim()) return;

    try {
      await navigator.clipboard.writeText(text);
      showToast("복사 완료!");
    } catch (error) {
      console.error("복사 실패:", error);
      showToast("복사 실패", 2200);
    }
  };

  if (isLoading) {
    return (
      <div style={pageStyle}>
        <div style={loadingCardStyle}>분석 결과를 불러오는 중입니다...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={pageStyle}>
        <div style={emptyCardStyle}>
          분석 결과 데이터가 없습니다. 분석 페이지에서 다시 실행해 주세요.
          <div style={{ marginTop: 16 }}>
            <button style={btnPrimary} onClick={() => navigate(-1)}>
              이전 페이지로
            </button>
          </div>
        </div>
      </div>
    );
  }

  const rule = data.ruleScore ?? 0;
  const llm = data.llmScore ?? 0;
  const total = data.totalScore ?? 0;

  return (
    <div style={pageStyle}>
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>

      <div style={topBarStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button style={btnGhost} onClick={() => navigate(-1)}>
            ← 뒤로
          </button>
          <div>
            <div style={topTitleStyle}>자기소개서 분석 결과</div>
            <div style={topSubStyle}>
              분석 ID: {data.analysisId || analysisId} · 업데이트:{" "}
              {data.updatedAt || "-"}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={scorePillStyle}>
            <span style={{ opacity: 0.75, marginRight: 8 }}>TOTAL</span>
            <span style={{ fontWeight: 900 }}>{total}</span>
          </div>
          <button style={btnPrimary} onClick={() => navigate("/")}>
            홈으로
          </button>
        </div>
      </div>

      <div style={mainGridStyle}>
        <div style={wordShellStyle}>
          <div style={wordHeaderStyle}>
            <div style={docBadgeStyle}>DOC</div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={docTitleStyle}>{data.title}</div>
              <div style={docMetaStyle}>
                구조 점수 {rule} · 내용 점수 {llm}
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button
                style={tab === "ORIGINAL" ? tabActiveStyle : tabStyle}
                onClick={() => setTab("ORIGINAL")}
              >
                원본
              </button>
              <button
                style={tab === "REWRITE" ? tabActiveStyle : tabStyle}
                onClick={() => setTab("REWRITE")}
                disabled={!rewrite && !isGenerating}
              >
                AI 개선본
              </button>

              <button style={btnOutline} onClick={handleCopy}>
                복사
              </button>
            </div>
          </div>

          <div style={wordPageStyle}>
            <div style={wordToolbarStyle}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={toolbarBadgeStyle}>
                  {tab === "ORIGINAL" ? "ORIGINAL" : "AI REWRITE"}
                </span>
              </div>

              <button
                style={btnPrimarySmall}
                onClick={handleGenerateRewrite}
                disabled={isGenerating}
              >
                {isGenerating ? "생성 중..." : "AI 개선본 생성"}
              </button>
            </div>

            <div style={essayBodyWrapStyle}>
              {tab === "REWRITE" && isGenerating ? (
                <div style={rewriteLoadingWrapStyle}>
                  <div style={spinnerStyle} />
                  <div style={rewriteLoadingTitleStyle}>AI가 개선본을 생성하고 있어요</div>
                </div>
              ) : (
                <pre style={essayTextStyle}>
                  {tab === "ORIGINAL"
                    ? (data.originalText || data.originalContent || data.essayContent || data.userContent || data.content || "데이터를 불러올 수 없습니다.")
                    : (rewrite || "아직 AI 개선본이 없어요. ‘AI 개선본 생성’을 눌러주세요.")}
                </pre>
              )}
            </div>
          </div>

          {tab === "REWRITE" && rewriteNotes?.length > 0 && (
            <div style={notesBoxStyle}>
              <div style={{ fontWeight: 900, color: "#0b1b3a" }}>
                변경 요약(추천 이유)
              </div>
              <ul style={notesListStyle}>
                {rewriteNotes.map((n, i) => (
                  <li key={i} style={notesItemStyle}>
                    {n}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div style={sidePanelStyle}>
          <div style={panelHeaderStyle}>
            <div style={{ fontWeight: 900, color: "#0b1b3a" }}>AI 피드백</div>
            <div style={panelHintStyle}>핵심 개선 포인트를 요약해요</div>
          </div>

          <div style={panelBodyStyle}>
            <ScoreCard total={total} rule={rule} llm={llm} />
            <FeedbackCard title="강점" text={data.strengths} />
            <FeedbackCard title="약점" text={data.weaknesses} />
            <FeedbackCard title="개선 방향" text={data.feedback} />
            <div style={panelDividerStyle} />
            <button
              style={btnPrimary}
              onClick={handleGenerateRewrite}
              disabled={isGenerating}
            >
              {isGenerating ? "AI 개선본 생성 중..." : "AI 개선본 생성하기"}
            </button>
          </div>
        </div>
      </div>

      <div style={bottomStyle}>
        <div style={bottomHeaderStyle}>
          <div style={{ fontWeight: 900, color: "#0b1b3a" }}>
            예상 면접 질문
          </div>
          <div style={panelHintStyle}>분석 결과 기반으로 생성된 질문이에요</div>
        </div>

        <div style={questionGridStyle}>
          {top3.length === 0 ? (
            <div style={{ gridColumn: "1 / -1", padding: 6, color: "#6b7280" }}>
              아직 생성된 질문이 없어요.
            </div>
          ) : (
            top3.map((item, idx) => (
              <QuestionCardTailwind
                key={idx}
                index={idx}
                question={item.question}
                intent={item.intent}
              />
            ))
          )}
        </div>
      </div>

      {toast && <div style={toastStyle}>{toast}</div>}
    </div>
  );
}

function ScoreCard({ total, rule, llm }) {
  return (
    <div style={scoreCardStyle}>
      <div style={scoreCircleStyle}>
        <div style={{ fontSize: 12, opacity: 0.85 }}>TOTAL</div>
        <div style={{ fontSize: 28, fontWeight: 900, lineHeight: 1 }}>
          {total}
        </div>
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 900, color: "#0b1b3a" }}>점수 요약</div>
        <div style={miniRowStyle}>
          <span style={miniLabelStyle}>구조 기반</span>
          <span style={miniValueStyle}>{rule}</span>
        </div>
        <div style={miniRowStyle}>
          <span style={miniLabelStyle}>내용 기반</span>
          <span style={miniValueStyle}>{llm}</span>
        </div>
      </div>
    </div>
  );
}

function FeedbackCard({ title, text }) {
  return (
    <div style={feedbackCardStyle}>
      <div style={feedbackTitleStyle}>{title}</div>
      <div style={feedbackTextStyle}>{text || "-"}</div>
    </div>
  );
}

function QuestionCardTailwind({ index, question, intent }) {
  const [isOpen, setIsOpen] = useState(false);
  if (!question) return null;

  return (
    <div className="border border-[#0F3CA01F] rounded-2xl bg-gradient-to-b from-white to-[#f6f9ff] shadow-[0_10px_26px_rgba(10,30,80,0.06)] overflow-hidden flex flex-col h-fit">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left py-4 px-5 flex gap-4 items-center hover:bg-white/50 transition-colors"
      >
        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-[#1f55ff] border border-[#1f55ff40] bg-white shrink-0 shadow-sm">
          Q{index + 1}
        </div>

        <div className="flex-1 min-w-0">
          <span className="text-[14px] text-[#0b1b3a] font-bold leading-snug break-keep">
            {question}
          </span>
        </div>

        <div className="shrink-0 text-gray-400 text-xs font-bold">
          {isOpen ? "▲" : "▼"}
        </div>
      </button>

      {isOpen && (
        <div className="px-5 pb-5 animate-fade-in-down">
          <div className="border-t border-[#0F3CA014] pt-3 mt-1">
            <span className="inline-block px-2 py-1 rounded bg-[#1f55ff1A] text-[#1f55ff] text-[11px] font-bold mb-1.5">
              질문 의도
            </span>
            <p className="text-[13px] text-[#0b1b3a]/80 leading-relaxed font-medium">
              {intent?.trim()
                ? intent
                : "(의도 데이터가 아직 없어요. 백엔드에서 intent를 내려주면 표시됩니다.)"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

const pageStyle = { minHeight: "100vh", background: "#f4f8ff", padding: 24 };

const loadingCardStyle = {
  maxWidth: 1200,
  margin: "40px auto",
  background: "#fff",
  borderRadius: 16,
  padding: 24,
  border: "1px solid rgba(15, 60, 160, 0.10)",
  boxShadow: "0 12px 34px rgba(10, 30, 80, 0.08)",
  color: "#0b1b3a",
};

const emptyCardStyle = {
  maxWidth: 1200,
  margin: "40px auto",
  background: "#fff",
  borderRadius: 16,
  padding: 24,
  border: "1px solid rgba(15, 60, 160, 0.10)",
  boxShadow: "0 12px 34px rgba(10, 30, 80, 0.08)",
  color: "#0b1b3a",
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

const topSubStyle = {
  fontSize: 12,
  color: "rgba(11,27,58,0.65)",
  marginTop: 2,
};

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
  minHeight: "calc(100vh - 140px)",
  alignItems: "stretch",
};

const wordShellStyle = {
  background: "transparent",
  borderRadius: 16,
  display: "flex",
  flexDirection: "column",
  height: "100%",
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
  marginBottom: 12,
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

const docMetaStyle = {
  fontSize: 12,
  color: "rgba(11,27,58,0.65)",
  marginTop: 2,
};

const tabStyle = {
  padding: "8px 12px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 900,
  cursor: "pointer",
  background: "#fff",
  color: "rgba(11,27,58,0.75)",
  border: "1px solid rgba(15, 60, 160, 0.16)",
};

const tabActiveStyle = {
  ...tabStyle,
  background: "linear-gradient(180deg, #ffffff 0%, #f6f9ff 100%)",
  color: "#1f55ff",
  border: "1px solid rgba(31,85,255,0.35)",
  boxShadow: "0 10px 22px rgba(31,85,255,0.12)",
};

const wordPageStyle = {
  background: "#ffffff",
  borderRadius: 16,
  border: "1px solid rgba(15, 60, 160, 0.10)",
  boxShadow: "0 18px 46px rgba(10,30,80,0.10)",
  overflow: "auto",
  flex: 1,
  minHeight: 0,
};

const wordToolbarStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 10,
  padding: "12px 14px",
  borderBottom: "1px solid rgba(15, 60, 160, 0.08)",
  background:
    "linear-gradient(180deg, rgba(245,250,255,1) 0%, rgba(255,255,255,1) 60%)",
};

const toolbarBadgeStyle = {
  padding: "6px 10px",
  borderRadius: 999,
  fontSize: 11,
  fontWeight: 900,
  color: "#1f55ff",
  border: "1px solid rgba(31,85,255,0.25)",
  background: "#fff",
};

const essayBodyWrapStyle = {
  minHeight: 420,
  display: "flex",
  alignItems: "stretch",
};

const essayTextStyle = {
  margin: 0,
  padding: "34px 42px",
  lineHeight: 1.9,
  fontSize: 15,
  color: "#0b1b3a",
  whiteSpace: "pre-wrap",
  width: "100%",
  fontFamily:
    'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", sans-serif',
};

const rewriteLoadingWrapStyle = {
  minHeight: 420,
  width: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "40px 24px",
  color: "#0b1b3a",
};

const rewriteLoadingTitleStyle = {
  marginTop: 16,
  fontSize: 18,
  fontWeight: 900,
  color: "#0b1b3a",
};

const rewriteLoadingDescStyle = {
  marginTop: 8,
  fontSize: 13,
  color: "rgba(11,27,58,0.65)",
  textAlign: "center",
  lineHeight: 1.6,
};

const spinnerStyle = {
  width: 42,
  height: 42,
  borderRadius: "50%",
  border: "4px solid rgba(31,85,255,0.16)",
  borderTop: "4px solid #1f55ff",
  animation: "spin 0.9s linear infinite",
};

const notesBoxStyle = {
  marginTop: 12,
  background: "#ffffff",
  borderRadius: 16,
  border: "1px solid rgba(15, 60, 160, 0.10)",
  boxShadow: "0 12px 34px rgba(10, 30, 80, 0.06)",
  padding: "12px 14px",
};

const notesListStyle = { margin: "8px 0 0", paddingLeft: 18 };

const notesItemStyle = {
  fontSize: 13,
  color: "rgba(11,27,58,0.78)",
  lineHeight: 1.6,
};

const sidePanelStyle = {
  background: "#ffffff",
  borderRadius: 16,
  border: "1px solid rgba(15, 60, 160, 0.10)",
  boxShadow: "0 12px 34px rgba(10, 30, 80, 0.08)",
  overflowY: "auto",
  overflowX: "hidden",
  position: "sticky",
  top: 18,
  alignSelf: "start",
  maxHeight: "calc(100vh - 140px)",
};

const panelHeaderStyle = {
  padding: "14px 14px",
  borderBottom: "1px solid rgba(15, 60, 160, 0.08)",
  background:
    "linear-gradient(180deg, rgba(245,250,255,1) 0%, rgba(255,255,255,1) 60%)",
};

const panelHintStyle = {
  fontSize: 12,
  color: "rgba(11,27,58,0.65)",
  marginTop: 4,
};

const panelBodyStyle = {
  padding: 14,
  display: "flex",
  flexDirection: "column",
  gap: 10,
  minHeight: 0,
};

const panelDividerStyle = {
  height: 1,
  background: "rgba(15, 60, 160, 0.08)",
  margin: "6px 0",
};

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
  background:
    "linear-gradient(180deg, rgba(245,250,255,1) 0%, rgba(255,255,255,1) 60%)",
};

const questionGridStyle = {
  padding: 14,
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 12,
};

const scoreCardStyle = {
  border: "1px solid rgba(15, 60, 160, 0.12)",
  borderRadius: 16,
  padding: 12,
  background: "linear-gradient(180deg, #ffffff 0%, #f6f9ff 100%)",
  display: "flex",
  gap: 12,
  alignItems: "center",
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

const miniRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  marginTop: 8,
  gap: 10,
};

const miniLabelStyle = { fontSize: 12, color: "rgba(11,27,58,0.65)" };
const miniValueStyle = { fontSize: 12, fontWeight: 900, color: "#0b1b3a" };

const feedbackCardStyle = {
  border: "1px solid rgba(15, 60, 160, 0.12)",
  borderRadius: 16,
  padding: 12,
  background: "#fff",
};

const feedbackTitleStyle = {
  fontWeight: 900,
  color: "#0b1b3a",
  marginBottom: 6,
};

const feedbackTextStyle = {
  fontSize: 13,
  color: "rgba(11,27,58,0.75)",
  lineHeight: 1.7,
  whiteSpace: "pre-wrap",
  wordBreak: "keep-all",
};

const btnBase = {
  padding: "10px 14px",
  borderRadius: 999,
  fontSize: 13,
  fontWeight: 800,
  cursor: "pointer",
  transition: "all 0.15s ease",
};

const btnPrimary = {
  ...btnBase,
  background: "#1f55ff",
  color: "#fff",
  border: "1px solid #1f55ff",
  boxShadow: "0 10px 22px rgba(31,85,255,0.25)",
};

const btnPrimarySmall = {
  ...btnBase,
  padding: "9px 12px",
  fontSize: 12,
  background: "#1f55ff",
  color: "#fff",
  border: "1px solid #1f55ff",
  boxShadow: "0 10px 22px rgba(31,85,255,0.22)",
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
