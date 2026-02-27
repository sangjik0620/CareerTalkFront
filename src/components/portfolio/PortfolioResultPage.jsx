import React, { useState, useEffect } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import PortfolioRadarChart from "./PortfolioRadarChart";
import PortfolioQuestionItem from "./PortfolioQuestionItem";

const PortfolioResultPage = () => {
  const { analysisId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [currentData, setCurrentData] = useState(
    location.state?.analysisData || null,
  );
  const [isLoading, setIsLoading] = useState(!currentData);
  const [isReanalyzing, setIsReanalyzing] = useState(false);

  const portfolioId = currentData?.portfolioId;

  useEffect(() => {
    if (currentData && String(currentData.analysisId) === String(analysisId)) {
      setIsLoading(false);
      return;
    }

    const fetchResultData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `http://localhost:8080/api/portfolios/${analysisId}/result`,
        );
        if (!response.ok) throw new Error("결과를 불러오지 못했습니다.");
        const data = await response.json();
        setCurrentData(data);
      } catch (error) {
        console.error(error);
        alert("데이터를 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    if (analysisId) {
      fetchResultData();
    }
  }, [analysisId]);

  const handleReanalyze = async () => {
    if (!portfolioId) {
      alert("포트폴리오 식별 정보가 없어 재분석할 수 없습니다.");
      return;
    }
    if (!window.confirm("재분석할까요?")) return;

    setIsReanalyzing(true);
    try {
      const response = await fetch(
        `http://localhost:8080/api/portfolios/${portfolioId}/reanalyze`,
        { method: "POST" },
      );
      if (!response.ok) throw new Error("재분석 실패");
      const newData = await response.json();
      alert("재분석이 완료되었습니다!");
      navigate(`/portfolio/result/${newData.analysisId}`, {
        state: { analysisData: newData },
      });
    } catch (error) {
      console.error(error);
      alert("재분석 중 문제가 발생했습니다.");
    } finally {
      setIsReanalyzing(false);
    }
  };

  if (isLoading) {
    return (
      <div
        style={pageStyle}
        className="flex flex-col justify-center items-center h-screen"
      >
        <div className="w-12 h-12 border-4 border-[#1f55ff] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p style={{ color: "#0b1b3a", fontWeight: 900 }}>
          분석 결과를 불러오는 중입니다...
        </p>
      </div>
    );
  }

  if (!currentData) {
    return (
      <div
        style={pageStyle}
        className="flex flex-col justify-center items-center h-screen"
      >
        <span className="text-5xl mb-4">😮</span>
        <p style={{ color: "#0b1b3a", fontWeight: 900 }}>
          아직 분석 결과가 없습니다.
        </p>
        <button
          style={{ ...btnPrimary, marginTop: 20, width: "auto" }}
          onClick={() => navigate("/")}
        >
          홈으로 이동
        </button>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={topBarStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button style={btnGhost} onClick={() => navigate(-1)}>
            ← 뒤로
          </button>
          <div>
            <div style={topTitleStyle}>포트폴리오 분석 결과</div>
            <div style={topSubStyle}>
              지원 직무: {currentData.targetJob}
              {currentData.updatedAt && ` · 업데이트: ${currentData.updatedAt}`}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={scorePillStyle}>
            <span style={{ opacity: 0.75, marginRight: 8 }}>TOTAL</span>
            <span style={{ fontWeight: 900 }}>{currentData.overallScore}</span>
          </div>
          <button
            style={{ ...btnPrimary, width: "auto" }}
            onClick={() => navigate("/")}
          >
            홈으로
          </button>
        </div>
      </div>

      <div style={mainGridStyle}>
        {/* 왼쪽 메인 영역 (상세 분석 리포트) */}
        <div style={wordShellStyle}>
          <div style={wordHeaderStyle}>
            <div style={docBadgeStyle}>DOC</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={docTitleStyle}>AI 포트폴리오 상세 분석 리포트</div>
            </div>
          </div>

          <div style={wordPageStyle}>
            <div
              style={{
                padding: "48px 56px",
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* 한줄평 영역 */}
              <div style={{ marginBottom: "32px" }}>
                <h3
                  style={{
                    fontSize: 17,
                    fontWeight: 900,
                    color: "#1f55ff",
                    marginBottom: 14,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span style={{ fontSize: 18 }}>✨</span> 한줄평
                </h3>
                {/* ⭐ 여기서부터 패딩, 배경, 폰트 크기 완벽 통일 ⭐ */}
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 600, // 본문과 이질감이 없도록 굵기 살짝 조절
                    color: "#111827",
                    lineHeight: 1.6,
                    wordBreak: "keep-all",
                    padding: "30px 32px", // 좌우 들여쓰기 완벽 일치
                    background:
                      "linear-gradient(135deg, #f8faff 0%, #ffffff 100%)", // 배경 통일
                    border: "1px solid rgba(31,85,255,0.12)", // 테두리 통일
                    borderRadius: "16px", // 모서리 통일
                    boxShadow: "0 4px 12px rgba(31,85,255,0.02)",
                  }}
                >
                  {currentData.oneLineReview}
                </div>
              </div>

              {/* 상세 분석 영역 */}
              <div
                style={{ display: "flex", flexDirection: "column", flex: 1 }}
              >
                <h3
                  style={{
                    fontSize: 17,
                    fontWeight: 900,
                    color: "#1f55ff",
                    marginBottom: 14,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span style={{ fontSize: 18 }}>💡</span> 상세 분석
                </h3>
                {/* ⭐ 여기서부터 패딩, 배경, 폰트 크기 완벽 통일 ⭐ */}
                <div
                  style={{
                    flex: 1,
                    fontSize: 16, // 위쪽과 글자 크기 일치
                    fontWeight: 500,
                    color: "#111827",
                    lineHeight: 1.8,
                    whiteSpace: "pre-line",
                    wordBreak: "keep-all",
                    padding: "30px 32px", // 좌우 들여쓰기 완벽 일치
                    background:
                      "linear-gradient(135deg, #f8faff 0%, #ffffff 100%)", // 배경 통일
                    border: "1px solid rgba(31,85,255,0.12)", // 테두리 통일
                    borderRadius: "16px", // 모서리 통일
                    boxShadow: "0 4px 12px rgba(31,85,255,0.02)",
                  }}
                >
                  {currentData.summaryDetail}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={sidePanelStyle}>
          <div style={panelHeaderStyle}>
            <div style={{ fontWeight: 900, color: "#0b1b3a" }}>
              종합 역량 평가
            </div>
          </div>

          <div style={panelBodyStyle}>
            {/* 점수 카드 */}
            <div style={scoreCardStyle}>
              <div style={scoreCircleStyle}>
                <div style={{ fontSize: 12, opacity: 0.85 }}>SCORE</div>
                <div style={{ fontSize: 28, fontWeight: 900, lineHeight: 1 }}>
                  {currentData.overallScore}
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{ fontWeight: 900, color: "#0b1b3a", marginBottom: 6 }}
                >
                  평가 요약
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 6,
                    marginBottom: 8,
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{
                      padding: "4px 8px",
                      background: "#Eef2ff",
                      color: "#1f55ff",
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 800,
                    }}
                  >
                    AI 종합 평가
                  </span>
                  <span
                    style={{
                      padding: "4px 8px",
                      background: "#f4f8ff",
                      color: "#4b5563",
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 800,
                    }}
                  >
                    {currentData.targetJob} 기준
                  </span>
                </div>
              </div>
            </div>

            {/* 레이더 차트 영역 */}
            <div
              style={{
                marginTop: 8,
                marginBottom: 8,
                height: 300,
                width: "100%",
                background: "linear-gradient(180deg, #ffffff 0%, #f8faff 100%)",
                border: "1px solid rgba(31, 85, 255, 0.1)",
                borderRadius: 16,
                padding: "16px 0",
              }}
            >
              <PortfolioRadarChart data={currentData.chartData} />
            </div>

            <div style={panelDividerStyle} />

            <button
              style={btnPrimary}
              onClick={handleReanalyze}
              disabled={isReanalyzing}
            >
              {isReanalyzing ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>AI 재분석 진행 중...</span>
                </div>
              ) : (
                "결과 다시 분석하기"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 하단 예상 질문 영역 */}
      <div style={bottomStyle}>
        <div style={bottomHeaderStyle}>
          <div style={{ fontWeight: 900, color: "#0b1b3a" }}>
            예상 면접 질문
          </div>
        </div>
        <div style={questionGridStyle}>
          {currentData.questions?.map((item, idx) => (
            <PortfolioQuestionItem
              key={idx}
              index={idx}
              question={item.q || item.question}
              intent={item.intent}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// ==================== 스타일 정의 ====================
const pageStyle = {
  minHeight: "100vh",
  background: "#f4f8ff",
  padding: 24,
  fontFamily:
    'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", sans-serif',
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
  alignItems: "start",
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
  fontSize: 13,
};

const docTitleStyle = { fontSize: 15, fontWeight: 900, color: "#0b1b3a" };
const docMetaStyle = {
  fontSize: 12,
  color: "rgba(11,27,58,0.65)",
  marginTop: 2,
};

const wordPageStyle = {
  background: "linear-gradient(to bottom, #ffffff 0%, #f4f7fe 100%)",
  borderRadius: 16,
  border: "1px solid rgba(15, 60, 160, 0.10)",
  boxShadow: "0 18px 46px rgba(10,30,80,0.06)",
  overflow: "hidden",
  flex: 1,
  minHeight: 450,
};

const sidePanelStyle = {
  background: "#ffffff",
  borderRadius: 16,
  border: "1px solid rgba(15, 60, 160, 0.10)",
  boxShadow: "0 12px 34px rgba(10, 30, 80, 0.08)",
  overflow: "hidden",
  position: "sticky",
  top: 24,
  alignSelf: "start",
};

const panelHeaderStyle = {
  padding: "16px 20px",
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
  padding: 20,
  display: "flex",
  flexDirection: "column",
  gap: 12,
};

const panelDividerStyle = {
  height: 1,
  background: "rgba(15, 60, 160, 0.08)",
  margin: "8px 0",
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
  padding: "16px 20px",
  borderBottom: "1px solid rgba(15, 60, 160, 0.08)",
  background:
    "linear-gradient(180deg, rgba(245,250,255,1) 0%, rgba(255,255,255,1) 60%)",
};

const questionGridStyle = {
  padding: 20,
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 16,
  alignItems: "start",
};

const scoreCardStyle = {
  border: "1px solid rgba(15, 60, 160, 0.12)",
  borderRadius: 16,
  padding: 16,
  background: "linear-gradient(180deg, #ffffff 0%, #f6f9ff 100%)",
  display: "flex",
  gap: 16,
  alignItems: "center",
};

const scoreCircleStyle = {
  width: 84,
  height: 84,
  borderRadius: 20,
  background: "#1f55ff",
  color: "#fff",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 16px 30px rgba(31,85,255,0.25)",
  flex: "0 0 auto",
};

const miniHintStyle = {
  fontSize: 11,
  color: "rgba(11,27,58,0.55)",
  marginTop: 4,
  lineHeight: 1.4,
};

const btnBase = {
  padding: "12px 16px",
  borderRadius: 999,
  fontSize: 14,
  fontWeight: 800,
  cursor: "pointer",
  transition: "all 0.15s ease",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const btnPrimary = {
  ...btnBase,
  background: "#1f55ff",
  color: "#fff",
  border: "1px solid #1f55ff",
  boxShadow: "0 10px 22px rgba(31,85,255,0.25)",
  width: "100%",
};

const btnGhost = {
  ...btnBase,
  background: "#fff",
  color: "#0b1b3a",
  border: "1px solid rgba(15, 60, 160, 0.15)",
  width: "auto",
};

export default PortfolioResultPage;
