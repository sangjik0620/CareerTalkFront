import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function CIAnalysisResult() {
  const { analysisId } = useParams();
  const navigate = useNavigate();

  // 더미 데이터 추후 변경예정
  const mock = useMemo(
    () => ({
      analysisId,
      title: "네이버 백엔드 지원",
      content:
        "안녕하세요. 저는 꿈과 희망을 가지고 있는 지원자입니다.\n\n" +
        "어릴 때부터 코딩을 사랑했고, 문제를 해결하는 과정에서 성취감을 느꼈습니다.\n\n" +
        "프로젝트 경험으로는 ... (여기에 실제 자소서 내용이 들어갑니다)\n\n" +
        "입사 후에는 ...",
      ruleScore: 34,
      llmScore: 53,
      totalScore: 87,
      strengths:
        "문장 흐름이 자연스럽고, 지원 동기가 분명합니다. 직무와의 연결이 비교적 명확합니다.",
      weaknesses:
        "구체적인 수치/성과(예: 개선률, 처리량, 사용자 수)가 부족해 설득력이 약해질 수 있습니다.",
      feedback:
        "프로젝트에서 ‘무엇을’, ‘어떻게’, ‘얼마나’ 개선했는지 수치를 포함해 작성해보세요. STAR(상황-과제-행동-결과) 구조로 문단을 재구성하면 논리성이 좋아집니다.",
      questions: [
        "이 프로젝트에서 본인의 역할과 기여도를 구체적으로 설명해 주세요.",
        "가장 어려웠던 문제는 무엇이었고, 어떻게 해결했나요?",
        "지원 직무(백엔드)에서 이 경험이 어떻게 도움이 된다고 생각하나요?",
      ],
      updatedAt: "2026-02-26 12:30",
    }),
    [analysisId],
  );

  const [data, setData] = useState(null);

  // 탭: ORIGINAL | REWRITE
  const [tab, setTab] = useState("ORIGINAL");

  // AI 개선본 상태
  const [rewrite, setRewrite] = useState(""); // 개선본 텍스트
  const [rewriteNotes, setRewriteNotes] = useState([]); // 변경 요약
  const [isGenerating, setIsGenerating] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    setData(mock);
  }, [mock]);

  if (!data) return null;

  const handleGenerateRewrite = async () => {
    if (isGenerating) return;

    setIsGenerating(true);
    setToast("");

    try {
      // 지금은 더미
      const result = await fakeGenerateRewrite({
        title: data.title,
        content: data.content,
      });

      setRewrite(result.rewrittenEssay);
      setRewriteNotes(result.changeSummary || []);
      setTab("REWRITE");
    } catch (e) {
      console.error(e);
      setToast("개선본 생성에 실패했어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    const text = tab === "ORIGINAL" ? data.content : rewrite;
    if (!text?.trim()) return;

    try {
      await navigator.clipboard.writeText(text);
      setToast("복사 완료!");
      setTimeout(() => setToast(""), 1500);
    } catch {
      setToast("복사 실패 (브라우저 권한 확인)");
      setTimeout(() => setToast(""), 2000);
    }
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
            <div style={topTitleStyle}>자기소개서 분석 결과</div>
            <div style={topSubStyle}>
              분석 ID: {data.analysisId} · 업데이트: {data.updatedAt}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={scorePillStyle}>
            <span style={{ opacity: 0.75, marginRight: 8 }}>TOTAL</span>
            <span style={{ fontWeight: 900 }}>{data.totalScore}</span>
          </div>
          <button style={btnPrimary} onClick={() => navigate("/")}>
            홈으로
          </button>
        </div>
      </div>

      {/* 메인 */}
      <div style={mainGridStyle}>
        <div style={wordShellStyle}>
          <div style={wordHeaderStyle}>
            <div style={docBadgeStyle}>DOC</div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={docTitleStyle}>{data.title}</div>
              <div style={docMetaStyle}>
                룰 점수 {data.ruleScore} · LLM 점수 {data.llmScore}
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
                disabled={!rewrite}
                title={!rewrite ? "AI 개선본을 먼저 생성하세요" : ""}
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
                {tab === "REWRITE" && (
                  <span style={toolbarHintStyle}>
                    * 과장 없이 더 명확하게 다듬은 추천안(예정)
                  </span>
                )}
              </div>

              <button
                style={btnPrimarySmall}
                onClick={handleGenerateRewrite}
                disabled={isGenerating}
                title="LLM 호출로 개선본 생성(나중에 API 연결)"
              >
                {isGenerating ? "생성 중..." : "AI 개선본 생성"}
              </button>
            </div>

            <pre style={essayTextStyle}>
              {tab === "ORIGINAL"
                ? data.content
                : rewrite ||
                  "아직 AI 개선본이 없어요. 상단의 ‘AI 개선본 생성’ 버튼을 눌러주세요."}
            </pre>
          </div>

          {/* 개선본 생성시 요약 */}
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

        {/* 피드백 패널 */}
        <div style={sidePanelStyle}>
          <div style={panelHeaderStyle}>
            <div style={{ fontWeight: 900, color: "#0b1b3a" }}>AI 피드백</div>
            <div style={panelHintStyle}>핵심 개선 포인트를 요약해요</div>
          </div>

          <div style={panelBodyStyle}>
            <ScoreCard
              total={data.totalScore}
              rule={data.ruleScore}
              llm={data.llmScore}
            />
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

            <div style={miniHintStyle}>
              * 나중에 OpenAI API 연결하면 실제 첨삭 문장으로 생성됩니다.
            </div>
          </div>
        </div>
      </div>

      {/* 예상질문 */}
      <div style={bottomStyle}>
        <div style={bottomHeaderStyle}>
          <div style={{ fontWeight: 900, color: "#0b1b3a" }}>
            예상 면접 질문 (3)
          </div>
          <div style={panelHintStyle}>분석 결과 기반으로 생성된 질문이에요</div>
        </div>

        <div style={questionGridStyle}>
          {data.questions.map((q, idx) => (
            <div key={idx} style={questionCardStyle}>
              <div style={qIndexStyle}>Q{idx + 1}</div>
              <div style={qTextStyle}>{q}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Toast */}
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
          <span style={miniLabelStyle}>룰 기반</span>
          <span style={miniValueStyle}>{rule}</span>
        </div>
        <div style={miniRowStyle}>
          <span style={miniLabelStyle}>LLM</span>
          <span style={miniValueStyle}>{llm}</span>
        </div>
        <div style={miniHintStyle}>* 현재는 더미 점수(예정)</div>
      </div>
    </div>
  );
}

function FeedbackCard({ title, text }) {
  return (
    <div style={feedbackCardStyle}>
      <div style={feedbackTitleStyle}>{title}</div>
      <div style={feedbackTextStyle}>{text}</div>
    </div>
  );
}

/* ===== 지금은 더미 =====*/
async function fakeGenerateRewrite({ title, content }) {
  await new Promise((r) => setTimeout(r, 900));

  const rewritten =
    `안녕하세요. ${title} 직무에 지원한 지원자입니다.\n\n` +
    `저는 문제를 정의하고 끝까지 해결하는 과정을 즐깁니다. 단순히 “코딩을 좋아한다”에서 멈추지 않고, 실제 프로젝트에서 요구사항을 분석하고 구현/개선까지 책임지며 역량을 쌓아왔습니다.\n\n` +
    `대표 프로젝트로는 [프로젝트명]에서 [역할]을 맡아 [기능/모듈]을 구현했습니다. 특히 [병목 지점]을 발견해 [개선 방법]을 적용했고, 그 결과 [응답시간/처리량]을 [개선율 %]만큼 개선했습니다. 또한 [테스트/모니터링/로그]를 통해 재발을 방지하고 안정성을 확보했습니다.\n\n` +
    `입사 후에는 백엔드 핵심 영역(트래픽 처리, 데이터 모델링, 성능 최적화)을 중심으로 빠르게 기여하겠습니다. 특히 수치 기반으로 문제를 정의하고, 가설-검증-개선 사이클을 돌려 서비스 품질을 지속적으로 높이겠습니다.\n\n` +
    `감사합니다.\n\n` +
    `---\n` +
    `원문 참고(요약): ${content.slice(0, 60)}...`;

  return {
    rewrittenEssay: rewritten,
    changeSummary: [
      "지원 동기를 직무 키워드(백엔드/성능/데이터)와 연결",
      "프로젝트 경험을 STAR 구조로 재구성(상황-행동-결과)",
      "성과는 과장 대신 ‘자리표시자’([개선율 %])로 안전하게 처리",
    ],
  };
}

/*스타일------------------*/

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

const toolbarHintStyle = { fontSize: 12, color: "rgba(11,27,58,0.60)" };

const essayTextStyle = {
  margin: 0,
  padding: "34px 42px",
  lineHeight: 1.9,
  fontSize: 15,
  color: "#0b1b3a",
  whiteSpace: "pre-wrap",
  fontFamily:
    'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", sans-serif',
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
  overflow: "hidden",
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

const qTextStyle = { fontSize: 13, color: "#0b1b3a", lineHeight: 1.5 };

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
const miniHintStyle = {
  fontSize: 11,
  color: "rgba(11,27,58,0.55)",
  marginTop: 8,
};

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
  lineHeight: 1.6,
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
