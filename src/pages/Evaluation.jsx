import React, { useEffect, useMemo, useRef, useState } from "react";
import "../css/Evaluation.css";
import { useLocation, useSearchParams } from "react-router-dom";
import { interviewApi } from "../lib/api/interviewApi";

import SummaryTab from "./evaluation/tabs/SummaryTab";
import DocumentTab from "./evaluation/tabs/DocumentTab";
import InterviewTab from "./evaluation/tabs/InterviewTab";
import ComparisonTab from "./evaluation/tabs/ComparisonTab";
import CompetencyTab from "./evaluation/tabs/CompetencyTab";
import EvaluationLoading from "./evaluation/components/EvaluationLoading";

const Evaluation = ({ evaluationData }) => {
  const [activeTab, setActiveTab] = useState("summary");

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [analysisStatus, setAnalysisStatus] = useState("PENDING"); // PENDING/PROCESSING/DONE/FAILED
  const [phase, setPhase] = useState("ANALYZING"); // ANALYZING | DONE_SPLASH | FETCH_RESULT | SHOW_RESULT

  const [docLoading, setDocLoading] = useState(false);
  const [docErr, setDocErr] = useState("");
  const [docAnalysisMap, setDocAnalysisMap] = useState({});

  const doneTimerRef = useRef(null);

  const location = useLocation();
  const [searchParams] = useSearchParams();

  const tabs = [
    { id: "summary", label: "요약", icon: "📌" },
    { id: "document", label: "문서", icon: "📄" },
    { id: "interview", label: "면접", icon: "🎤" },
    { id: "comparison", label: "비교", icon: "📊" },
    { id: "competency", label: "역량", icon: "🧭" },
  ];

  // 1) sessionId 확보
  const sessionId = useMemo(() => {
    const fromState = location?.state?.uploadResult?.sessionId;
    const fromQuery = searchParams.get("sessionId");
    return fromState ?? (fromQuery ? Number(fromQuery) : null);
  }, [location?.state, searchParams]);

  // 2) sessionId 바뀌면 문서 캐시 초기화
  useEffect(() => {
    setDocAnalysisMap({});
    setDocErr("");
    setDocLoading(false);
  }, [sessionId]);

  // 문서 분석 로드(공통 함수) - 프리패치/탭진입 로드에서 같이 사용
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

  // 3) 분석 시작 + 폴링
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

        // 분석 시작 (백엔드 비동기라면 즉시 반환)
        await interviewApi.startAnalysis(sessionId);

        const poll = async () => {
          const res = await interviewApi.getAnalysisStatus(sessionId);
          const st = res?.data?.status ?? "PENDING";
          if (!alive) return;

          setAnalysisStatus(st);

          if (st === "DONE") {
            setPhase("DONE_SPLASH");
            setLoading(true);

            // ✅ 완료 화면 1초 보여준 뒤 결과 fetch 단계로 전환
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

          // 계속 분석중
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
      if (pollTimer) window.clearTimeout(pollTimer);
      if (doneTimerRef.current) window.clearTimeout(doneTimerRef.current);
    };
  }, [sessionId]);

  // 4) 결과 조회 (DONE_SPLASH 이후 FETCH_RESULT 단계에서만 실행)
  useEffect(() => {
    let alive = true;

    // props로 결과가 들어오면 우선 사용
    if (evaluationData) {
      setData(evaluationData);
      setLoading(false);
      setPhase("SHOW_RESULT");
      return () => {
        alive = false;
      };
    }

    if (!sessionId) {
      setLoading(false);
      setErr(
        "sessionId가 없습니다. 업로드 후 이동하거나, ?sessionId= 로 접근하세요.",
      );
      return () => {
        alive = false;
      };
    }

    if (phase !== "FETCH_RESULT") {
      return () => {
        alive = false;
      };
    }

    setLoading(true);
    setErr("");

    interviewApi
      .getResult(sessionId)
      .then((res) => {
        if (!alive) return;
        setData(res?.evaluation ?? null);
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

    return () => {
      alive = false;
    };
  }, [sessionId, evaluationData, phase]);

  // 5) 문서 분석 프리패치 (결과(data) 준비되면 백그라운드로 한 번 당겨오기)
  useEffect(() => {
    if (!sessionId || !data) return;

    // 이미 있으면 프리패치 스킵
    if (Object.keys(docAnalysisMap || {}).length > 0) return;

    let alive = true;

    (async () => {
      try {
        // console.log("[prefetch] start", sessionId);

        const map = await fetchDocAnalysesMap(sessionId);
        if (!alive) return;
        // console.log("[prefetch] done", Object.keys(map).length);
        setDocAnalysisMap(map);
      } catch (e) {
        // 프리패치 실패는 치명적이지 않음 (탭 진입 시 다시 시도 가능)
        console.error("document prefetch failed:", e);
      }
    })();

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, data]);

  // 6) 문서탭 진입 시 로드 (프리패치 실패/지연 대비 fallback)
  useEffect(() => {
    if (activeTab !== "document") return;
    if (!sessionId || !data) return;

    console.log("[document tab] fetch start");

    // 프리패치가 채워놨으면 로딩/재요청 스킵
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, sessionId, data]);

  // 7) 가드(UI)
  if (loading) {
    // DONE_SPLASH는 무조건 DONE UI
    if (phase === "DONE_SPLASH")
      return <EvaluationLoading analysisStatus="DONE" />;

    // 그 외는 현재 분석상태 기반(결과 fetch 동안도 기존 상태로 그냥 표시)
    return <EvaluationLoading analysisStatus={analysisStatus} />;
  }

  if (err) return <div className="evaluation-container">에러: {err}</div>;
  if (!data) return <div className="evaluation-container">데이터 없음</div>;

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
        {activeTab === "summary" && <SummaryTab data={data} />}
        {activeTab === "document" && (
          <DocumentTab
            docLoading={docLoading}
            docErr={docErr}
            docAnalysisMap={docAnalysisMap}
          />
        )}
        {activeTab === "interview" && <InterviewTab data={data} />}
        {activeTab === "comparison" && <ComparisonTab data={data} />}
        {activeTab === "competency" && <CompetencyTab data={data} />}
      </div>
    </div>
  );
};

export default Evaluation;
