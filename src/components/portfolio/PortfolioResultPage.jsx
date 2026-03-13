import React, { useState, useEffect, useRef } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import PortfolioRadarChart from "./PortfolioRadarChart";
import PortfolioQuestionItem from "./PortfolioQuestionItem";
import styles from "../../css/Portfolio.module.css";

const PortfolioResultPage = () => {
  const { analysisId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // 중복 호출 방지
  const isFetching = useRef(false);

  const [currentData, setCurrentData] = useState(
    location.state?.analysisData || null,
  );
  const [isLoading, setIsLoading] = useState(!currentData);

  useEffect(() => {
    if (currentData && String(currentData.analysisId) === String(analysisId)) {
      setIsLoading(false);
      return;
    }

    // 호출 중이면 중복 실행 방지
    if (isFetching.current) return;

    const fetchResultData = async () => {
      isFetching.current = true;
      setIsLoading(true);

      try {
        const token = sessionStorage.getItem("token");
        const response = await fetch(
          `http://localhost:8080/api/portfolios/${analysisId}/result`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || "결과를 불러오지 못했습니다.");
        }

        const data = await response.json();
        setCurrentData(data);
      } catch (error) {
        console.error("결과 조회 실패");

        let displayMessage = "데이터를 불러오는 중 오류가 발생했습니다.";

        if (error.message.includes("접근 권한")) {
          displayMessage = "분석 결과를 조회할 수 없습니다.";
        } else if (error.message.includes("존재하지 않는")) {
          displayMessage = "해당 분석 결과를 찾을 수 없습니다.";
        }

        alert(displayMessage);
        navigate("/");
      } finally {
        setIsLoading(false);
        isFetching.current = false;
      }
    };

    if (analysisId) {
      fetchResultData();
    }
  }, [analysisId, currentData, navigate]); // 의존성 배열 보완

  if (isLoading) {
    return (
      <div className={`${styles.page} ${styles.loadingContainer}`}>
        <div className={styles.spinner}></div>
        <p className={styles.loadingText}>분석 결과를 불러오는 중입니다...</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <div className={styles.topBarLeft}>
          <button
            className={`${styles.btnBase} ${styles.btnGhost}`}
            onClick={() => navigate(-1)}
          >
            ← 뒤로
          </button>
          <div>
            <div className={styles.topTitle}>
              <span className={styles.highlightName}>
                {currentData?.nickname}
              </span>
              님의 포트폴리오 분석 결과
            </div>
            <div className={styles.topSub}>
              지원 직무: {currentData.targetJob}
              {currentData.updatedAt && ` · 업데이트: ${currentData.updatedAt}`}
            </div>
          </div>
        </div>

        {/* 오른쪽 영역 (점수 및 홈 버튼) */}
        <div className={styles.topBarRight}>
          <div className={styles.scorePill}>
            <span className={styles.scorePillLabel}>TOTAL</span>
            <span className={styles.scorePillValue}>
              {currentData.overallScore}
            </span>
          </div>
          <button
            className={`${styles.btnBase} ${styles.btnPrimary}`}
            onClick={() => navigate("/")}
          >
            홈으로
          </button>
        </div>
      </div>

      <div className={styles.mainGrid}>
        {/* 왼쪽 메인 영역 (상세 분석 리포트) */}
        <div className={styles.wordShell}>
          <div className={styles.wordHeader}>
            <div className={styles.docBadge}>DOC</div>
            <div className={styles.docTitleWrapper}>
              <div className={styles.docTitle}>
                AI 포트폴리오 상세 분석 리포트
              </div>
            </div>
          </div>

          <div className={styles.wordPage}>
            <div className={styles.wordPageContent}>
              {/* 한줄평 영역 */}
              <div className={styles.reviewSection}>
                <h3 className={styles.sectionTitle}>
                  <span className={styles.sectionIcon}>✨</span> 한줄평
                </h3>

                <div className={styles.contentBox}>
                  {currentData.oneLineReview}
                </div>
              </div>

              {/* 상세 분석 영역 */}
              <div className={styles.detailSection}>
                <h3 className={styles.sectionTitle}>
                  <span className={styles.sectionIcon}>💡</span> 상세 분석
                </h3>

                <div className={styles.detailContentBox}>
                  {currentData.summaryDetail}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.sidePanel}>
          <div className={styles.panelHeader}>
            <div className={styles.panelTitle}>종합 역량 평가</div>
          </div>

          <div className={styles.panelBody}>
            {/* 점수 카드 */}
            <div className={styles.scoreCard}>
              <div className={styles.scoreCircle}>
                <div className={styles.scoreLabel}>SCORE</div>
                <div className={styles.scoreValue}>
                  {currentData.overallScore}
                </div>
              </div>
              <div className={styles.summaryContent}>
                <div className={styles.summaryTitle}>평가 요약</div>
                <div className={styles.badgeContainer}>
                  <span className={styles.badgePrimary}>AI 종합 평가</span>
                  <span className={styles.badgeSecondary}>
                    {currentData.targetJob} 기준
                  </span>
                </div>
              </div>
            </div>

            {/* 레이더 차트 영역 */}
            <div className={styles.radarChartWrapper}>
              <PortfolioRadarChart data={currentData.chartData} />
            </div>

            <div className={styles.panelDivider} />

            <button
              className={`${styles.btnBase} ${styles.btnGhostFull}`}
              onClick={() => navigate("/interview/select")}
            >
              면접 진행하기 ➔
            </button>
          </div>
        </div>
      </div>

      {/* 하단 예상 질문 영역 */}
      <div className={styles.bottomSection}>
        <div className={styles.bottomHeader}>
          <div className={styles.bottomTitle}>예상 면접 질문</div>
        </div>
        <div className={styles.questionGrid}>
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

export default PortfolioResultPage;
