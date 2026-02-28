import React, { useEffect, useMemo, useState } from "react";
import "../css/Evaluation.css";
import { useLocation, useSearchParams } from "react-router-dom";
import { interviewApi } from "../lib/api/interviewApi";

// 점수에 따라 컬러/라벨 반환 (UI용)
const getScoreColor = (score = 0) => {
  const s = Number(score) || 0;
  if (s >= 85) return "#16a34a"; // green
  if (s >= 70) return "#2563eb"; // blue
  if (s >= 55) return "#f59e0b"; // amber
  return "#ef4444";             // red
};

const getScoreLabel = (score = 0) => {
  const s = Number(score) || 0;
  if (s >= 85) return "매우 우수";
  if (s >= 70) return "우수";
  if (s >= 55) return "보통";
  return "개선 필요";
};

const clamp100 = (n) => Math.max(0, Math.min(100, Number(n) || 0));
const isPlainObject = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const asArray = (v) => (Array.isArray(v) ? v : []);
const hasItems = (arr) => Array.isArray(arr) && arr.length > 0;

const Evaluation = ({ evaluationData }) => {
  const [activeTab, setActiveTab] = useState("summary");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const location = useLocation();
  const [searchParams] = useSearchParams();
  const tabs = [
    { id: "summary", label: "요약", icon: "📌" },
    { id: "document", label: "문서", icon: "📄" },
    { id: "interview", label: "면접", icon: "🎤" },
    { id: "comparison", label: "비교", icon: "📊" },
    { id: "competency", label: "역량", icon: "🧭" },
  ];

  const EmptyBlock = ({ title = "데이터 없음", desc }) => (
    <div className="empty-card">
      <h3>{title}</h3>
      {desc && <p>{desc}</p>}
    </div>
  );

  // 1) sessionId 확보: navigate state 우선, 없으면 ?sessionId=
  const sessionId = useMemo(() => {
    const fromState = location?.state?.uploadResult?.sessionId;
    const fromQuery = searchParams.get("sessionId");
    return fromState ?? (fromQuery ? Number(fromQuery) : null);
  }, [location?.state, searchParams]);

  // 2) API 호출
  useEffect(() => {
    console.log("evaluationData exists?", !!evaluationData);
    let alive = true;

    // (선택) props로 들어오는 evaluationData가 있으면 그걸 우선 사용
    if (evaluationData) {
      setData(evaluationData);
      setLoading(false);
      return;
    }

    if (!sessionId) {
      setLoading(false);
      setErr("sessionId가 없습니다. 업로드 후 이동하거나, ?sessionId= 로 접근하세요.");
      return;
    }

    setLoading(true);
    setErr("");

    interviewApi
      .getResult(sessionId)
      .then((res) => {
        if (!alive) return;

        // ✅ 백엔드 응답: { voiceResult, evaluation }
        // ✅ 기존 UI(mock)는 { interviewInfo, summary, documentAnalysis, interviewAnalysis, comparison ... } 형태
        // → evaluation이 바로 그 구조라고 가정하고, UI에선 evaluation을 data로 쓰면 됨
        setData(res?.evaluation ?? null);
      })
      .catch((e) => {
        if (!alive) return;
        setErr(e?.response?.data?.message || e?.message || "결과 조회 실패");
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [sessionId, evaluationData]);

  // 3) 가드
  if (loading) return <div className="evaluation-container">로딩중...</div>;
  if (err) return <div className="evaluation-container">에러: {err}</div>;
  if (!data) return <div className="evaluation-container">데이터 없음</div>;

  const renderSummaryTab = () => {
    const summary = data?.summary;
    const info = data?.interviewInfo;

    if (!summary || !info) {
      return (
        <div className="tab-content">
          <EmptyBlock
            title="요약 데이터가 없습니다"
            desc={`누락: ${!summary ? "summary " : ""}${!info ? "interviewInfo" : ""}`.trim()}
          />
        </div>
      );
    }

    const overall = clamp100(summary?.overallScore);
    const prev = clamp100(summary?.previousScore);
    const avg = clamp100(summary?.passedAverage);

    const diffPrev = overall - prev;
    const diffAvg = overall - avg;

    const verdictTone = (v) => {
      if (v === "합격권") return "good";
      if (v === "개선필요") return "bad";
      return "neutral";
    };

    const kpis = [
      { label: "백분위", value: `상위 ${summary?.percentileRank ?? 0}%`, sub: "전체 대비", tone: "brand" },
      { label: "평균 답변", value: `${summary?.avgResponseTimeSec ?? 0}s`, sub: "응답 속도", tone: "neutral" },
      { label: "추임새", value: `${summary?.fillerWordRate ?? 0}%`, sub: "비중", tone: "neutral" },
      { label: "긍정도", value: `${summary?.sentimentScore ?? 0}%`, sub: "감정", tone: "neutral" },
      { label: "직무적합", value: `${summary?.jobFitIndex ?? 0}`, sub: "Index", tone: "brand" },
      { label: "자신감", value: `${summary?.confidenceIndex ?? 0}`, sub: "Index", tone: "brand" },
    ];

    const indexes = [
      { label: "기술", value: clamp100(summary?.technicalIndex) },
      { label: "커뮤니케이션", value: clamp100(summary?.communicationIndex) },
      { label: "직무적합", value: clamp100(summary?.jobFitIndex) },
    ];

    const topKeywords = asArray(summary?.topKeywords);
    const strengths = asArray(summary?.strengths);
    const weaknesses = asArray(summary?.weaknesses);

    return (
      <div className="tab-content">
        <div className="summaryTop">
          <div className="summaryTopLeft">
            <h2 className="summaryTitle">면접 종합 평가</h2>
            <div className="interview-info summaryInfoCompact">
              <span>📅 {info?.date ?? "-"}</span>
              <span>⏱️ {info?.duration ?? "-"}</span>
              <span>💼 {info?.position ?? "-"}</span>
              <span>🏢 {info?.company ?? "-"}</span>
            </div>
          </div>

          <div className="summaryTopRight">
            <span className={`badge badge-${verdictTone(summary?.verdict)}`}>
              {summary?.verdict ?? "판정 없음"}
            </span>
            <span className="badge badge-ghost">
              답변 {summary?.answeredQuestions ?? 0}/{summary?.totalQuestions ?? 0}
            </span>
          </div>
        </div>

        <div className="summaryGrid">
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
                      stroke: getScoreColor(overall),
                      strokeDasharray: `${(2 * Math.PI * 90 * overall) / 100} ${2 * Math.PI * 90}`,
                    }}
                  />
                </svg>
                <div className="score-text">
                  <div className="score-number scoreNumCompact">{overall}</div>
                  <div className="score-label">{getScoreLabel(overall)}</div>
                </div>
              </div>

              <div className="scoreDelta">
                <div className="deltaItem">
                  <span className="deltaLabel">이전 대비</span>
                  <span className={`deltaValue ${diffPrev >= 0 ? "pos" : "neg"}`}>
                    {diffPrev >= 0 ? `+${diffPrev}` : diffPrev}점
                  </span>
                </div>
                <div className="deltaItem">
                  <span className="deltaLabel">평균 대비</span>
                  <span className={`deltaValue ${diffAvg >= 0 ? "pos" : "neg"}`}>
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
                    <div className="indexFill" style={{ width: `${it.value}%` }} />
                  </div>
                  <span className="indexValue">{it.value}</span>
                </div>
              ))}
            </div>

            <div className="keywordStrip">
              <div className="keywordStripTitle">상위 키워드</div>
              <div className="keywords">
                {hasItems(topKeywords) ? (
                  topKeywords.map((kw, i) => (
                    <span key={i} className="keyword-tag">{kw}</span>
                  ))
                ) : (
                  <span className="muted">키워드 데이터 없음</span>
                )}
              </div>
            </div>
          </section>

          <section className="summaryCard summaryCardCompact">
            <div className="swCompact">
              <div className="swMini">
                <h3 className="swTitle">강점</h3>
                {hasItems(strengths) ? (
                  <ul className="swList">
                    {strengths.map((s, i) => (
                      <li key={i} className="swItem">
                        <span className="swDot">✓</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="muted">강점 데이터 없음</div>
                )}
              </div>

              <div className="swMini">
                <h3 className="swTitle">개선 포인트</h3>
                {hasItems(weaknesses) ? (
                  <ul className="swList">
                    {weaknesses.map((w, i) => (
                      <li key={i} className="swItem">
                        <span className="swDot">!</span>
                        {w}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="muted">개선 포인트 데이터 없음</div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  };

  const renderDocumentTab = () => {
    const da = data?.documentAnalysis;
    if (!da) {
      return (
        <div className="tab-content">
          <EmptyBlock title="문서 분석 데이터가 없습니다" desc="누락: documentAnalysis" />
        </div>
      );
    }

    const resume = da?.resume;
    const cover = da?.coverLetter;
    const pf = da?.portfolio;

    const renderDocCard = (title, score, sub) => (
      <div className="doc-score-card">
        <div className="doc-type">{title}</div>
        <div className="doc-score" style={{ color: getScoreColor(score ?? 0) }}>
          {score ?? 0}점
        </div>
        <div className="doc-match">{sub}</div>
      </div>
    );

    const renderNoDataCard = (title) => (
      <div className="doc-score-card">
        <div className="doc-type">{title}</div>
        <div className="muted">데이터 없음</div>
      </div>
    );

    return (
      <div className="tab-content">
        <h2>문서 분석 결과</h2>

        <div className="document-overview">
          {resume
            ? renderDocCard("📝 이력서", resume?.score, `매칭률: ${resume?.matchRate ?? 0}%`)
            : renderNoDataCard("📝 이력서")}

          {cover
            ? renderDocCard("✍️ 자기소개서", cover?.score, `일관성: ${cover?.consistency ?? 0}%`)
            : renderNoDataCard("✍️ 자기소개서")}

          {pf
            ? renderDocCard("💼 포트폴리오", pf?.score, `프로젝트: ${pf?.projectCount ?? 0}개`)
            : renderNoDataCard("💼 포트폴리오")}
        </div>

        <div className="document-details">
          {resume ? (
            <div className="doc-detail-card">
              <h3>📝 이력서 상세 분석</h3>

              <div className="keywords-section">
                <h4>핵심 키워드</h4>
                <div className="keywords">
                  {hasItems(resume?.keywords) ? (
                    asArray(resume?.keywords).map((k, i) => (
                      <span key={i} className="keyword-tag">{k}</span>
                    ))
                  ) : (
                    <span className="muted">키워드 데이터 없음</span>
                  )}
                </div>
              </div>

              <div className="analysis-section">
                <h4>✅ 강점</h4>
                {hasItems(resume?.strengths) ? (
                  <ul>{asArray(resume?.strengths).map((x, i) => <li key={i}>{x}</li>)}</ul>
                ) : (
                  <div className="muted">강점 데이터 없음</div>
                )}
              </div>

              <div className="analysis-section">
                <h4>💡 개선사항</h4>
                {hasItems(resume?.improvements) ? (
                  <ul>{asArray(resume?.improvements).map((x, i) => <li key={i}>{x}</li>)}</ul>
                ) : (
                  <div className="muted">개선사항 데이터 없음</div>
                )}
              </div>
            </div>
          ) : (
            <div className="doc-detail-card">
              <EmptyBlock title="이력서 분석이 없습니다" desc="누락: documentAnalysis.resume" />
            </div>
          )}

          {cover ? (
            <div className="doc-detail-card">
              <h3>✍️ 자기소개서 상세 분석</h3>

              <div className="metrics-grid">
                <div className="metric">
                  <div className="metric-label">일관성</div>
                  <div className="metric-bar">
                    <div className="metric-fill" style={{ width: `${clamp100(cover?.consistency)}%` }} />
                  </div>
                  <div className="metric-value">{cover?.consistency ?? 0}%</div>
                </div>

                <div className="metric">
                  <div className="metric-label">직무 관련성</div>
                  <div className="metric-bar">
                    <div className="metric-fill" style={{ width: `${clamp100(cover?.relevance)}%` }} />
                  </div>
                  <div className="metric-value">{cover?.relevance ?? 0}%</div>
                </div>
              </div>

              <div className="keywords-section">
                <h4>핵심 키워드</h4>
                <div className="keywords">
                  {hasItems(cover?.keywords) ? (
                    asArray(cover?.keywords).map((k, i) => (
                      <span key={i} className="keyword-tag secondary">{k}</span>
                    ))
                  ) : (
                    <span className="muted">키워드 데이터 없음</span>
                  )}
                </div>
              </div>

              <div className="analysis-section">
                <h4>💡 개선사항</h4>
                {hasItems(cover?.improvements) ? (
                  <ul>{asArray(cover?.improvements).map((x, i) => <li key={i}>{x}</li>)}</ul>
                ) : (
                  <div className="muted">개선사항 데이터 없음</div>
                )}
              </div>
            </div>
          ) : (
            <div className="doc-detail-card">
              <EmptyBlock title="자기소개서 분석이 없습니다" desc="누락: documentAnalysis.coverLetter" />
            </div>
          )}

          {pf ? (
            <div className="doc-detail-card">
              <h3>💼 포트폴리오 상세 분석</h3>

              <div className="portfolio-stats">
                <div className="portfolio-stat">
                  <span className="stat-number">{pf?.projectCount ?? 0}</span>
                  <span className="stat-text">프로젝트</span>
                </div>
                <div className="portfolio-stat">
                  <span className="stat-number">{pf?.technicalDepth ?? 0}</span>
                  <span className="stat-text">기술 깊이</span>
                </div>
              </div>

              <div className="analysis-section">
                <h4>⭐ 하이라이트</h4>
                {hasItems(pf?.highlights) ? (
                  <ul>{asArray(pf?.highlights).map((x, i) => <li key={i}>{x}</li>)}</ul>
                ) : (
                  <div className="muted">하이라이트 데이터 없음</div>
                )}
              </div>

              <div className="analysis-section">
                <h4>💡 개선사항</h4>
                {hasItems(pf?.improvements) ? (
                  <ul>{asArray(pf?.improvements).map((x, i) => <li key={i}>{x}</li>)}</ul>
                ) : (
                  <div className="muted">개선사항 데이터 없음</div>
                )}
              </div>
            </div>
          ) : (
            <div className="doc-detail-card">
              <EmptyBlock title="포트폴리오 분석이 없습니다" desc="누락: documentAnalysis.portfolio" />
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderInterviewTab = () => {
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
    const questionResponses = ia?.questionResponses;

    return (
      <div className="tab-content">
        <h2>면접 음성 및 답변 분석</h2>

        {/* 음성 분석 */}
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
                          style={{ width: `${v}%`, backgroundColor: getScoreColor(v) }}
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
            <EmptyBlock title="음성 분석 데이터가 없습니다" desc="누락: interviewAnalysis.voiceMetrics" />
          </div>
        )}

        {/* STT 분석 */}
        {isPlainObject(stt) ? (
          <div className="stt-analysis">
            <h3>📝 STT 분석</h3>

            <div className="stt-stats">
              <div className="stt-stat-card">
                <div className="stt-icon">💬</div>
                <div className="stt-value">{Number(stt?.totalWords ?? 0).toLocaleString()}</div>
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

            {/* 키워드 분포 */}
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
                    const percentage = total > 0 ? ((c / total) * 100).toFixed(1) : "0.0";

                    const labels = { technical: "기술", soft: "소프트스킬", company: "회사" };

                    return (
                      <div key={type} className="keyword-bar-item">
                        <div className="keyword-bar-label">{labels[type] ?? type}</div>
                        <div className="keyword-bar-container">
                          <div className="keyword-bar-fill" style={{ width: `${percentage}%` }} />
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
                <EmptyBlock title="키워드 사용 데이터가 없습니다" desc="누락: interviewAnalysis.sttAnalysis.keywordUsage" />
              </div>
            )}
          </div>
        ) : (
          <div className="stt-analysis">
            <EmptyBlock title="STT 분석 데이터가 없습니다" desc="누락: interviewAnalysis.sttAnalysis" />
          </div>
        )}

        {/* 질문별 답변 */}
        {Array.isArray(questionResponses) ? (
          <div className="question-responses">
            <h3>📋 질문별 답변 분석</h3>

            {questionResponses.length ? (
              questionResponses.map((item, idx) => {
                const score = clamp100(item?.score);
                const duration = Number(item?.duration) || 0;
                const response = item?.response ?? "";
                const feedback = item?.feedback ?? "";
                const question = item?.question ?? "";

                return (
                  <div key={idx} className="response-card">
                    <div className="response-header">
                      <span className="question-number">Q{idx + 1}</span>
                      <span className="question-text">{question}</span>
                      <span className="response-score" style={{ color: getScoreColor(score) }}>
                        {score}점
                      </span>
                    </div>

                    <div className="response-body">
                      <div className="response-preview">
                        {response ? `${response.substring(0, 100)}...` : "-"}
                      </div>
                      <div className="response-meta">
                        <span className="response-duration">
                          ⏱️ {Math.floor(duration / 60)}분 {duration % 60}초
                        </span>
                      </div>
                    </div>

                    <div className="response-feedback">
                      <span className="feedback-icon">💡</span>
                      <span className="feedback-text">{feedback || "-"}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="muted">질문별 답변 데이터가 없습니다</div>
            )}
          </div>
        ) : (
          <div className="question-responses">
            <EmptyBlock title="질문별 답변 데이터가 없습니다" desc="누락: interviewAnalysis.questionResponses" />
          </div>
        )}
      </div>
    );
  };

  const renderComparisonTab = () => {
    const comp = data?.comparison;
    if (!comp) {
      return (
        <div className="tab-content">
          <EmptyBlock title="비교 분석 데이터가 없습니다" desc="누락: comparison" />
        </div>
      );
    }

    const scoreHistory = comp?.scoreHistory;
    const categoryComparison = comp?.categoryComparison;
    const userScore = clamp100(data?.summary?.overallScore);

    const hasCategoryComparison = isPlainObject(categoryComparison);

    return (
      <div className="tab-content">
        <h2>성적 분포 및 비교 분석</h2>

        <div className="distribution-section">
          <h3>📊 지원자 점수 분포</h3>

          <div className="distribution-chart compact">
            <svg viewBox="0 0 600 220" className="dist-svg">
              <line x1="50" y1="180" x2="550" y2="180" stroke="#cbd5e1" strokeWidth="1.5" />
              <path d="M50 180 Q150 60 300 90 Q450 120 550 180" fill="none" stroke="#2563eb" strokeWidth="2" />
              <line x1="300" y1="180" x2="300" y2="85" stroke="#94a3b8" strokeDasharray="4 4" strokeWidth="1.5" />

              {(() => {
                const x = 50 + (userScore / 100) * 500;
                return (
                  <>
                    <line x1={x} y1="180" x2={x} y2="110" stroke="#2563eb" strokeWidth="1.5" />
                    <circle cx={x} cy="110" r="5" fill="#2563eb" />
                    <text x={x} y="95" textAnchor="middle" fontSize="12" fill="#2563eb" fontWeight="700">
                      {userScore}점
                    </text>
                  </>
                );
              })()}

              <text x="50" y="200" fontSize="11" fill="#64748b">0</text>
              <text x="300" y="200" fontSize="11" fill="#64748b" textAnchor="middle">평균</text>
              <text x="550" y="200" fontSize="11" fill="#64748b" textAnchor="end">100</text>
            </svg>
          </div>

          <div className="distribution-meta">
            전체 지원자 중 <strong>상위 {comp?.percentileRank ?? 0}%</strong>에 위치합니다.
          </div>
        </div>

        {/* scoreHistory */}
        {Array.isArray(scoreHistory) ? (
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
                    points={scoreHistory
                      .map((item, idx) => {
                        const x = 50 + idx * 250;
                        const y = 180 - clamp100(item?.score) * 1.6;
                        return `${x},${y}`;
                      })
                      .join(" ")}
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="2"
                  />

                  {scoreHistory.map((item, idx) => {
                    const x = 50 + idx * 250;
                    const score = clamp100(item?.score);
                    const y = 180 - score * 1.6;
                    const date = item?.date ?? "";
                    return (
                      <g key={idx}>
                        <circle cx={x} cy={y} r="4" fill="#2563eb" />
                        <text x={x} y={y - 12} textAnchor="middle" fontSize="12" fill="#2563eb" fontWeight="700">
                          {score}
                        </text>
                        <text x={x} y={200} textAnchor="middle" fontSize="11" fill="#64748b">
                          {date}
                        </text>
                      </g>
                    );
                  })}

                  {[0, 25, 50, 75, 100].map((val) => (
                    <text key={val} x="35" y={185 - val * 1.6} textAnchor="end" fontSize="11" fill="#6b7280">
                      {val}
                    </text>
                  ))}
                </svg>
              </div>
            </div>
          </div>
        ) : (
          <div className="score-history">
            <EmptyBlock title="성적 추이 데이터가 없습니다" desc="누락: comparison.scoreHistory" />
          </div>
        )}

        {/* categoryComparison */}
        {hasCategoryComparison ? (
          <div className="category-comparison">
            <h3>📊 카테고리별 비교</h3>

            <div className="vChart">
              {Object.entries(categoryComparison).map(([category, scores]) => {
                const labels = {
                  technical: "기술",
                  communication: "소통",
                  problemSolving: "문제해결",
                  attitude: "태도",
                  experience: "경험",
                };

                const s = isPlainObject(scores) ? scores : {};
                const bars = [
                  { key: "user", value: clamp100(s.user) },
                  { key: "average", value: clamp100(s.average) },
                  { key: "previous", value: clamp100(s.previous) },
                ];

                return (
                  <div key={category} className="vCol">
                    <div className="vBars">
                      {bars.map((b) => (
                        <div key={b.key} className={`vBarWrap ${b.key}`}>
                          <div className="vBarTrack">
                            <div className="vBar" style={{ height: `${b.value}%` }} />
                          </div>
                          <div className="vBarVal">{b.value}</div>
                        </div>
                      ))}
                    </div>

                    <div className="vLabel">{labels[category] ?? category}</div>
                  </div>
                );
              })}
            </div>

            <div className="vLegend">
              <div className="legend-item"><span className="legend-color user"></span><span>본인</span></div>
              <div className="legend-item"><span className="legend-color average"></span><span>평균</span></div>
              <div className="legend-item"><span className="legend-color previous"></span><span>이전</span></div>
            </div>
          </div>
        ) : (
          <div className="category-comparison">
            <EmptyBlock title="카테고리 비교 데이터가 없습니다" desc="누락: comparison.categoryComparison" />
          </div>
        )}
      </div>
    );
  };

  const renderCompetencyTab = () => {
    const comp = data?.competency;
    if (!comp) {
      return (
        <div className="tab-content">
          <EmptyBlock title="역량 데이터가 없습니다" desc="누락: competency" />
        </div>
      );
    }

    const tech = comp?.technical;
    const soft = comp?.soft;
    const improvements = comp?.improvements;

    const priorityLabel = (p) => (p === "high" ? "높음" : p === "low" ? "낮음" : "보통");

    return (
      <div className="tab-content">
        <h2>역량 분석 및 개선 방안</h2>

        <div className="competency-overview">
          {tech ? (
            <div className="competency-card">
              <h3>💻 기술 역량</h3>

              <div className="competency-score">
                <div className="score-display">
                  <span className="current-score">{tech?.current ?? 0}</span>
                  <span className="score-separator">/</span>
                  <span className="target-score">{tech?.target ?? 0}</span>
                </div>

                <div className="score-bar">
                  <div className="score-progress current" style={{ width: `${clamp100(tech?.current)}%` }} />
                  <div className="score-progress target" style={{ width: `${clamp100(tech?.target)}%` }} />
                </div>
              </div>

              <div className="competency-details">
                {hasItems(Object.entries(tech?.details ?? {})) ? (
                  Object.entries(tech?.details ?? {}).map(([key, value]) => {
                    const labels = {
                      frontEnd: "프론트엔드",
                      backEnd: "백엔드",
                      database: "데이터베이스",
                      deployment: "배포/운영",
                    };
                    const v = clamp100(value);

                    return (
                      <div key={key} className="detail-item">
                        <span className="detail-label">{labels[key] ?? key}</span>
                        <div className="detail-bar">
                          <div className="detail-fill" style={{ width: `${v}%` }} />
                        </div>
                        <span className="detail-value">{v}</span>
                      </div>
                    );
                  })
                ) : (
                  <div className="muted">세부 역량 데이터 없음</div>
                )}
              </div>
            </div>
          ) : (
            <div className="competency-card">
              <EmptyBlock title="기술 역량 데이터가 없습니다" desc="누락: competency.technical" />
            </div>
          )}

          {soft ? (
            <div className="competency-card">
              <h3>🤝 소프트 스킬</h3>

              <div className="competency-score">
                <div className="score-display">
                  <span className="current-score">{soft?.current ?? 0}</span>
                  <span className="score-separator">/</span>
                  <span className="target-score">{soft?.target ?? 0}</span>
                </div>

                <div className="score-bar">
                  <div className="score-progress current" style={{ width: `${clamp100(soft?.current)}%` }} />
                  <div className="score-progress target" style={{ width: `${clamp100(soft?.target)}%` }} />
                </div>
              </div>

              <div className="competency-details">
                {hasItems(Object.entries(soft?.details ?? {})) ? (
                  Object.entries(soft?.details ?? {}).map(([key, value]) => {
                    const labels = {
                      communication: "커뮤니케이션",
                      teamwork: "팀워크",
                      leadership: "리더십",
                      presentation: "발표력",
                    };
                    const v = clamp100(value);

                    return (
                      <div key={key} className="detail-item">
                        <span className="detail-label">{labels[key] ?? key}</span>
                        <div className="detail-bar">
                          <div className="detail-fill" style={{ width: `${v}%` }} />
                        </div>
                        <span className="detail-value">{v}</span>
                      </div>
                    );
                  })
                ) : (
                  <div className="muted">세부 역량 데이터 없음</div>
                )}
              </div>
            </div>
          ) : (
            <div className="competency-card">
              <EmptyBlock title="소프트 스킬 데이터가 없습니다" desc="누락: competency.soft" />
            </div>
          )}
        </div>

        {Array.isArray(improvements) ? (
          <div className="improvements-section">
            <h3>🎯 개선 계획</h3>

            {improvements.length ? (
              improvements.map((item, idx) => {
                const area = item?.area ?? "";
                const priority = item?.priority ?? "medium";
                const currentLevel = clamp100(item?.currentLevel);
                const targetLevel = clamp100(item?.targetLevel);
                const actionItems = asArray(item?.actionItems);

                return (
                  <div key={idx} className="improvement-card">
                    <div className="improvement-header">
                      <div className="improvement-title">
                        <span className="improvement-area">{area}</span>
                        <span className={`priority-badge ${priority}`}>{priorityLabel(priority)}</span>
                      </div>

                      <div className="improvement-progress">
                        <span className="progress-label">
                          {currentLevel} → {targetLevel}
                        </span>
                      </div>
                    </div>

                    <div className="improvement-bar">
                      <div className="improvement-current" style={{ width: `${currentLevel}%` }} />
                      <div className="improvement-target" style={{ left: `${targetLevel}%` }}>
                        <span className="target-marker">🎯</span>
                      </div>
                    </div>

                    <div className="improvement-actions">
                      <h4>실행 항목</h4>
                      {hasItems(actionItems) ? (
                        <ul>
                          {actionItems.map((action, i) => (
                            <li key={i}>
                              <span className="action-bullet">▸</span>
                              {action}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="muted">실행 항목 데이터 없음</div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="muted">개선 계획 데이터가 없습니다</div>
            )}
          </div>
        ) : (
          <div className="improvements-section">
            <EmptyBlock title="개선 계획 데이터가 없습니다" desc="누락: competency.improvements" />
          </div>
        )}
      </div>
    );
  };

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
