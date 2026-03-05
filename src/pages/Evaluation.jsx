import React, { useEffect, useMemo, useRef, useState } from "react";
import "../css/Evaluation.css";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { interviewApi } from "../lib/api/interviewApi";

import SummaryTab    from "./evaluation/tabs/SummaryTab";
import DocumentTab   from "./evaluation/tabs/DocumentTab";
import InterviewTab  from "./evaluation/tabs/InterviewTab";
import ComparisonTab from "./evaluation/tabs/ComparisonTab";
import CompetencyTab from "./evaluation/tabs/CompetencyTab";
import EvaluationLoading from "./evaluation/components/EvaluationLoading";

/* ── SVG icon helpers (no dependency) ── */
const Icon = {
  Summary:    () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
    </svg>
  ),
  Document:   () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
    </svg>
  ),
  Interview:  () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 000 6 3 3 0 000-6z"/><path d="M19 10H5a2 2 0 00-2 2v1a7 7 0 0014 0v-1a2 2 0 00-2-2z"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8"  y1="23" x2="16" y2="23"/>
    </svg>
  ),
  Comparison: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6"  y1="20" x2="6"  y2="14"/>
    </svg>
  ),
  Competency: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  Export: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  ),
};

const TABS = [
  { id: "summary",    label: "요약",   IconComp: Icon.Summary    },
  { id: "document",   label: "문서",   IconComp: Icon.Document   },
  { id: "interview",  label: "면접",   IconComp: Icon.Interview  },
  { id: "comparison", label: "비교",   IconComp: Icon.Comparison },
  { id: "competency", label: "역량",   IconComp: Icon.Competency },
];

const Evaluation = ({ evaluationData }) => {
  const [activeTab, setActiveTab] = useState("summary");

  const [data, setData]                   = useState(null);
  const [loading, setLoading]             = useState(true);
  const [err, setErr]                     = useState("");

  const [analysisStatus, setAnalysisStatus] = useState("PENDING");
  const [phase, setPhase]                   = useState("ANALYZING");

  const [docLoading, setDocLoading]       = useState(false);
  const [docErr, setDocErr]               = useState("");
  const [docAnalysisMap, setDocAnalysisMap] = useState({});

  const doneTimerRef = useRef(null);
  const location     = useLocation();
  const [searchParams] = useSearchParams();

  const [turns, setTurns] = useState([]);
  const navigate = useNavigate();

  // 1) sessionId 확보
  const sessionId = useMemo(() => {
    const fromState = location?.state?.uploadResult?.sessionId;
    const fromQuery = searchParams.get("sessionId");
    return fromState ?? (fromQuery ? Number(fromQuery) : null);
  }, [location?.state, searchParams]);

  useEffect(() => {
    setDocAnalysisMap({});
    setDocErr("");
    setDocLoading(false);
  }, [sessionId]);

  const fetchDocAnalysesMap = async (sid) => {
    const targets    = await interviewApi.getSessionTargets(sid);
    const analysisIds = (targets || []).map((t) => t.analysisId).filter(Boolean);
    if (!analysisIds.length) return {};
    const analyses = await interviewApi.getAnalysesByIds(analysisIds);
    const map = {};
    (analyses || []).forEach((a) => { map[a.targetType] = a; });
    return map;
  };

  useEffect(() => {
    if (!sessionId) return;
    let alive = true;
    let pollTimer = null;

    const startAndPoll = async () => {
      try {
        setErr("");
        setLoading(true);
        setPhase("ANALYZING");
        setAnalysisStatus("PENDING");

        await interviewApi.startAnalysis(sessionId);

        const poll = async () => {
          const res = await interviewApi.getAnalysisStatus(sessionId);
          const st  = res?.data?.status ?? "PENDING";
          if (!alive) return;
          setAnalysisStatus(st);

          if (st === "DONE") {
            setPhase("DONE_SPLASH");
            setLoading(true);
            if (doneTimerRef.current) window.clearTimeout(doneTimerRef.current);
            doneTimerRef.current = window.setTimeout(() => {
              if (!alive) return;
              setPhase("FETCH_RESULT");
            }, 1000);
            return;
          }
          if (st === "FAILED") {
            setErr("분석에 실패했습니다.");
            setLoading(false);
            return;
          }
          setPhase("ANALYZING");
          setLoading(true);
          pollTimer = window.setTimeout(poll, 1200);
        };

        await poll();
      } catch (e) {
        if (!alive) return;
        setErr(e?.response?.data?.message ?? e?.message ?? "분석 요청 실패");
        setLoading(false);
      }
    };

    startAndPoll();
    return () => {
      alive = false;
      if (pollTimer)           window.clearTimeout(pollTimer);
      if (doneTimerRef.current) window.clearTimeout(doneTimerRef.current);
    };
  }, [sessionId]);

  useEffect(() => {
    let alive = true;

    if (evaluationData) {
      setData(evaluationData);
      setLoading(false);
      setPhase("SHOW_RESULT");
      return () => { alive = false; };
    }

    if (!sessionId) {
      setLoading(false);
      setErr("sessionId가 없습니다. 업로드 후 이동하거나 ?sessionId= 로 접근하세요.");
      return () => { alive = false; };
    }

    if (phase !== "FETCH_RESULT") return () => { alive = false; };

    setLoading(true);
    setErr("");

    interviewApi
      .getResult(sessionId)
      .then((res) => {
        if (!alive) return;
        setData(res?.evaluation ?? null);
        setTurns(res?.turns ?? []);
        setPhase("SHOW_RESULT");
      })
      .catch((e) => {
        if (!alive) return;
        setErr(e?.response?.data?.message || e?.message || "결과 조회 실패");
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });

    return () => { alive = false; };
  }, [sessionId, evaluationData, phase]);

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
    return () => { alive = false; };
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
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, sessionId, data]);

  /* ── Guards ── */
  if (loading) {
    if (phase === "DONE_SPLASH")
      return <EvaluationLoading analysisStatus="DONE" />;
    return <EvaluationLoading analysisStatus={analysisStatus} />;
  }

  if (err)   return <div className="evaluation-container" style={{ paddingTop: "4rem", textAlign: "center", color: "#ef4444" }}>⚠️ {err}</div>;
  if (!data) return <div className="evaluation-container" style={{ paddingTop: "4rem", textAlign: "center", color: "#94a3b8" }}>데이터가 없습니다.</div>;

  return (
    <div className="evaluation-container">
      {/* ── Header ── */}
      <div className="evaluation-header">
        <h1>면접 평가 결과</h1>
        <div className="header-actions">
          <button className="export-btn">
            <Icon.Export />
            PDF 내보내기
          </button>
          <button className="home-btn" onClick={()=>navigate("/")}>
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
            <span className="tab-icon"><IconComp /></span>
            <span className="tab-label">{label}</span>
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      <div className="tab-content-wrapper">
        {activeTab === "summary"    && <SummaryTab data={data} />}
        {activeTab === "document"   && (
          <DocumentTab
            docLoading={docLoading}
            docErr={docErr}
            docAnalysisMap={docAnalysisMap}
          />
        )}
        {activeTab === "interview" && <InterviewTab data={data} turns={turns} />}
        {activeTab === "comparison" && <ComparisonTab data={data} />}
        {activeTab === "competency" && <CompetencyTab data={data} />}
      </div>
    </div>
  );
};

export default Evaluation;
