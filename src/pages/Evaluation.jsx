import React, { useState } from "react";
import "../css/Evaluation.css";

const Evaluation = ({ evaluationData }) => {
  const [activeTab, setActiveTab] = useState("summary");

  // 샘플 데이터 (실제로는 props나 API로부터 받아옴)
  const data = evaluationData || {
    interviewInfo: {
      date: "2024-01-15",
      duration: "45분",
      position: "프론트엔드 개발자",
      company: "ABC Tech",
    },
    summary: {
      overallScore: 78,
      previousScore: 65,
      passedAverage: 82,
      strengths: ["기술 역량", "문제 해결 능력", "커뮤니케이션"],
      weaknesses: ["답변 구조화", "구체적 사례 부족", "시간 관리"],
      totalQuestions: 12,
      answeredQuestions: 11,
      verdict: "보류", // "합격권" | "보류" | "개선필요"
      percentileRank: 65, // 상위 65%
      confidenceIndex: 70, // 0~100
      jobFitIndex: 76, // 0~100
      technicalIndex: 82, // 0~100
      communicationIndex: 74, // 0~100

      avgResponseTimeSec: 8.5,
      fillerWordRate: 6.2, // %
      sentimentScore: 72, // %
      topKeywords: ["React", "성능 최적화", "협업", "문제 해결", "사용자 관점"],

      // “다음 액션” 느낌 (서비스스러움)
      nextActions: [
        { title: "STAR 답변 템플릿 10문항 작성", dueDays: 3 },
        { title: "모의면접 3회 + 피드백 반영", dueDays: 7 },
        { title: "프로젝트 성과지표(수치) 5개 정리", dueDays: 5 },
      ],
    },

    documentAnalysis: {
      resume: {
        score: 85,
        keywords: ["React", "TypeScript", "Node.js", "Git", "Agile"],
        matchRate: 88,
        strengths: ["기술 스택 다양성", "프로젝트 경험 풍부"],
        improvements: ["성과 수치화 필요", "리더십 경험 추가"],
      },
      coverLetter: {
        score: 75,
        consistency: 82,
        relevance: 78,
        keywords: ["팀워크", "혁신", "성장", "문제해결"],
        improvements: ["지원 동기 구체화", "회사 분석 심화"],
      },
      portfolio: {
        score: 90,
        projectCount: 5,
        technicalDepth: 88,
        highlights: ["UI/UX 우수", "코드 품질 높음", "문서화 잘됨"],
        improvements: ["배포 경험 추가", "테스트 케이스 보완"],
      },
    },
    interviewAnalysis: {
      voiceMetrics: {
        clarity: 75,
        pace: 68,
        volume: 82,
        confidence: 70,
        fillerWords: 15, // 개수
      },
      sttAnalysis: {
        totalWords: 2450,
        averageResponseTime: 8.5, // 초
        keywordUsage: {
          technical: 45,
          soft: 32,
          company: 12,
        },
        sentimentScore: 72,
      },
      questionResponses: [
        {
          question: "본인의 강점을 소개해주세요",
          response: "저의 강점은 빠른 학습 능력과...",
          score: 85,
          feedback: "구체적인 사례가 포함되어 좋습니다",
          duration: 120,
        },
        {
          question: "프로젝트 경험에 대해 말씀해주세요",
          response: "최근 진행한 프로젝트는...",
          score: 75,
          feedback: "기술적 깊이를 더 보여주면 좋겠습니다",
          duration: 180,
        },
        {
          question: "팀 협업 경험을 공유해주세요",
          response: "팀 프로젝트에서...",
          score: 70,
          feedback: "갈등 해결 과정을 추가하면 좋습니다",
          duration: 150,
        },
      ],
    },
    comparison: {
      scoreHistory: [
        { date: "2023-11", score: 55 },
        { date: "2023-12", score: 65 },
        { date: "2024-01", score: 78 },
      ],
      categoryComparison: {
        technical: { user: 82, average: 75, previous: 70 },
        communication: { user: 75, average: 80, previous: 68 },
        problemSolving: { user: 78, average: 77, previous: 65 },
        attitude: { user: 80, average: 82, previous: 75 },
        experience: { user: 72, average: 78, previous: 60 },
      },
      percentileRank: 65, // 상위 35%
    },
    competency: {
      technical: {
        current: 82,
        target: 90,
        details: {
          frontEnd: 85,
          backEnd: 70,
          database: 75,
          deployment: 80,
        },
      },
      soft: {
        current: 75,
        target: 85,
        details: {
          communication: 78,
          teamwork: 80,
          leadership: 65,
          presentation: 72,
        },
      },
      improvements: [
        {
          area: "답변 구조화",
          priority: "high",
          currentLevel: 60,
          targetLevel: 85,
          actionItems: [
            "STAR 기법 연습",
            "답변 템플릿 작성",
            "모의 면접 10회 이상",
          ],
        },
        {
          area: "기술 심화 학습",
          priority: "high",
          currentLevel: 70,
          targetLevel: 90,
          actionItems: [
            "React 고급 패턴 학습",
            "성능 최적화 경험",
            "오픈소스 기여",
          ],
        },
        {
          area: "비즈니스 이해도",
          priority: "medium",
          currentLevel: 65,
          targetLevel: 80,
          actionItems: ["산업 동향 분석", "경쟁사 분석", "비즈니스 모델 이해"],
        },
      ],
      recommendedResources: [
        { type: "강의", title: "React 고급 패턴", url: "#" },
        { type: "도서", title: "면접의 기술", url: "#" },
        { type: "연습", title: "모의 면접 플랫폼", url: "#" },
      ],
    },
  };

  const tabs = [
    { id: "summary", label: "요약", icon: "📊" },
    { id: "document", label: "문서분석", icon: "📄" },
    { id: "interview", label: "면접분석", icon: "🎤" },
    { id: "comparison", label: "분포/비교", icon: "📈" },
    { id: "competency", label: "역량/개선", icon: "🎯" },
  ];

  const getScoreColor = (score) => {
    if (score >= 80) return "#10b981";
    if (score >= 60) return "#f59e0b";
    return "#ef4444";
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return "우수";
    if (score >= 60) return "보통";
    return "개선필요";
  };

  const renderSummaryTab = () => {
    const diffPrev = data.summary.overallScore - data.summary.previousScore;
    const diffAvg = data.summary.overallScore - data.summary.passedAverage;

    const verdictTone = (v) => {
      if (v === "합격권") return "good";
      if (v === "개선필요") return "bad";
      return "neutral";
    };

    const kpis = [
      {
        label: "백분위",
        value: `상위 ${data.summary.percentileRank}%`,
        sub: "전체 대비",
        tone: "brand",
      },
      {
        label: "평균 답변",
        value: `${data.summary.avgResponseTimeSec}s`,
        sub: "응답 속도",
        tone: "neutral",
      },
      {
        label: "추임새",
        value: `${data.summary.fillerWordRate}%`,
        sub: "비중",
        tone: "neutral",
      },
      {
        label: "긍정도",
        value: `${data.summary.sentimentScore}%`,
        sub: "감정",
        tone: "neutral",
      },
      {
        label: "직무적합",
        value: `${data.summary.jobFitIndex}`,
        sub: "Index",
        tone: "brand",
      },
      {
        label: "자신감",
        value: `${data.summary.confidenceIndex}`,
        sub: "Index",
        tone: "brand",
      },
    ];

    const indexes = [
      { label: "기술", value: data.summary.technicalIndex },
      { label: "커뮤니케이션", value: data.summary.communicationIndex },
      { label: "직무적합", value: data.summary.jobFitIndex },
    ];

    return (
      <div className="tab-content">
        <div className="summaryTop">
          <div className="summaryTopLeft">
            <h2 className="summaryTitle">면접 종합 평가</h2>
            <div className="interview-info summaryInfoCompact">
              <span>📅 {data.interviewInfo.date}</span>
              <span>⏱️ {data.interviewInfo.duration}</span>
              <span>💼 {data.interviewInfo.position}</span>
              <span>🏢 {data.interviewInfo.company}</span>
            </div>
          </div>

          <div className="summaryTopRight">
            <span
              className={`badge badge-${verdictTone(data.summary.verdict)}`}
            >
              {data.summary.verdict}
            </span>
            <span className="badge badge-ghost">
              답변 {data.summary.answeredQuestions}/
              {data.summary.totalQuestions}
            </span>
          </div>
        </div>

        <div className="summaryGrid">
          {/* Score Card (compact) */}
          <section className="summaryCard scoreCardCompact">
            <div className="scoreLeft">
              <div className="score-circle scoreCircleCompact">
                <svg viewBox="0 0 200 200">
                  <circle cx="100" cy="100" r="90" className="score-bg" />
                  <circle
                    cx="100"
                    cy="100"
                    r="90"
                    className="score-fill"
                    style={{
                      stroke: getScoreColor(data.summary.overallScore),
                      strokeDasharray: `${(2 * Math.PI * 90 * data.summary.overallScore) / 100} ${2 * Math.PI * 90}`,
                    }}
                  />
                </svg>
                <div className="score-text">
                  <div className="score-number scoreNumCompact">
                    {data.summary.overallScore}
                  </div>
                  <div className="score-label">
                    {getScoreLabel(data.summary.overallScore)}
                  </div>
                </div>
              </div>

              <div className="scoreDelta">
                <div className="deltaItem">
                  <span className="deltaLabel">이전 대비</span>
                  <span
                    className={`deltaValue ${diffPrev >= 0 ? "pos" : "neg"}`}
                  >
                    {diffPrev >= 0 ? `+${diffPrev}` : diffPrev}점
                  </span>
                </div>
                <div className="deltaItem">
                  <span className="deltaLabel">평균 대비</span>
                  <span
                    className={`deltaValue ${diffAvg >= 0 ? "pos" : "neg"}`}
                  >
                    {diffAvg >= 0 ? `+${diffAvg}` : diffAvg}점
                  </span>
                </div>
              </div>
            </div>

            <div className="scoreRight">
              <div className="kpiGrid">
                {kpis.map((k) => (
                  <div key={k.label} className={`kpiCard kpi-${k.tone}`}>
                    <div className="kpiLabel">{k.label}</div>
                    <div className="kpiValue">{k.value}</div>
                    <div className="kpiSub">{k.sub}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Index bars + keywords */}
          <section className="summaryCard summaryCardCompact">
            <div className="summaryCardHeader">
              <h3 className="summaryCardTitle">핵심 지표</h3>
              <span className="summaryCardHint">Index 기반 요약</span>
            </div>

            <div className="indexList">
              {indexes.map((it) => (
                <div key={it.label} className="indexRow">
                  <span className="indexLabel">{it.label}</span>
                  <div className="indexBar">
                    <div
                      className="indexFill"
                      style={{ width: `${it.value}%` }}
                    />
                  </div>
                  <span className="indexValue">{it.value}</span>
                </div>
              ))}
            </div>

            <div className="keywordStrip">
              <div className="keywordStripTitle">상위 키워드</div>
              <div className="keywords">
                {data.summary.topKeywords.map((kw, i) => (
                  <span key={i} className="keyword-tag">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Strength / Weakness (more compact) */}
          <section className="summaryCard summaryCardCompact">
            <div className="swCompact">
              <div className="swMini">
                <h3 className="swTitle">강점</h3>
                <ul className="swList">
                  {data.summary.strengths.map((s, i) => (
                    <li key={i} className="swItem">
                      <span className="swDot">✓</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="swMini">
                <h3 className="swTitle">개선 포인트</h3>
                <ul className="swList">
                  {data.summary.weaknesses.map((w, i) => (
                    <li key={i} className="swItem">
                      <span className="swDot">!</span>
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  };
  const renderDocumentTab = () => (
    <div className="tab-content">
      <h2>문서 분석 결과</h2>

      <div className="document-overview">
        <div className="doc-score-card">
          <div className="doc-type">📝 이력서</div>
          <div
            className="doc-score"
            style={{ color: getScoreColor(data.documentAnalysis.resume.score) }}
          >
            {data.documentAnalysis.resume.score}점
          </div>
          <div className="doc-match">
            매칭률: {data.documentAnalysis.resume.matchRate}%
          </div>
        </div>
        <div className="doc-score-card">
          <div className="doc-type">✍️ 자기소개서</div>
          <div
            className="doc-score"
            style={{
              color: getScoreColor(data.documentAnalysis.coverLetter.score),
            }}
          >
            {data.documentAnalysis.coverLetter.score}점
          </div>
          <div className="doc-match">
            일관성: {data.documentAnalysis.coverLetter.consistency}%
          </div>
        </div>
        <div className="doc-score-card">
          <div className="doc-type">💼 포트폴리오</div>
          <div
            className="doc-score"
            style={{
              color: getScoreColor(data.documentAnalysis.portfolio.score),
            }}
          >
            {data.documentAnalysis.portfolio.score}점
          </div>
          <div className="doc-match">
            프로젝트: {data.documentAnalysis.portfolio.projectCount}개
          </div>
        </div>
      </div>

      <div className="document-details">
        <div className="doc-detail-card">
          <h3>📝 이력서 상세 분석</h3>
          <div className="keywords-section">
            <h4>핵심 키워드</h4>
            <div className="keywords">
              {data.documentAnalysis.resume.keywords.map((keyword, idx) => (
                <span key={idx} className="keyword-tag">
                  {keyword}
                </span>
              ))}
            </div>
          </div>
          <div className="analysis-section">
            <h4>✅ 강점</h4>
            <ul>
              {data.documentAnalysis.resume.strengths.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="analysis-section">
            <h4>💡 개선사항</h4>
            <ul>
              {data.documentAnalysis.resume.improvements.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="doc-detail-card">
          <h3>✍️ 자기소개서 상세 분석</h3>
          <div className="metrics-grid">
            <div className="metric">
              <div className="metric-label">일관성</div>
              <div className="metric-bar">
                <div
                  className="metric-fill"
                  style={{
                    width: `${data.documentAnalysis.coverLetter.consistency}%`,
                  }}
                />
              </div>
              <div className="metric-value">
                {data.documentAnalysis.coverLetter.consistency}%
              </div>
            </div>
            <div className="metric">
              <div className="metric-label">직무 관련성</div>
              <div className="metric-bar">
                <div
                  className="metric-fill"
                  style={{
                    width: `${data.documentAnalysis.coverLetter.relevance}%`,
                  }}
                />
              </div>
              <div className="metric-value">
                {data.documentAnalysis.coverLetter.relevance}%
              </div>
            </div>
          </div>
          <div className="keywords-section">
            <h4>핵심 키워드</h4>
            <div className="keywords">
              {data.documentAnalysis.coverLetter.keywords.map(
                (keyword, idx) => (
                  <span key={idx} className="keyword-tag secondary">
                    {keyword}
                  </span>
                ),
              )}
            </div>
          </div>
          <div className="analysis-section">
            <h4>💡 개선사항</h4>
            <ul>
              {data.documentAnalysis.coverLetter.improvements.map(
                (item, idx) => (
                  <li key={idx}>{item}</li>
                ),
              )}
            </ul>
          </div>
        </div>

        <div className="doc-detail-card">
          <h3>💼 포트폴리오 상세 분석</h3>
          <div className="portfolio-stats">
            <div className="portfolio-stat">
              <span className="stat-number">
                {data.documentAnalysis.portfolio.projectCount}
              </span>
              <span className="stat-text">프로젝트</span>
            </div>
            <div className="portfolio-stat">
              <span className="stat-number">
                {data.documentAnalysis.portfolio.technicalDepth}
              </span>
              <span className="stat-text">기술 깊이</span>
            </div>
          </div>
          <div className="analysis-section">
            <h4>⭐ 하이라이트</h4>
            <ul>
              {data.documentAnalysis.portfolio.highlights.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="analysis-section">
            <h4>💡 개선사항</h4>
            <ul>
              {data.documentAnalysis.portfolio.improvements.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderInterviewTab = () => (
    <div className="tab-content">
      <h2>면접 음성 및 답변 분석</h2>

      <div className="voice-analysis">
        <h3>🎤 음성 분석</h3>
        <div className="voice-metrics">
          {Object.entries(data.interviewAnalysis.voiceMetrics).map(
            ([key, value]) => {
              const labels = {
                clarity: "명확성",
                pace: "말하기 속도",
                volume: "음량",
                confidence: "자신감",
                fillerWords: "추임새 (개)",
              };
              return (
                <div key={key} className="voice-metric">
                  <div className="metric-header">
                    <span className="metric-name">{labels[key]}</span>
                    <span className="metric-score">
                      {value}
                      {key !== "fillerWords" && "%"}
                    </span>
                  </div>
                  {key !== "fillerWords" && (
                    <div className="metric-bar">
                      <div
                        className="metric-fill voice"
                        style={{
                          width: `${value}%`,
                          backgroundColor: getScoreColor(value),
                        }}
                      />
                    </div>
                  )}
                </div>
              );
            },
          )}
        </div>
      </div>

      <div className="stt-analysis">
        <h3>📝 STT 분석</h3>
        <div className="stt-stats">
          <div className="stt-stat-card">
            <div className="stt-icon">💬</div>
            <div className="stt-value">
              {data.interviewAnalysis.sttAnalysis.totalWords.toLocaleString()}
            </div>
            <div className="stt-label">총 단어 수</div>
          </div>
          <div className="stt-stat-card">
            <div className="stt-icon">⏱️</div>
            <div className="stt-value">
              {data.interviewAnalysis.sttAnalysis.averageResponseTime}초
            </div>
            <div className="stt-label">평균 답변 시간</div>
          </div>
          <div className="stt-stat-card">
            <div className="stt-icon">😊</div>
            <div className="stt-value">
              {data.interviewAnalysis.sttAnalysis.sentimentScore}%
            </div>
            <div className="stt-label">긍정도</div>
          </div>
        </div>

        <div className="keyword-usage">
          <h4>키워드 사용 분포</h4>
          <div className="keyword-chart">
            {Object.entries(
              data.interviewAnalysis.sttAnalysis.keywordUsage,
            ).map(([type, count]) => {
              const total = Object.values(
                data.interviewAnalysis.sttAnalysis.keywordUsage,
              ).reduce((a, b) => a + b, 0);
              const percentage = ((count / total) * 100).toFixed(1);
              const labels = {
                technical: "기술",
                soft: "소프트스킬",
                company: "회사",
              };
              return (
                <div key={type} className="keyword-bar-item">
                  <div className="keyword-bar-label">{labels[type]}</div>
                  <div className="keyword-bar-container">
                    <div
                      className="keyword-bar-fill"
                      style={{ width: `${percentage}%` }}
                    />
                    <span className="keyword-bar-value">
                      {count}회 ({percentage}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="question-responses">
        <h3>📋 질문별 답변 분석</h3>
        {data.interviewAnalysis.questionResponses.map((item, idx) => (
          <div key={idx} className="response-card">
            <div className="response-header">
              <span className="question-number">Q{idx + 1}</span>
              <span className="question-text">{item.question}</span>
              <span
                className="response-score"
                style={{ color: getScoreColor(item.score) }}
              >
                {item.score}점
              </span>
            </div>
            <div className="response-body">
              <div className="response-preview">
                {item.response.substring(0, 100)}...
              </div>
              <div className="response-meta">
                <span className="response-duration">
                  ⏱️ {Math.floor(item.duration / 60)}분 {item.duration % 60}초
                </span>
              </div>
            </div>
            <div className="response-feedback">
              <span className="feedback-icon">💡</span>
              <span className="feedback-text">{item.feedback}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderComparisonTab = () => (
    <div className="tab-content">
      <h2>성적 분포 및 비교 분석</h2>

      <div className="distribution-section">
        <h3>📊 지원자 점수 분포</h3>

        <div className="distribution-chart compact">
          <svg viewBox="0 0 600 220" className="dist-svg">
            {/* X축 */}
            <line
              x1="50"
              y1="180"
              x2="550"
              y2="180"
              stroke="#cbd5e1"
              strokeWidth="1.5"
            />

            {/* 정규분포 곡선 (더미) */}
            <path
              d="M50 180 
         Q150 60 300 90 
         Q450 120 550 180"
              fill="none"
              stroke="#2563eb"
              strokeWidth="2"
            />

            {/* 평균선 */}
            <line
              x1="300"
              y1="180"
              x2="300"
              y2="85"
              stroke="#94a3b8"
              strokeDasharray="4 4"
              strokeWidth="1.5"
            />

            {/* 내 점수 위치 */}
            {(() => {
              const userScore = data.summary.overallScore;
              const x = 50 + (userScore / 100) * 500;
              return (
                <>
                  <line
                    x1={x}
                    y1="180"
                    x2={x}
                    y2="110"
                    stroke="#2563eb"
                    strokeWidth="1.5"
                  />
                  <circle cx={x} cy="110" r="5" fill="#2563eb" />
                  <text
                    x={x}
                    y="95"
                    textAnchor="middle"
                    fontSize="12"
                    fill="#2563eb"
                    fontWeight="700"
                  >
                    {userScore}점
                  </text>
                </>
              );
            })()}

            {/* 축 라벨 */}
            <text x="50" y="200" fontSize="11" fill="#64748b">
              0
            </text>
            <text
              x="300"
              y="200"
              fontSize="11"
              fill="#64748b"
              textAnchor="middle"
            >
              평균
            </text>
            <text x="550" y="200" fontSize="11" fill="#64748b" textAnchor="end">
              100
            </text>
          </svg>
        </div>

        <div className="distribution-meta">
          전체 지원자 중 <strong>상위 {data.comparison.percentileRank}%</strong>
          에 위치합니다.
        </div>
      </div>

      <div className="score-history">
        <h3>📈 성적 추이</h3>
        <div className="history-chart">
          <div className="chart-area">
            <svg viewBox="0 0 600 220" className="line-chart compact">
              {[0, 25, 50, 75, 100].map((val) => (
                <line
                  key={val}
                  x1="50"
                  y1={180 - val * 1.6}
                  x2="550"
                  y2={180 - val * 1.6}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                />
              ))}

              <polyline
                points={data.comparison.scoreHistory
                  .map((item, idx) => {
                    const x = 50 + idx * 250;
                    const y = 180 - item.score * 1.6;
                    return `${x},${y}`;
                  })
                  .join(" ")}
                fill="none"
                stroke="#2563eb"
                strokeWidth="2"
              />

              {data.comparison.scoreHistory.map((item, idx) => {
                const x = 50 + idx * 250;
                const y = 180 - item.score * 1.6;
                return (
                  <g key={idx}>
                    <circle cx={x} cy={y} r="4" fill="#2563eb" />
                    <text
                      x={x}
                      y={y - 12}
                      textAnchor="middle"
                      fontSize="12"
                      fill="#2563eb"
                      fontWeight="700"
                    >
                      {item.score}
                    </text>
                    <text
                      x={x}
                      y={200}
                      textAnchor="middle"
                      fontSize="11"
                      fill="#64748b"
                    >
                      {item.date}
                    </text>
                  </g>
                );
              })}

              {[0, 25, 50, 75, 100].map((val) => (
                <text
                  key={val}
                  x="35"
                  y={185 - val * 1.6}
                  textAnchor="end"
                  fontSize="11"
                  fill="#6b7280"
                >
                  {val}
                </text>
              ))}
            </svg>
          </div>
        </div>
      </div>

      <div className="category-comparison">
        <h3>📊 카테고리별 비교</h3>

        <div className="vChart">
          {Object.entries(data.comparison.categoryComparison).map(
            ([category, scores]) => {
              const labels = {
                technical: "기술",
                communication: "소통",
                problemSolving: "문제해결",
                attitude: "태도",
                experience: "경험",
              };

              const bars = [
                { key: "user", label: "본인", value: scores.user },
                { key: "average", label: "평균", value: scores.average },
                { key: "previous", label: "이전", value: scores.previous },
              ];

              return (
                <div key={category} className="vCol">
                  <div className="vBars">
                    {bars.map((b) => (
                      <div key={b.key} className={`vBarWrap ${b.key}`}>
                        <div className="vBarTrack">
                          <div
                            className="vBar"
                            style={{ height: `${b.value}%` }}
                          />
                        </div>
                        <div className="vBarVal">{b.value}</div>
                      </div>
                    ))}
                  </div>

                  <div className="vLabel">{labels[category]}</div>
                </div>
              );
            },
          )}
        </div>

        <div className="vLegend">
          <div className="legend-item">
            <span className="legend-color user"></span>
            <span>본인</span>
          </div>
          <div className="legend-item">
            <span className="legend-color average"></span>
            <span>평균</span>
          </div>
          <div className="legend-item">
            <span className="legend-color previous"></span>
            <span>이전</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCompetencyTab = () => (
    <div className="tab-content">
      <h2>역량 분석 및 개선 방안</h2>

      <div className="competency-overview">
        <div className="competency-card">
          <h3>💻 기술 역량</h3>
          <div className="competency-score">
            <div className="score-display">
              <span className="current-score">
                {data.competency.technical.current}
              </span>
              <span className="score-separator">/</span>
              <span className="target-score">
                {data.competency.technical.target}
              </span>
            </div>
            <div className="score-bar">
              <div
                className="score-progress current"
                style={{ width: `${data.competency.technical.current}%` }}
              />
              <div
                className="score-progress target"
                style={{ width: `${data.competency.technical.target}%` }}
              />
            </div>
          </div>
          <div className="competency-details">
            {Object.entries(data.competency.technical.details).map(
              ([key, value]) => {
                const labels = {
                  frontEnd: "프론트엔드",
                  backEnd: "백엔드",
                  database: "데이터베이스",
                  deployment: "배포/운영",
                };
                return (
                  <div key={key} className="detail-item">
                    <span className="detail-label">{labels[key]}</span>
                    <div className="detail-bar">
                      <div
                        className="detail-fill"
                        style={{ width: `${value}%` }}
                      />
                    </div>
                    <span className="detail-value">{value}</span>
                  </div>
                );
              },
            )}
          </div>
        </div>

        <div className="competency-card">
          <h3>🤝 소프트 스킬</h3>
          <div className="competency-score">
            <div className="score-display">
              <span className="current-score">
                {data.competency.soft.current}
              </span>
              <span className="score-separator">/</span>
              <span className="target-score">
                {data.competency.soft.target}
              </span>
            </div>
            <div className="score-bar">
              <div
                className="score-progress current"
                style={{ width: `${data.competency.soft.current}%` }}
              />
              <div
                className="score-progress target"
                style={{ width: `${data.competency.soft.target}%` }}
              />
            </div>
          </div>
          <div className="competency-details">
            {Object.entries(data.competency.soft.details).map(
              ([key, value]) => {
                const labels = {
                  communication: "커뮤니케이션",
                  teamwork: "팀워크",
                  leadership: "리더십",
                  presentation: "발표력",
                };
                return (
                  <div key={key} className="detail-item">
                    <span className="detail-label">{labels[key]}</span>
                    <div className="detail-bar">
                      <div
                        className="detail-fill"
                        style={{ width: `${value}%` }}
                      />
                    </div>
                    <span className="detail-value">{value}</span>
                  </div>
                );
              },
            )}
          </div>
        </div>
      </div>

      <div className="improvements-section">
        <h3>🎯 개선 계획</h3>
        {data.competency.improvements.map((item, idx) => (
          <div key={idx} className="improvement-card">
            <div className="improvement-header">
              <div className="improvement-title">
                <span className="improvement-area">{item.area}</span>
                <span className={`priority-badge ${item.priority}`}>
                  {item.priority === "high" ? "높음" : "보통"}
                </span>
              </div>
              <div className="improvement-progress">
                <span className="progress-label">
                  {item.currentLevel} → {item.targetLevel}
                </span>
              </div>
            </div>
            <div className="improvement-bar">
              <div
                className="improvement-current"
                style={{ width: `${item.currentLevel}%` }}
              />
              <div
                className="improvement-target"
                style={{ left: `${item.targetLevel}%` }}
              >
                <span className="target-marker">🎯</span>
              </div>
            </div>
            <div className="improvement-actions">
              <h4>실행 항목</h4>
              <ul>
                {item.actionItems.map((action, actionIdx) => (
                  <li key={actionIdx}>
                    <span className="action-bullet">▸</span>
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="evaluation-container">
      <div className="evaluation-header">
        <h1>면접 평가 결과</h1>
        <button className="export-btn">📥 PDF 내보내기</button>
      </div>

      <div className="tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="tab-content-wrapper">
        {activeTab === "summary" && renderSummaryTab()}
        {activeTab === "document" && renderDocumentTab()}
        {activeTab === "interview" && renderInterviewTab()}
        {activeTab === "comparison" && renderComparisonTab()}
        {activeTab === "competency" && renderCompetencyTab()}
      </div>
    </div>
  );
};

export default Evaluation;
