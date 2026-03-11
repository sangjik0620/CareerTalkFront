import React, { useEffect, useMemo, useRef, useState } from "react";
import "../css/Evaluation.css";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { interviewApi } from "../lib/api/interviewApi";
import EvaluationReport from "./evaluation/EvaluationReport";
import { useReactToPrint } from "react-to-print";

import SummaryTab from "./evaluation/tabs/SummaryTab";
import DocumentTab from "./evaluation/tabs/DocumentTab";
import InterviewTab from "./evaluation/tabs/InterviewTab";
import ComparisonTab from "./evaluation/tabs/ComparisonTab";
import CompetencyTab from "./evaluation/tabs/CompetencyTab";
import EvaluationLoading from "./evaluation/components/EvaluationLoading";

/* ── SVG icon helpers (no dependency) ── */
const Icon = {
  Summary: () => (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
    </svg>
  ),
  Document: () => (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  ),
  Interview: () => (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 1a3 3 0 000 6 3 3 0 000-6z" />
      <path d="M19 10H5a2 2 0 00-2 2v1a7 7 0 0014 0v-1a2 2 0 00-2-2z" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  ),
  Comparison: () => (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  Competency: () => (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  Export: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
};

const TABS = [
  { id: "summary", label: "요약", IconComp: Icon.Summary },
  { id: "document", label: "문서", IconComp: Icon.Document },
  { id: "interview", label: "면접", IconComp: Icon.Interview },
  { id: "comparison", label: "비교", IconComp: Icon.Comparison },
  { id: "competency", label: "역량", IconComp: Icon.Competency },
];

const Evaluation = ({ evaluationData }) => {
  const [activeTab, setActiveTab] = useState("summary");

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [analysisStatus, setAnalysisStatus] = useState("PENDING");
  const [phase, setPhase] = useState("BOOTSTRAP");

  const [docLoading, setDocLoading] = useState(false);
  const [docErr, setDocErr] = useState("");
  const [docAnalysisMap, setDocAnalysisMap] = useState({});

  const doneTimerRef = useRef(null);
  const reportPrintRef = useRef(null);

  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [turns, setTurns] = useState([]);
  const navigate = useNavigate();

  // 1) sessionId 확보
  const sessionId = useMemo(() => {
    const fromState = location?.state?.uploadResult?.sessionId;
    const fromQuery = searchParams.get("sessionId");
    return fromState ?? (fromQuery ? Number(fromQuery) : null);
  }, [location?.state, searchParams]);

  // pdf 다운로드 함수
  const handleExportPdf = useReactToPrint({
    contentRef: reportPrintRef, // ✅ 핵심 (ref 자체 전달)
    documentTitle: `면접평가리포트_${sessionId ?? "no-session"}`,
    onPrintError: (err) => console.error("[print] error:", err),

    // 프린트 전에 렌더 안정화(차트/폰트 반영)
    onBeforePrint: async () => {
      // console.log("[print] beforePrint, ref:", reportPrintRef.current);
      await new Promise((r) => setTimeout(r, 50));
    },
  });

  useEffect(() => {
    setDocAnalysisMap({});
    setDocErr("");
    setDocLoading(false);
  }, [sessionId]);

  const fetchDocAnalysesMap = async (sid) => {
    const targets = await interviewApi.getSessionTargets(sid);
    const analysisIds = (targets || [])
      .map((t) => t.analysisId)
      .filter(Boolean);
    if (!analysisIds.length) return {};
    const analyses = await interviewApi.getAnalysesByIds(analysisIds);
    const map = {};
    (analyses || []).forEach((a) => {
      map[a.targetType] = a;
    });
    return map;
  };

  useEffect(() => {
    let alive = true;
    let pollTimer = null;
    let analyzeRequested = false;

    const clearTimers = () => {
      if (pollTimer) window.clearTimeout(pollTimer);
      if (doneTimerRef.current) window.clearTimeout(doneTimerRef.current);
    };

    const applyResultData = (res) => {
      setData(res ?? null);
      setTurns(res?.turns ?? []);
      setPhase("SHOW_RESULT");
    };

    const tryFetchResult = async () => {
      const res = await interviewApi.getResult(sessionId);
      if (!alive) return { done: false };

      // getResult가 결과 객체를 바로 주는 경우
      const hasResultPayload =
        !!res &&
        (Array.isArray(res?.turns) ||
          !!res?.summary ||
          !!res?.interviewAnalysis ||
          !!res?.comparison ||
          !!res?.competencyAnalysis);

      if (hasResultPayload) {
        applyResultData(res);
        setLoading(false);
        return { done: true };
      }

      // getResult가 axios response 형태를 주는 경우까지 방어
      if (res?.status === 200 && res?.data) {
        applyResultData(res.data);
        setLoading(false);
        return { done: true };
      }

      return { done: false, raw: res };
    };

    const pollResultUntilDone = async () => {
      try {
        const resultState = await tryFetchResult();
        if (!alive) return;

        if (resultState.done) {
          return;
        }

        setPhase("ANALYZING");
        setLoading(true);

        pollTimer = window.setTimeout(pollResultUntilDone, 1200);
      } catch (e) {
        if (!alive) return;

        const status = e?.response?.status;
        const message =
          e?.response?.data?.message || e?.message || "결과 조회 실패";

        // 202 / 404 류는 아직 결과 준비 전으로 보고 계속 진행
        if (status === 202 || status === 404) {
          setPhase("ANALYZING");
          setLoading(true);

          if (!analyzeRequested) {
            analyzeRequested = true;
            try {
              await interviewApi.startAnalysis(sessionId);
            } catch (analyzeError) {
              if (!alive) return;
              setErr(
                analyzeError?.response?.data?.message ||
                  analyzeError?.message ||
                  "분석 요청 실패",
              );
              setLoading(false);
              return;
            }
          }

          pollTimer = window.setTimeout(pollResultUntilDone, 1200);
          return;
        }

        setErr(message);
        setLoading(false);
      }
    };

    const bootstrap = async () => {
      try {
        setErr("");
        setLoading(true);
        setAnalysisStatus("PENDING");

        if (evaluationData) {
          applyResultData(evaluationData);
          setLoading(false);
          return;
        }

        if (!sessionId) {
          setErr(
            "sessionId가 없습니다. 업로드 후 이동하거나 ?sessionId= 로 접근하세요.",
          );
          setLoading(false);
          return;
        }

        await pollResultUntilDone();
      } catch (e) {
        if (!alive) return;
        setErr(e?.response?.data?.message ?? e?.message ?? "결과 조회 실패");
        setLoading(false);
      }
    };

    bootstrap();

    return () => {
      alive = false;
      clearTimers();
    };
  }, [sessionId, evaluationData]);

  useEffect(() => {
    if (!sessionId || !data) return;
    if (Object.keys(docAnalysisMap || {}).length > 0) return;
    let alive = true;
    (async () => {
      try {
        const map = await fetchDocAnalysesMap(sessionId);
        if (!alive) return;
        setDocAnalysisMap(map);
      } catch (e) {
        console.error("document prefetch failed:", e);
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, data]);

  useEffect(() => {
    if (activeTab !== "document") return;
    if (!sessionId || !data) return;
    if (Object.keys(docAnalysisMap || {}).length > 0) return;
    let alive = true;
    setDocLoading(true);
    setDocErr("");
    (async () => {
      try {
        const map = await fetchDocAnalysesMap(sessionId);
        if (!alive) return;
        setDocAnalysisMap(map);
      } catch (e) {
        if (!alive) return;
        setDocErr("문서 분석 데이터를 불러오지 못했습니다.");
        setDocAnalysisMap({});
      } finally {
        if (alive) setDocLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [activeTab, sessionId, data]);

  /* ── Guards ── */
  // 결과 조회 시작 직후(BOOTSTRAP/FETCH_RESULT)에는 화면을 비워두고 기다림
  if (loading && !data && phase !== "ANALYZING") {
    return null;
  }

  // 실제 분석 진행 중일 때만 로딩 UI 표시
  if (loading && phase === "ANALYZING") {
    return <EvaluationLoading analysisStatus={analysisStatus} />;
  }

  // 에러 발생
  if (err) {
    return (
      <div
        className="evaluation-container"
        style={{
          paddingTop: "4rem",
          textAlign: "center",
          color: "#ef4444",
        }}
      >
        ⚠️ {err}
      </div>
    );
  }

  // 결과가 없는 경우
  if (!data) {
    return (
      <div
        className="evaluation-container"
        style={{
          paddingTop: "4rem",
          textAlign: "center",
          color: "#94a3b8",
        }}
      >
        데이터가 없습니다.
      </div>
    );
  }

  return (
    <>
      <div className="evaluation-container">
        {/* ── Header ── */}
        <div className="evaluation-header">
          <h1>면접 평가 결과</h1>
          <div className="header-actions">
            <button
              className="export-btn"
              onClick={() => {
                console.log("handleExportPdf type:", typeof handleExportPdf);
                handleExportPdf?.();
              }}
            >
              <Icon.Export />
              PDF 내보내기
            </button>
            <button className="home-btn" onClick={() => navigate("/")}>
              홈으로
            </button>
          </div>
        </div>

        {/* ── Tab Nav ── */}
        <div className="tabs">
          {TABS.map(({ id, label, IconComp }) => (
            <button
              key={id}
              className={`tab${activeTab === id ? " active" : ""}`}
              onClick={() => setActiveTab(id)}
            >
              <span className="tab-icon">
                <IconComp />
              </span>
              <span className="tab-label">{label}</span>
            </button>
          ))}
        </div>

        {/* ── Content ── */}
        <div className="tab-content-wrapper">
          {activeTab === "summary" && <SummaryTab data={data} />}
          {activeTab === "document" && (
            <DocumentTab
              docLoading={docLoading}
              docErr={docErr}
              docAnalysisMap={docAnalysisMap}
            />
          )}
          {activeTab === "interview" && (
            <InterviewTab data={data} turns={turns} />
          )}
          {activeTab === "comparison" && <ComparisonTab data={data} />}
          {activeTab === "competency" && <CompetencyTab data={data} />}
        </div>
        {/* --- Print/PDF 전용 리포트 DOM (화면에서는 숨김) --- */}
        <div className="evaluation-container screen-only">
          <div className="print-root" aria-hidden="true">
            <div ref={reportPrintRef}>
              <EvaluationReport
                data={data}
                turns={turns}
                docLoading={docLoading}
                docErr={docErr}
                docAnalysisMap={docAnalysisMap}
                sessionId={sessionId}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Evaluation;
